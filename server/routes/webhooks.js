const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Bank Webhook - Nhận dữ liệu thanh toán từ ngân hàng
router.post('/bank', webhookController.bankWebhook);
// Bank Webhook test (no campaign check) - for local demo only
router.post('/bank/test', webhookController.bankWebhookNoCheck);

// Ethereum Webhook - Nhận dữ liệu từ blockchain
router.post('/ethereum', webhookController.ethereumWebhook);

// Webhook test endpoint
router.post('/test', webhookController.simulatePayment);

module.exports = router;
