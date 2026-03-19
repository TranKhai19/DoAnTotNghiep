const { ethers } = require('ethers');
const contractService = require('../services/contractService');

exports.createCampaignOnChain = async (req, res) => {
  try {
    const { targetAmount } = req.body;
    if (!targetAmount || isNaN(targetAmount) || Number(targetAmount) <= 0) {
      return res.status(400).json({ success: false, error: 'targetAmount must be a positive number' });
    }

    const receipt = await contractService.createCampaign(targetAmount);

    return res.status(201).json({ success: true, message: 'Campaign created on-chain', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCampaignOnChain = async (req, res) => {
  try {
    const campaignId = req.params.id;
    if (!campaignId || isNaN(campaignId) || Number(campaignId) <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid campaignId' });
    }

    const campaign = await contractService.getCampaign(campaignId);
    return res.json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.recordDonationOnChain = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { bankRef, amount, donor } = req.body;

    if (!campaignId || isNaN(campaignId) || Number(campaignId) <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid campaignId' });
    }
    if (!bankRef || !amount || isNaN(amount) || Number(amount) <= 0 || !donor) {
      return res.status(400).json({ success: false, error: 'Missing donation parameters' });
    }

    const receipt = await contractService.recordDonation(campaignId, bankRef, amount, donor);

    return res.status(200).json({ success: true, message: 'Donation recorded on-chain', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.disburseFundsOnChain = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { amount, beneficiaryId } = req.body;

    if (!campaignId || isNaN(campaignId) || Number(campaignId) <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid campaignId' });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0 || !beneficiaryId) {
      return res.status(400).json({ success: false, error: 'Missing disbursement parameters' });
    }

    const receipt = await contractService.disburseFunds(campaignId, amount, beneficiaryId);

    return res.status(200).json({ success: true, message: 'Funds disbursed on-chain', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.closeCampaignOnChain = async (req, res) => {
  try {
    const campaignId = req.params.id;
    if (!campaignId || isNaN(campaignId) || Number(campaignId) <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid campaignId' });
    }

    const receipt = await contractService.closeCampaign(campaignId);

    return res.status(200).json({ success: true, message: 'Campaign closed on-chain', transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
