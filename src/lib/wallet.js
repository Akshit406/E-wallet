import { ethers } from "ethers";

// Generate a new Ethereum wallet
export const createNewWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic.phrase;

  // Save private key (not recommended for production)
  localStorage.setItem(
    "wallet",
    JSON.stringify({
      privateKey: wallet.privateKey,
      address: wallet.address,
      mnemonic,
    })
  );

  return { address: wallet.address, mnemonic };
};

// Import wallet from a 12-word passphrase
export const importWalletFromPassphrase = (mnemonic) => {
  try {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    localStorage.setItem(
      "wallet",
      JSON.stringify({
        privateKey: wallet.privateKey,
        address: wallet.address,
        mnemonic,
      })
    );

    return { address: wallet.address };
  } catch (error) {
    console.error("Invalid mnemonic:", error);
    return null;
  }
};

// Get stored wallet details
export const getStoredWallet = () => {
  const walletData = localStorage.getItem("wallet");
  return walletData ? JSON.parse(walletData) : null;
};
