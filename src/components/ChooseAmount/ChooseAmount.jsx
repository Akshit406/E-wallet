import React, { useEffect, useState } from "react";
import "./ChooseAmount.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchTokens,
  sendTokens,
  hasEnoughGas,
  estimateGasFees,
  sendETH,
} from "../../lib/sendToken";
import { ethers } from "ethers";

const ChooseAmount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toAddress } = location.state || {};

  const wallet = JSON.parse(localStorage.getItem("wallet")) || {};
  const senderAddress = wallet.address || "";

  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [gasFee, setGasFee] = useState(null); // Will be used to store the gas fee estimate
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch tokens and native ETH balance
  useEffect(() => {
    const fetchAndSetTokens = async () => {
      if (!senderAddress) return;

      try {
        const fetchedTokens = await fetchTokens(senderAddress);

        // Get Sepolia ETH balance
        const ethBalance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [senderAddress, "latest"],
        });
        const formattedEth = parseFloat(
          ethers.formatEther(ethBalance)
        ).toFixed(4);

        const fullTokenList = [
          {
            symbol: "sepETH",
            balance: formattedEth,
            contractAddress: "ETH", // special ID
          },
          ...fetchedTokens,
        ];

        setTokens(fullTokenList);
        setSelectedToken("ETH");
        setBalance(formattedEth);
      } catch (err) {
        console.error("Error fetching tokens:", err);
        setError("Failed to fetch tokens.");
      }
    };

    fetchAndSetTokens();
  }, [senderAddress]);

  // Estimate gas fee
  useEffect(() => {
    const fetchGasFee = async () => {
      if (selectedToken && toAddress && amount) {
        setGasFee(null); 

        try {
          const gas = await estimateGasFees();
          if (gas) {
            setGasFee(gas); // Successfully set the gas fee
          } else {
            setGasFee("Unable to fetch gas fee"); // If no gas fee received
          }
        } catch (err) {
          console.error("Failed to fetch gas estimate:", err);
          setGasFee("Error fetching gas fee"); // Set error if estimation fails
        }
      }
    };

    fetchGasFee();
  }, [selectedToken, toAddress, amount]);

  // Update balance when selected token changes
  useEffect(() => {
    const token = tokens.find((t) => t.contractAddress === selectedToken);
    setBalance(token?.balance || 0);
  }, [selectedToken, tokens]);

  const validateAmount = async () => {
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return false;
    }

    if (numericAmount > balance) {
      setError("Insufficient balance.");
      return false;
    }

    const gasCheck = await hasEnoughGas(senderAddress);
    if (!gasCheck.valid) {
      setError(gasCheck.message);
      return false;
    }

    setError("");
    return true;
  };

  const handleSend = async () => {
    if (!(await validateAmount())) return;

    try {
      setIsSending(true);

      let txHash = null;

      if (selectedToken === "ETH") {
        txHash = await sendETH(toAddress, amount);
      } else {
        txHash = await sendTokens(toAddress, amount, selectedToken);
      }

      if (txHash) {
        alert(`Transaction Successful! Hash: ${txHash}`);
        navigate("/homepage");
      }
    } catch (err) {
      console.error("Transaction error:", err);
      alert("Transaction failed: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="ChooseAmount">
      <div className="header">
      <p>Sending to: {`${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`}</p>

      </div>

      <div className="center">
        <div className="from">
          <p>Select token</p>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            {tokens.length > 0 ? (
              tokens.map((token) => (
                <option key={token.contractAddress} value={token.contractAddress}>
                  {token.symbol} ({token.balance})
                </option>
              ))
            ) : (
              <option value="">Loading...</option>
            )}
          </select>
        </div>

        <p className="gasFeeEstimate">
          Gas Fee Estimate:{" "}
          {gasFee ? (
            typeof gasFee === "string" ? (
              gasFee // Display error message or fallback text
            ) : (
              `${gasFee.average} Gwei`
            )
          ) : (
            "Calculating..."
          )}
        </p>

        <div className="to">
          <p>Enter amount</p>
          <input
            type="number"
            step="any"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="errorMessage" style={{ color: "red" }}>{error}</p>}

      <div className="footerButtons">
        <button
          className="continue"
          onClick={handleSend}
          disabled={!!error || isSending || !amount}
        >
          {isSending ? "Sending..." : "Send"}
        </button>

        <div className="cancel" onClick={() => navigate("/homepage")}>
          Cancel
        </div>
      </div>
    </div>
  );
};

export default ChooseAmount;
