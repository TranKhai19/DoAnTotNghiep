const { PayOS } = require('@payos/node');
const supabase = require('../config/supabase');

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

let payos = null;
if (clientId && apiKey && checksumKey) {
  payos = new PayOS(clientId, apiKey, checksumKey);
}

exports.createPaymentLink = async (req, res) => {
  try {
    const { campaignId, amount, senderName } = req.body;

    if (!payos) {
      return res.status(500).json({ error: 'PayOS SDK not initialized. Check .env keys.' });
    }

    // 1. Lấy thông tin chiến dịch
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, qr_code')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // 2. Tạo mã đơn hàng (orderCode) - Phải là số và duy nhất
    const orderCode = Number(String(Date.now()).slice(-9));

    // 3. Tạo nội dung chuyển khoản (Ví dụ: QG3BBC08)
    const description = campaign.qr_code || `QG${campaign.id.slice(-6).toUpperCase()}`;

    // 4. Tạo Payment Link qua PayOS
    const body = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      items: [
        {
          name: `Ủng hộ: ${campaign.title}`,
          quantity: 1,
          price: amount
        }
      ],
      cancelUrl: `${req.headers.origin}/campaign/${campaignId}`,
      returnUrl: `${req.headers.origin}/campaign/${campaignId}?status=success`
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);

    // 5. Trả về thông tin cho Frontend
    res.json({
      success: true,
      data: {
        bin: paymentLinkRes.bin,
        accountNumber: paymentLinkRes.accountNumber,
        accountName: paymentLinkRes.accountName,
        amount: paymentLinkRes.amount,
        description: paymentLinkRes.description,
        orderCode: paymentLinkRes.orderCode,
        qrCode: paymentLinkRes.qrCode,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        paymentLinkId: paymentLinkRes.paymentLinkId
      }
    });

  } catch (error) {
    console.error('❌ [PAYMENT] Lỗi tạo link thanh toán:', error.message);
    res.status(500).json({ error: error.message });
  }
};
