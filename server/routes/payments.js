const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-link', paymentController.createPaymentLink);

module.exports = router;
