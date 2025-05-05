import React, { useEffect, useState } from "react";
import "./Recieve.css";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
const Recieve = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    // Fetch stored wallet address from local storage
    const storedAddress = localStorage.getItem("wallet");
    if (storedAddress) {
      const parsedWallet = JSON.parse(storedAddress);
      setWalletAddress(parsedWallet.address);
    }
  }, []);

  return (
    <div className="recieve">
      <div className="header">
        <p>Recieve</p>
      </div>
      <div className="center">
        <div className="qrCode">
          <QRCodeSVG value={walletAddress} size={200} />
        </div>
        <div className="accountAddress">{walletAddress}</div>
      </div>
      <div className="footerButtons">
        <div className="cancel" onClick={() => navigate("/homepage")}>
          Cancel
        </div>
      </div>
    </div>
  );
};

export default Recieve;
