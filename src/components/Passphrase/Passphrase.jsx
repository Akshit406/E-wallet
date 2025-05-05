import React, { useState } from "react";
import "./Passphrase.css";
import { importWalletFromPassphrase } from "../../lib/wallet";
import { useNavigate } from "react-router-dom";

const Passphrase = () => {
  const [passphrase, setPassphrase] = useState(Array(12).fill(""));
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleInputChange = (index, value) => {
    const newPassphrase = [...passphrase];
    newPassphrase[index] = value;
    setPassphrase(newPassphrase);
  };

  const handleImport = () => {
    const mnemonic = passphrase.join(" ").trim();

    if (mnemonic.split(" ").length !== 12) {
      setError("Please enter a valid 12-word passphrase.");
      return;
    }

    const wallet = importWalletFromPassphrase(mnemonic);
    if (wallet) {
      navigate("/");
      console.log("wallet added");
    } else {
      setError("Invalid passphrase. Please try again.");
    }
  };

  return (
    <div className="passphrase">
      <div className="header">
        <p>Import via Passphrase</p>
      </div>
      <div className="center">
        {passphrase.map((word, index) => (
          <input
            key={index}
            type="text"
            className="passphrase-input"
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`${index + 1}.`}
          />
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="footerButtons">
        <div className="continue" onClick={handleImport}>
          Continue
        </div>
        <div className="cancel" onClick={() => navigate("/")}>
          Cancel
        </div>
      </div>
    </div>
  );
};

export default Passphrase;
