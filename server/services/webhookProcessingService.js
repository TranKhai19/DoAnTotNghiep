const supabase = require('../config/supabase');

let contractService = null;
let socketService = null;

// Lazy-load để tránh crash khi blockchain node chưa sẵn sàng
function getContractService() {
  if (!contractService) {
    try {
      contractService = require('./contractService');
    } catch (e) {
      console.warn('⚠️  contractService unavailable:', e.message);
    }
  }
  return contractService;
}

function getIo() {
  return require('./socketService').getIo();
}

/**
 * Xử lý webhook từ Casso/Bank:
 * 1. Validate + deduplicate
 * 2. Gọi Smart Contract recordDonation
 * 3. Lưu donations vào DB
 * 4. Cập nhật raised_amount campaign
 * 5. Emit Socket.io cho frontend real-time
 */
const processBankWebhook = async (job) => {
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

  // ── 1. Lấy thông tin chiến dịch ──────────────────────────────────────
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, title, status, raised_amount, onchain_campaign_id')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  // ── 2. Deduplicate: kiểm tra giao dịch đã xử lý chưa ───────────────
  const { data: existing } = await supabase
    .from('donations')
    .select('id')
    .eq('bank_transaction_id', transactionId.toString())
    .maybeSingle();

  if (existing) {
    console.log(`⏭️  Duplicate transaction ${transactionId} - already processed, skipping`);
    return { success: true, skipped: true, reason: 'Duplicate transaction' };
  }

  // ── 3. PHÁT THÔNG BÁO NỔ HŨ NGAY LẬP TỨC (Không đợi Blockchain) ──────
  console.log(`📣 [PROCESSOR] PHÁT THÔNG BÁO NỔ HŨ CHO: ${campaign.title}`);
  const newRaisedAmount = (parseFloat(campaign.raised_amount) || 0) + parseFloat(amount);
  
  try {
    const io = getIo();
    if (io) {
        const socketPayload = {
          campaignId,
          amount: parseFloat(amount),
          donorName: senderName || 'Ẩn danh',
          campaignTitle: campaign.title,
          newRaisedAmount,
          transactionId,
          timestamp: new Date().toISOString()
        };
        console.log('📣 Emitting donation:confirmed socket event:', socketPayload);
        io.emit('donation:confirmed', socketPayload);
        console.log('✅ [PROCESSOR] Đã phát thông báo thành công!');
      } else {
        console.warn('⚠️ [PROCESSOR] Socket.io chưa khởi tạo, không emit event');
      }
    } catch (err) {
      console.error('❌ [PROCESSOR] Lỗi Socket:', err.message, { campaignId, amount });
    }

  // ── 4. Lưu vào bảng donations ────────────────────────────────────────
  // Schema: id, campaign_id, user_id, amount, message, bank_transaction_id, tx_hash, status, created_at
  const { data: donation, error: donationError } = await supabase
    .from('donations')
    .insert([{
      campaign_id: campaignId,
      bank_transaction_id: transactionId.toString(),
      amount: parseFloat(amount),
      message: `${senderName || 'Ẩn danh'}: ${description || ''}`.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (donationError) {
    console.warn('⚠️  Could not insert donation record:', donationError.message);
  }

  // ── 5. Cập nhật raised_amount campaign ───────────────────────────────
  const updateData = { raised_amount: newRaisedAmount };
  if (campaign.goal_amount && newRaisedAmount >= campaign.goal_amount && campaign.status !== 'closed') {
    updateData.status = 'completed';
    console.log(`🎉 [PROCESSOR] Campaign ${campaignId} reached its goal! Status updated to 'completed'.`);
  }

  await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', campaignId);

  // ── 6. Ghi nhận lên Blockchain (Chạy ngầm) ───────────────────────────
  // Nếu chưa có ID on-chain, hệ thống sẽ tự động khởi tạo trên chuỗi
  const syncToBlockchain = async () => {
    try {
      const cService = getContractService();
      if (!cService) return;

      let onchainCampaignId = campaign.onchain_campaign_id;

      // 6.1. Nếu chưa có ID on-chain, tạo mới chiến dịch trên Smart Contract
      if (!onchainCampaignId) {
        console.log(`🆕 [BLOCKCHAIN] Campaign ${campaignId} chưa có trên chuỗi. Đang khởi tạo...`);
        try {
          const createResult = await cService.createCampaign(campaign.target_amount || 1000000);
          onchainCampaignId = createResult.campaignId;
          
          if (onchainCampaignId) {
            console.log(`✅ [BLOCKCHAIN] Đã tạo campaign on-chain với ID: ${onchainCampaignId}`);
            // Cập nhật ID này vào Supabase để dùng cho lần sau
            await supabase
              .from('campaigns')
              .update({ onchain_campaign_id: onchainCampaignId })
              .eq('id', campaignId);
          }
        } catch (err) {
          console.error(`❌ [BLOCKCHAIN] Lỗi khởi tạo campaign:`, err.message);
          return;
        }
      }

      if (!onchainCampaignId) return;

      // 6.2. Ghi nhận quyên góp (recordDonation)
      console.log(`🔗 [BLOCKCHAIN] Đang ghi nhận donation lên chuỗi cho ID ${onchainCampaignId}...`);
      const recordResult = await cService.recordDonation(
        onchainCampaignId.toString(),
        transactionId.toString(),
        Math.round(parseFloat(amount)),
        senderName || 'Mạnh thường quân'
      );

      const txHash = recordResult.transactionHash;
      console.log(`✅ [BLOCKCHAIN] Ghi nhận thành công! Tx: ${txHash}`);
      
      // 6.3. Cập nhật tx_hash vào donation record
      if (donation) {
        await supabase
          .from('donations')
          .update({ 
            tx_hash: txHash, 
            status: 'success',
            processed_at: new Date().toISOString() 
          })
          .eq('id', donation.id);
      }
    } catch (err) {
      console.warn(`⚠️ [BLOCKCHAIN] Ghi nhận thất bại: ${err.message}`);
      // Đánh dấu lỗi để admin có thể retry sau
      if (donation) {
        await supabase
          .from('donations')
          .update({ status: 'failed_blockchain' })
          .eq('id', donation.id);
      }
    }
  };

  // Chạy không đợi kết quả để trả về response nhanh cho webhook
  syncToBlockchain();

  return { success: true, transactionId, campaignId };
};

module.exports = {
  processBankWebhook
};

