const supabase = require('../config/supabase');
const crypto = require('crypto');
const transactionModel = require('../models/Transaction');
const socketService = require('../services/socketService');

// Webhook từ ngân hàng - Nhận dữ liệu thanh toán
exports.bankWebhook = async (req, res) => {
  try {
    const {
      transactionId,
      amount,
      campaignId,
      description,
      timestamp,
      senderName,
      senderAccount
    } = req.body;

    // Optional signature verification
    const webhookSecret = process.env.BANK_WEBHOOK_SECRET;
    const signature = req.headers['x-bank-signature'] || req.headers['x-bank-signature'.toLowerCase()];
    if (webhookSecret && signature) {
      try {
        const payload = JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
          return res.status(401).json({ success: false, error: 'Invalid signature' });
        }
      } catch (e) {
        console.warn('Signature verification failed:', e.message || e);
        return res.status(401).json({ success: false, error: 'Invalid signature' });
      }
    }

    // Validation
    if (!transactionId || !amount || !campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transactionId, amount, campaignId'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Kiểm tra chiến dịch tồn tại
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Cập nhật số tiền gây quỹ
    const currentRaisedAmount = campaign.raised_amount || 0;
    const newRaisedAmount = currentRaisedAmount + parseFloat(amount);

    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        raised_amount: newRaisedAmount
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log giao dịch (tuỳ chọn - lưu vào bảng transactions nếu có)
    console.log(`✅ Webhook received: Transaction ${transactionId}, Amount: ${amount}, Campaign: ${campaignId}`);

    // Save transaction to DB (if table exists)
    try {
      await transactionModel.createTransaction({
        transaction_id: transactionId,
        campaign_id: campaignId,
        amount,
        sender_name: senderName,
        sender_account: senderAccount,
        description,
        timestamp
      });
    } catch (e) {
      console.warn('Could not persist transaction to DB:', e.message || e);
    }

    // Emit socket event to clients
    try {
      const io = socketService.getIo();
      io.emit('payment:received', {
        transactionId,
        amount: parseFloat(amount),
        campaignId,
        senderName,
        senderAccount,
        description,
        timestamp: timestamp || new Date().toISOString()
      });
    } catch (e) {
      // ignore if sockets not initialized
    }

    res.status(200).json({
      success: true,
      message: 'Payment received successfully',
      data: {
        transactionId,
        amount: parseFloat(amount),
        campaignId,
        previousAmount: currentRaisedAmount,
        newAmount: newRaisedAmount,
        campaignTitle: campaign.title,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Webhook test - Mô phỏng thanh toán
exports.simulatePayment = async (req, res) => {
  try {
    // Gọi lại chính webhook này để test
    return this.bankWebhook(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test endpoint: accept bank webhook payload but DO NOT check campaign existence.
// Useful for local demo when campaigns DB isn't available. This will persist transaction and emit socket.
exports.bankWebhookNoCheck = async (req, res) => {
  try {
    const {
      transactionId,
      amount,
      campaignId,
      description,
      timestamp,
      senderName,
      senderAccount
    } = req.body;

    if (!transactionId || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields: transactionId, amount' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
    }

    // Save transaction (best-effort)
    try {
      await transactionModel.createTransaction({
        transaction_id: transactionId,
        campaign_id: campaignId || null,
        amount,
        sender_name: senderName,
        sender_account: senderAccount,
        description,
        timestamp
      });
    } catch (e) {
      console.warn('Could not persist transaction to DB (test no-check):', e.message || e);
    }

    // Emit socket event
    try {
      const io = socketService.getIo();
      io.emit('payment:received', {
        transactionId,
        amount: parseFloat(amount),
        campaignId,
        senderName,
        senderAccount,
        description,
        timestamp: timestamp || new Date().toISOString()
      });
    } catch (e) {
      // ignore if sockets not initialized
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook received (no campaign check)',
      data: { transactionId, amount: parseFloat(amount), campaignId, timestamp: timestamp || new Date().toISOString() }
    });
  } catch (error) {
    console.error('bankWebhookNoCheck error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Webhook từ Ethereum - Khi có giao dịch on-chain (tuỳ chọn)
exports.ethereumWebhook = async (req, res) => {
  try {
    const {
      transactionHash,
      amount,
      campaignId,
      contractAddress,
      blockNumber
    } = req.body;

    // Validation
    if (!transactionHash || !amount || !campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transactionHash, amount, campaignId'
      });
    }

    // Kiểm tra chiến dịch tồn tại
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Cập nhật số tiền từ on-chain
    const currentRaisedAmount = campaign.raised_amount || 0;
    const newRaisedAmount = currentRaisedAmount + parseFloat(amount);

    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        raised_amount: newRaisedAmount,
        contract_address: contractAddress
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Ethereum Webhook: Tx ${transactionHash}, Amount: ${amount}, Campaign: ${campaignId}`);

    res.status(200).json({
      success: true,
      message: 'Ethereum payment received',
      data: {
        transactionHash,
        amount: parseFloat(amount),
        campaignId,
        previousAmount: currentRaisedAmount,
        newAmount: newRaisedAmount,
        blockNumber,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Ethereum webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
