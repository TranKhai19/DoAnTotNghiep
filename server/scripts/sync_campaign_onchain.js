const { ethers } = require('ethers');
const supabase = require('../config/supabase');
const contractService = require('../services/contractService');
require('dotenv').config();

async function sync() {
  const CAMPAIGN_UUID = '99cb7146-f3d8-40ab-803a-51ea1000b872'; // ID của chiến dịch hiện tại
  
  console.log(`🔄 Đang bắt đầu đồng bộ chiến dịch ${CAMPAIGN_UUID} lên Blockchain...`);

  try {
    // 1. Lấy thông tin từ DB
    const { data: campaign, error: fetchErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', CAMPAIGN_UUID)
      .single();

    if (fetchErr || !campaign) {
      console.error('❌ Không tìm thấy chiến dịch trong DB:', fetchErr?.message);
      return;
    }

    console.log(`📋 Thông tin DB: "${campaign.title}", Mục tiêu: ${campaign.goal_amount}`);

    // 2. Gọi Smart Contract để tạo chiến dịch mới trên On-chain
    console.log('🔗 Đang gọi Smart Contract (createCampaign)...');
    const result = await contractService.createCampaign(Math.round(campaign.goal_amount));
    
    if (!result.campaignId) {
      throw new Error('Không lấy được Campaign ID từ logs giao dịch.');
    }

    const newOnchainID = result.campaignId;
    console.log(`✅ Đã tạo thành công trên Blockchain! ID mới: ${newOnchainID}`);
    console.log(`📝 TxHash: ${result.transactionHash}`);

    // 3. Cập nhật lại Database
    const { error: updateErr } = await supabase
      .from('campaigns')
      .update({ onchain_campaign_id: parseInt(newOnchainID) })
      .eq('id', CAMPAIGN_UUID);

    if (updateErr) {
      console.error('❌ Lỗi cập nhật DB:', updateErr.message);
    } else {
      console.log('🚀 ĐÃ ĐỒNG BỘ THÀNH CÔNG! Bây giờ bạn có thể thực hiện giải ngân.');
    }

  } catch (error) {
    console.error('❌ Lỗi trong quá trình đồng bộ:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.error('👉 Vui lòng kiểm tra số dư ETH của ví Admin (PrivateKey trong .env)');
    }
  }
}

sync();
