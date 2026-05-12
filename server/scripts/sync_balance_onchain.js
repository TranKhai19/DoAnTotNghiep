const { ethers } = require('ethers');
const supabase = require('../config/supabase');
const contractService = require('../services/contractService');
require('dotenv').config();

async function syncBalance() {
  const CAMPAIGN_UUID = '99cb7146-f3d8-40ab-803a-51ea1000b872'; 
  
  try {
    // 1. Lấy onchain_id
    const { data: campaign } = await supabase.from('campaigns').select('onchain_campaign_id, raised_amount').eq('id', CAMPAIGN_UUID).single();
    
    if (!campaign?.onchain_campaign_id) return;

    console.log(`💰 Đang nạp số dư ${campaign.raised_amount} VND lên Blockchain cho Campaign #${campaign.onchain_campaign_id}...`);

    // 2. Ghi nhận một giao dịch tổng hợp để có số dư giải ngân
    const result = await contractService.recordDonation(
      campaign.onchain_campaign_id,
      `SYNC-${Date.now()}`,
      Math.round(campaign.raised_amount),
      "Hệ thống (Đồng bộ sau redeploy)"
    );

    console.log(`✅ Đã nạp số dư thành công! TxHash: ${result.transactionHash}`);
    console.log(`🚀 Bây giờ bạn có thể quay lại trang Admin và nhấn "Duyệt" để giải ngân.`);

  } catch (error) {
    console.error('❌ Lỗi nạp số dư:', error.message);
  }
}

syncBalance();
