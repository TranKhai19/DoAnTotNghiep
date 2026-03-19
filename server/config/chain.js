const { ethers } = require('ethers');

const RPC_URL = process.env.CHAIN_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.FUNDCHAIN_CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  throw new Error('Please set CHAIN_RPC_URL, PRIVATE_KEY, and FUNDCHAIN_CONTRACT_ADDRESS in .env');
}

// ethers v6 shape: provider constructors are available directly (JsonRpcProvider)
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const fundChainAbi = [
  'function createCampaign(uint256 _targetAmount) external',
  'function recordDonation(uint256 _campaignId, string _bankRef, uint256 _amount, string _donor) external',
  'function disburseFunds(uint256 _campaignId, uint256 _amount, string _beneficiaryId) external',
  'function closeCampaign(uint256 _campaignId) external',
  'function campaigns(uint256) external view returns (uint256 id,uint256 targetAmount,uint256 totalRaised,uint256 totalDisbursed,bool isActive)',
  'function getCampaignDonations(uint256 _campaignId) external view returns (tuple(string bankRef,string donor,uint256 amount,uint256 timestamp)[])',
  'function getCampaignDisbursements(uint256 _campaignId) external view returns (tuple(string beneficiaryId,uint256 amount,uint256 timestamp)[])',
  'event CampaignCreated(uint256 indexed campaignId,uint256 targetAmount)',
  'event DonationRecorded(uint256 indexed campaignId,string indexed bankRef,uint256 amount)',
  'event FundsDisbursed(uint256 indexed campaignId,uint256 amount,string beneficiaryId)',
  'event CampaignClosed(uint256 indexed campaignId)'
];

const fundChainContract = new ethers.Contract(CONTRACT_ADDRESS, fundChainAbi, wallet);

module.exports = {
  provider,
  wallet,
  fundChainContract
};
