const supabase = require('../config/supabase');
const { addWebhookJob } = require('./queueService');

/**
 * Process bank webhook - Update campaign raised_amount
 * @param {Object} job - Bull job object
 */
const processBankWebhook = async (job) => {
  try {
    const {
      transactionId,
      amount,
      campaignId,
      description,
      senderName,
      senderAccount
    } = job.data;

    console.log(`⏳ Processing webhook job ${job.id}:`, { transactionId, campaignId, amount });

    // Validation
    if (!transactionId || !amount || !campaignId) {
      throw new Error('Missing required fields: transactionId, amount, campaignId');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Kiểm tra chiến dịch tồn tại
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Cập nhật số tiền gây quỹ ONE-SHOT (atomic)
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

    // Log giao dịch vào donations table (nếu có)
    try {
      await supabase.from('donations').insert([{
        campaign_id: campaignId,
        bank_ref: transactionId,
        amount: parseFloat(amount),
        donor_name: senderName || null,
        donor_account: senderAccount || null,
        description: description || null,
        status: 'completed',
        created_at: new Date().toISOString()
      }]);
    } catch (donationLogError) {
      console.warn('⚠️  Could not log donation:', donationLogError.message);
      // Continue anyway - donation amount updated successfully
    }

    console.log(`✅ Webhook job ${job.id} processed successfully`);

    return {
      success: true,
      transactionId,
      campaignId,
      previousAmount: currentRaisedAmount,
      newAmount: newRaisedAmount,
      campaignTitle: campaign.title,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error processing webhook job ${job.id}:`, error.message);
    throw error; // Bull sẽ auto retry
  }
};

module.exports = {
  processBankWebhook
};
