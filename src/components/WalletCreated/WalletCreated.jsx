import React, { useState, useEffect } from "react";
import { createNewWallet } from "../../lib/wallet";
import { useNavigate } from "react-router-dom";
import "./WalletCreated.css";

const WalletCreated = () => {
  const [wallet, setWallet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const newWallet = createNewWallet();
    setWallet(newWallet);
  }, []);

  return (
    <div className="walletCreated">
      <div className="header">
        <p>Wallet Created Successfully</p>
      </div>
      {wallet && (
        <div className="center">
          <p>
            <strong>Address:</strong>
            <br />
            {wallet.address}
          </p>
          <p>
            <strong>Passphrase:</strong>
            <br />
            {wallet.mnemonic}
          </p>
        </div>
      )}
      <div className="footerButtons">
        <div onClick={() => navigate("/homepage")}>Go to Dashboard</div>
      </div>
    </div>
  );
};

export default WalletCreated;
