import React, { useEffect, useState } from "react";
import "./Transactions.css";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet");
    if (storedWallet) {
      const parsedWallet = JSON.parse(storedWallet);
      const address = parsedWallet.address;
      setWalletAddress(address);
      fetchTransactions(address);
    } else {
      navigate("/");
    }
  }, []);

  const fetchTransactions = async (address) => {
    try {
      const apiKey = import.meta.VITE_API_KEY_ETHERSCAN;
      const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      

      if (data.status === "1") {
        setTransactions(data.result.slice(0, 50)); // limit to latest 50
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
    setLoading(false);
  };

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
    <div className="transactionsPage">
      <div className="header">
        <p>Transactions</p>
      </div>

      <div className="transactionsList">
        {loading ? (
          <p className="loading">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="empty">No transactions found.</p>
        ) : (
          transactions.map((tx, index) => (
            <div className="transactionItem" key={index}>
              <div>
                <p className="label">From:</p>
                <p onClick={()=> handleCopy(tx.from)}>{shortenAddress(tx.from)}</p>
              </div>
              <div>
                <p className="label">To:</p>
                <p onClick={()=> handleCopy(tx.to)}>{shortenAddress(tx.to)}</p>
              </div>
              <div>
                <p className="label">Value:</p>
                <p>{(parseFloat(tx.value) / 1e18).toFixed(5)} ETH</p>
              </div>
              <div>
                <p className="label">Status:</p>
                <p style={{ color: tx.isError === "0" ? "#4caf50" : "#f44336" }}>
                  {tx.isError === "0" ? "Success" : "Failed"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <p className={`copy-msg ${copied ? 'show' : ''}`}>Address copied!</p>

      <div className="footerButtons">
        <div className="cancel" onClick={() => navigate("/homepage")}>
          Back
        </div>
      </div>
    </div>
  );
};

export default Transactions;
