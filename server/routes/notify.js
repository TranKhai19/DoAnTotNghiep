const express = require('express');
const router = express.Router();

const socketService = require('../services/socketService');

// POST /api/notify/explosion
// Body: { title?: string, amount?: number, campaignId?: number, meta?: {} }
router.post('/explosion', (req, res) => {
  const { title, amount, campaignId, meta } = req.body || {};
  const payload = {
    title: title || 'Nổ tiền',
    amount: amount || 0,
    campaignId: campaignId || null,
    meta: meta || {},
    timestamp: new Date().toISOString()
  };

  try {
    socketService.emitNoTien(payload);
    return res.json({ success: true, message: 'Emitted no_tien event', data: payload });
  } catch (e) {
    console.error('Notify explosion error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
