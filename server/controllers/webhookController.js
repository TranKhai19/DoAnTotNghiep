const supabase = require('../config/supabase');
const { addWebhookJob } = require('../services/queueService');

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

    // Thêm job vào queue thay vì xử lý trực tiếp
    const job = await addWebhookJob({
      transactionId,
      amount: parseFloat(amount),
      campaignId,
      description: description || null,
      senderName: senderName || null,
      senderAccount: senderAccount || null
    });

    console.log(`📝 Webhook queued: Transaction ${transactionId}, Job ID: ${job.id}`);

    res.status(202).json({
      success: true,
      message: 'Payment queued for processing',
      jobId: job.id,
      data: {
        transactionId,
        amount: parseFloat(amount),
        campaignId,
        campaignTitle: campaign.title,
        queuedAt: new Date().toISOString()
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// API Endpoint cho Worker nhận txHash để cập nhật trạng thái Success
exports.updateOnchainStatus = async (req, res) => {
  try {
    const { txHash, recordId, type } = req.body;
    // type: 'donation' | 'disbursement' | 'campaign'
    
    if (!txHash || !recordId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: txHash, recordId, type'
      });
    }

    let tableName;
    if (type === 'donation') tableName = 'donations';
    else if (type === 'disbursement') tableName = 'disbursements';
    else if (type === 'campaign') tableName = 'campaigns';
    else {
      return res.status(400).json({ success: false, error: 'Invalid type provided' });
    }

    // Cập nhật trạng thái Success và lưu txHash vào DB
    // Database schema có thể mới được cập nhật thêm cột 'status'
    const payload = {
      tx_hash: txHash,
      status: 'Success'
    };

    if(type === 'campaign') {
      // Đối với campaign status hiện đang dùng là 'Đang chạy' hoặc 'Hoàn thành', 
      // ta có thể lưu contract_address bằng txHash hoặc thuộc tính khác,
      // ở đây tuân theo yêu cầu: cập nhật trạng thái Success và txHash
      payload.status = 'Success';
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(payload)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Worker Update: Set ${type} ${recordId} info to Success with txHash ${txHash}`);

    res.status(200).json({
      success: true,
      message: `Updated ${type} status to Success`,
      data
    });
  } catch (error) {
    console.error('Worker updateOnchainStatus error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
