const supabase = require('../config/supabase');

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
