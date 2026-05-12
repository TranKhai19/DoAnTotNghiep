const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

const { verifyToken, requireAdmin } = require('../middlewares/auth');

// Casso Webhook
router.post('/casso', webhookController.cassoWebhook);

// PayOS Webhook (Mới)
router.post('/payos', webhookController.payosWebhook);

// Bank Webhook (generic)
router.post('/bank', webhookController.bankWebhook);

// Ethereum Webhook - Nhận dữ liệu từ blockchain
router.post('/ethereum', webhookController.ethereumWebhook);

// Webhook test endpoint (demo) - Secure this!
router.post('/test', verifyToken, requireAdmin, webhookController.simulatePayment);

// Cập nhật trạng thái từ Worker 
router.post('/onchain-status', verifyToken, requireAdmin, webhookController.updateOnchainStatus);

module.exports = router;
