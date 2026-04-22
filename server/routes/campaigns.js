const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const contractController = require('../controllers/contractController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

// ─── On-chain FundChain contract endpoints ────────────────────────────────────
router.post('/onchain',                    contractController.createCampaignOnChain);
router.post('/onchain/estimate',           contractController.estimateAdminGas);
router.get('/onchain/:id',                 contractController.getCampaignOnChain);
router.post('/onchain/:campaignId/donate', contractController.recordDonationOnChain);
router.post('/onchain/:campaignId/disburse', contractController.disburseFundsOnChain);
router.post('/onchain/:id/close', contractController.closeCampaignOnChain);

// Get all campaigns (public)
router.get('/', campaignController.getCampaigns);

// Get campaign by ID (public)
router.get('/:id', campaignController.getCampaignById);

// Create campaign (old - kept for compatibility)
router.post('/', campaignController.createCampaign);

// Update campaign (old - kept for compatibility)
router.put('/:id', campaignController.updateCampaign);

// Delete campaign
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
