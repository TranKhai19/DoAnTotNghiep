const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const contractController = require('../controllers/contractController');
const { verifyToken, requireAdmin, requireStaff } = require('../middlewares/auth');

// ─── On-chain FundChain contract endpoints (Admin Only) ───────────────────────
router.post('/onchain',                    verifyToken, requireAdmin, contractController.createCampaignOnChain);
router.post('/onchain/estimate',           verifyToken, requireAdmin, contractController.estimateAdminGas);
router.get('/onchain/:id',                 verifyToken, requireStaff, contractController.getCampaignOnChain);
router.post('/onchain/:id/close',          verifyToken, requireAdmin, contractController.closeCampaignOnChain);

// Internal/Webhook use (Usually handled by processing service, but secured if exposed)
router.post('/onchain/:campaignId/donate',   verifyToken, requireAdmin, contractController.recordDonationOnChain);
router.post('/onchain/:campaignId/disburse', verifyToken, requireAdmin, contractController.disburseFundsOnChain);

// ─── Public Endpoints ─────────────────────────────────────────────────────────
// Get all campaigns
router.get('/', campaignController.getCampaigns);

// Get campaign by ID
router.get('/:id', campaignController.getCampaignById);

// Get campaign history (on-chain) - Public for transparency
router.get('/:id/history', campaignController.getCampaignHistory);

// ─── Protected Database Endpoints ─────────────────────────────────────────────
// Create campaign (Staff/Admin)
router.post('/', verifyToken, requireStaff, campaignController.createCampaign);

// Update campaign (Staff/Admin)
router.put('/:id', verifyToken, requireStaff, campaignController.updateCampaign);

// Delete campaign (Admin Only)
router.delete('/:id', verifyToken, requireAdmin, campaignController.deleteCampaign);

module.exports = router;
