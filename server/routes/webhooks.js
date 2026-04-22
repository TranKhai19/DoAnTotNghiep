const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Bank Webhook - Nhận dữ liệu thanh toán từ ngân hàng
router.post('/bank', webhookController.bankWebhook);

// Ethereum Webhook - Nhận dữ liệu từ blockchain
router.post('/ethereum', webhookController.ethereumWebhook);

// Webhook test endpoint
router.post('/test', webhookController.simulatePayment);

// Cập nhật trạng thái từ Worker 
router.post('/onchain-status', webhookController.updateOnchainStatus);

module.exports = router;
