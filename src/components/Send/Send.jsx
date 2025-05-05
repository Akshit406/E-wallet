import React, { useState } from "react";
import "./Send.css";
import { useNavigate } from "react-router-dom";

const Send = () => {
  const navigate = useNavigate();
  const [toAddress, setToAddress] = useState("");
  const [copied, setCopied] = useState(null);

  const wallet = JSON.parse(localStorage.getItem("wallet")) || {};
  const senderAddress = wallet.address || "";

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
    <div className="send">
      <div className="header">
        <p>Send</p>
      </div>
      <div className="center">
        <div className="from">
          <p>From</p>
          <div onClick={()=>handleCopy(senderAddress)}>{`${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`}</div>
        </div>
        <div className="to">
          <p>To</p>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="Enter recipient address"
            className="to-input"
          />
        </div>
      </div>
      <p className={`copy-msg ${copied ? 'show' : ''}`}>Address copied!</p>

      <div className="footerButtons">
        <div
          className="continue"
          onClick={() => navigate("/ChooseAmount", { state: { toAddress } })}
        >
          Continue
        </div>
        <div className="cancel" onClick={() => navigate("/homepage")}>
          Cancel
        </div>
      </div>
    </div>
  );
};

export default Send;
