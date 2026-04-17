const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const contractController = require('../controllers/contractController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

// On-chain FundChain contract endpoints
router.post('/onchain', contractController.createCampaignOnChain);
router.get('/onchain/:id', contractController.getCampaignOnChain);
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

// ===== DRAFT MODE ENDPOINTS =====

// Create draft campaign (requires auth)
router.post('/draft/create', verifyToken, campaignController.createDraft);

// Update draft campaign (requires auth)
router.patch('/draft/:id', verifyToken, campaignController.updateDraft);

// Get all draft campaigns (Admin only)
router.get('/draft/list', verifyToken, requireAdmin, campaignController.getDrafts);

// Admin approve draft campaign
router.post('/draft/:id/approve', verifyToken, requireAdmin, campaignController.approveDraft);

// Admin reject draft campaign
router.post('/draft/:id/reject', verifyToken, requireAdmin, campaignController.rejectDraft);

module.exports = router;
