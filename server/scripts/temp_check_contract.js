const { ethers } = require('ethers');
require('dotenv').config();

async function check() {
  const provider = new ethers.JsonRpcProvider(process.env.CHAIN_RPC_URL);
  const abi = [
    "function nextCampaignId() view returns (uint256)",
    "function campaigns(uint256) view returns (uint256, uint256, uint256, uint256, bool, string)"
  ];
  const contract = new ethers.Contract(process.env.FUNDCHAIN_CONTRACT_ADDRESS, abi, provider);

  try {
    const nextId = await contract.nextCampaignId();
    console.log('Next Campaign ID on contract:', nextId.toString());
    
    if (nextId > 1n) {
      const camp1 = await contract.campaigns(1);
      console.log('Campaign 1 state:', camp1);
    } else {
      console.log('No campaigns created on this contract yet.');
    }
  } catch (error) {
    console.error('Error checking contract:', error.message);
  }
}

check();
