import { ethers, isAddress } from "ethers";

const ETHERSCAN_API_KEY = import.meta.VITE_API_KEY_ETHERSCAN ;
const INFURA_RPC_URL = "https://sepolia.infura.io/v3/14878f1584694787b9387f757fb10434";
const ETHERSCAN_BASE_URL = "https://api-sepolia.etherscan.io/api";

const provider = new ethers.JsonRpcProvider(INFURA_RPC_URL);

export const fetchTokens = async (address) => {
  try {
    if (!isAddress(address)) throw new Error("Invalid wallet address");

    const url = `${ETHERSCAN_BASE_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      console.warn("No tokens found for this address.");
      return [];
    }

    const tokens = [];
    const seen = new Set();

    for (const tx of data.result) {
      const key = tx.contractAddress;
      if (!isAddress(key)) {
        console.warn("Skipping invalid contract address:", key);
        continue;
      }
      if (!seen.has(key)) {
        seen.add(key);

        const tokenBalance = await getTokenBalance(address, key, tx.tokenDecimal);
        tokens.push({
          symbol: tx.tokenSymbol,
          balance: tokenBalance,
          contractAddress: key,
        });
      }
    }

    return tokens;
  } catch (error) {
    console.error("Error in fetchTokens:", error.message);
    return [];
  }
};

export const getTokenBalance = async (walletAddress, contractAddress) => {
  try {
    if (!isAddress(walletAddress) || !isAddress(contractAddress)) {
      throw new Error("Invalid wallet or contract address");
    }

    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "1") {
      return ethers.formatUnits(data.result, 18);
    } else {
      console.error("Error fetching token balance", data.result);
      return 0;
    }
  } catch (error) {
    console.error("Error fetching token balance", error.message);
    return 0;
  }
};

export const validateBalance = async (walletAddress, contractAddress, amount) => {
  const balance = await getTokenBalance(walletAddress, contractAddress);
  return parseFloat(balance) >= parseFloat(amount);
};

export const getTokenABI = async (contractAddress) => {
  try {
    if (!isAddress(contractAddress)) throw new Error("Invalid contract address");

    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "1") {
      const abi = JSON.parse(data.result);
      if (!abi.length) throw new Error("ABI is empty or invalid");
      return abi;
    } else {
      console.error("Error fetching ABI:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch token ABI:", error.message);
    return null;
  }
};

export const sendTokens = async (toAddress, amount, contractAddress) => {
  try {
    const walletData = JSON.parse(localStorage.getItem("wallet"));
    if (!walletData) throw new Error("Wallet not found in local storage");

    const { privateKey, address: senderAddress } = walletData;
    const senderWallet = new ethers.Wallet(privateKey, provider);

    if (!isAddress(toAddress) || !isAddress(contractAddress)) {
      throw new Error("Invalid recipient or token address");
    }

    const tokenABI = await getTokenABI(contractAddress);
    if (!tokenABI) throw new Error("Failed to fetch token contract ABI");

    const tokenContract = new ethers.Contract(contractAddress, tokenABI, senderWallet);
    const decimals = await tokenContract.decimals();
    const amountToSend = ethers.parseUnits(amount, decimals);

    const tx = await tokenContract.transfer(toAddress, amountToSend);
    await tx.wait();

    console.log(`✅ Transaction successful! Hash: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("❌ Error sending tokens:", error.message);
    return null;
  }
};

export const estimateGasFees = async () => {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();

    if (data.status !== "1" || !data.result) {
      throw new Error("Failed to fetch gas data from Etherscan");
    }

    const gasInfo = {
      low: parseFloat(data.result.SafeGasPrice),       // slow transaction
      average: parseFloat(data.result.ProposeGasPrice),// standard
      high: parseFloat(data.result.FastGasPrice),      // fast transaction
    };

    console.log("⛽ Gas fees:", gasInfo);
    return gasInfo;
  } catch (error) {
    console.error("❌ Error fetching gas estimate:", error.message);
    return null;
  }
};

export const hasEnoughGas = async (walletAddress) => {
  try {
    if (!isAddress(walletAddress)) throw new Error("Invalid wallet address");
    const gasFees = await estimateGasFees();
    const ethBalance = await provider.getBalance(walletAddress);
    const formattedEthBalance = ethers.formatEther(ethBalance);

    if (parseFloat(formattedEthBalance) < parseFloat(gasFees?.average || 0)) {
      return { valid: false, message: "❌ Not enough ETH to pay gas" };
    }

    return { valid: true, message: "✅ Enough ETH for gas" };
  } catch (error) {
    return { valid: false, message: `❌ Error checking gas: ${error.message}` };
  }
};

export const sendETH = async (toAddress, amount) => {
  try {
    const walletData = JSON.parse(localStorage.getItem("wallet"));
    if (!walletData) throw new Error("Wallet not found");

    const senderWallet = new ethers.Wallet(walletData.privateKey, provider);
    const amountToSend = ethers.parseEther(amount);

    const tx = await senderWallet.sendTransaction({
      to: toAddress,
      value: amountToSend,
    });

    await tx.wait();
    console.log(`✅ ETH sent. Hash: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("❌ ETH transfer failed:", error.message);
    return null;
  }
};