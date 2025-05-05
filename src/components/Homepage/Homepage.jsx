import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.00");
  const [balanceInDollars, setBalanceInDollars] = useState("0.00");
  const [tokens, setTokens] = useState([]);
  const [copied, setCopied]= useState(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet");
    if (storedWallet) {
      const parsedWallet = JSON.parse(storedWallet);
      setWalletAddress(parsedWallet.address);
      fetchWalletData(parsedWallet.address);
    } else {
      navigate("/");
    }
  }, []);

  const fetchWalletData = async (address) => {
    const { ethBalance, balanceInDollars } = await getEthBalance(address);
    setEthBalance(ethBalance);
    setBalanceInDollars(balanceInDollars);

    const tokenData = await getTokens(address);
    setTokens(tokenData);
  };

  const getEthBalance = async (walletAddress) => {
    const apiKey = import.meta.VITE_API_KEY_ETHERSCAN;
    const url = `https://api-sepolia.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1") {
      const ethBalance = ethers.formatEther(data.result);

      const ethPriceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum.usd;

      return {
        ethBalance,
        balanceInDollars: (parseFloat(ethBalance) * ethPrice).toFixed(2),
      };
    } else {
      return { ethBalance: "0.00", balanceInDollars: "0.00" };
    }
  };

  const getTokens = async (walletAddress) => {
    const apiKey = import.meta.VITE_API_KEY_ETHERSCAN;
    const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&page=1&offset=100&sort=desc&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1") {
      const tokenBalances = {};

      data.result.forEach((tx) => {
        const tokenSymbol = tx.tokenSymbol;
        const tokenDecimals = parseInt(tx.tokenDecimal);
        const tokenBalance = ethers.formatUnits(tx.value, tokenDecimals);

        if (!tokenBalances[tokenSymbol]) {
          tokenBalances[tokenSymbol] = {
            name: tx.tokenName,
            symbol: tokenSymbol,
            balance: 0,
          };
        }

        tokenBalances[tokenSymbol].balance += parseFloat(tokenBalance);
      });

      return Object.values(tokenBalances);
    } else {
      return [];
    }
  };

  const shortenAddress = (address) => {
    if (!address) return "Loading..."; // Prevents calling slice() on undefined
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = async (address) => {
    try {
      await navigator.clipboard.writeText(address); // Copy to clipboard
      setCopied(true); // Set copied status to true
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="homepage">
      <div className="header">
        <img className="avatar" src="/react.svg" alt="avatar" />
        <p onClick={()=> handleCopy(walletAddress)}>{walletAddress ? shortenAddress(walletAddress) : "Loading..."}</p>

        <img
          className="options"
          src="/logout.png"
          alt="options"
          onClick={() => {
            localStorage.removeItem("wallet");
            window.location.reload();
          }}
        />
      </div>
      <div className="center">
        <div className="balance">
          <p className="total">${balanceInDollars}</p>
          <p className="totalText">Total Balance</p>
        </div>
        <div className="mainButtons">
          <div className="send" onClick={() => navigate("/send")}>
            <img src="/send (1).png" alt="send" />
            <p className="buttonText">Send</p>
          </div>
          <div className="recieve" onClick={() => navigate("/recieve")}>
            <img src="/qr.png" alt="receive" />
            <p className="buttonText">Receive</p>
          </div>
          <div className="share" onClick={() => navigate("/share")}>
            <img src="/link.png" alt="share" />
            <p className="buttonText">History</p>
          </div>
        </div>
      </div>
      <hr />
      <div className="availableTokens">
        <p>Available Tokens</p>

        <div className="token">
            <p className="tokenName">
              SEPOLIA (sepETH)
            </p>
            <p className="tokenValue">{ethBalance}</p>
          </div>

        {tokens.map((token, index) => (
          <div className="token" key={index}>
            <p className="tokenName">
              {token.name} ({token.symbol})
            </p>
            <p className="tokenValue">{token.balance}</p>
          </div>
        ))}
      </div>

      <p className={`copy-msg ${copied ? 'show' : ''}`}>Address copied!</p>

    </div>
  );
};

export default Homepage;
