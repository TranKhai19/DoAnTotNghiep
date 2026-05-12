require("@nomicfoundation/hardhat-toolbox");

// Hardhat node default test account #1 (safe to hardcode for local dev)
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: [PRIVATE_KEY],
    },
    besu: {
      url: process.env.BESU_URL || "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [PRIVATE_KEY],
    }
  }
};
