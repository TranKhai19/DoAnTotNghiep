const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
let contractController;
try {
	contractController = require('../controllers/contractController');
} catch (e) {
	// If on-chain config is missing, provide stub handlers that return 501
	contractController = {
		createCampaignOnChain: (req, res) => res.status(501).json({ success: false, error: 'On-chain features not configured' }),
		getCampaignOnChain: (req, res) => res.status(501).json({ success: false, error: 'On-chain features not configured' }),
		recordDonationOnChain: (req, res) => res.status(501).json({ success: false, error: 'On-chain features not configured' }),
		disburseFundsOnChain: (req, res) => res.status(501).json({ success: false, error: 'On-chain features not configured' }),
		closeCampaignOnChain: (req, res) => res.status(501).json({ success: false, error: 'On-chain features not configured' })
	};
}

// On-chain FundChain contract endpoints
router.post('/onchain', contractController.createCampaignOnChain);
router.get('/onchain/:id', contractController.getCampaignOnChain);
router.post('/onchain/:campaignId/donate', contractController.recordDonationOnChain);
router.post('/onchain/:campaignId/disburse', contractController.disburseFundsOnChain);
router.post('/onchain/:id/close', contractController.closeCampaignOnChain);

// Get all campaigns
router.get('/', campaignController.getCampaigns);

// Get campaign by ID
router.get('/:id', campaignController.getCampaignById);

// Create campaign
router.post('/', campaignController.createCampaign);

// Update campaign
router.put('/:id', campaignController.updateCampaign);

// Delete campaign
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
