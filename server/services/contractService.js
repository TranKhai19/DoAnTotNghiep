const { fundChainContract } = require('../config/chain');
const { ethers } = require('ethers');
let socketService = null;
try { socketService = require('./socketService'); } catch (e) { /* ok if not available */ }

async function createCampaign(targetAmount) {
  const tx = await fundChainContract.createCampaign(ethers.BigNumber.from(targetAmount));
  const receipt = await tx.wait();
  try {
    if (socketService) socketService.getIo().emit('onchain:createCampaign', { transactionHash: receipt.transactionHash, targetAmount: targetAmount.toString() });
  } catch (e) { console.error('Socket emit failed', e); }
  return receipt;
}

async function getCampaign(campaignId) {
  return fundChainContract.campaigns(campaignId);
}

async function recordDonation(campaignId, bankRef, amount, donor) {
  const tx = await fundChainContract.recordDonation(campaignId, bankRef, ethers.BigNumber.from(amount), donor);
  const receipt = await tx.wait();
  try {
    if (socketService) socketService.getIo().emit('onchain:recordDonation', { transactionHash: receipt.transactionHash, campaignId: campaignId.toString(), bankRef, amount: amount.toString(), donor });
  } catch (e) { console.error('Socket emit failed', e); }
  return receipt;
}

async function disburseFunds(campaignId, amount, beneficiaryId) {
  const tx = await fundChainContract.disburseFunds(campaignId, ethers.BigNumber.from(amount), beneficiaryId);
  const receipt = await tx.wait();
  try {
    if (socketService) socketService.getIo().emit('onchain:disburseFunds', { transactionHash: receipt.transactionHash, campaignId: campaignId.toString(), amount: amount.toString(), beneficiaryId });
  } catch (e) { console.error('Socket emit failed', e); }
  return receipt;
}

async function closeCampaign(campaignId) {
  const tx = await fundChainContract.closeCampaign(campaignId);
  const receipt = await tx.wait();
  try {
    if (socketService) socketService.getIo().emit('onchain:closeCampaign', { transactionHash: receipt.transactionHash, campaignId: campaignId.toString() });
  } catch (e) { console.error('Socket emit failed', e); }
  return receipt;
}

module.exports = {
  createCampaign,
  getCampaign,
  recordDonation,
  disburseFunds,
  closeCampaign
};
