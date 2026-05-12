const supabase = require('../config/supabase');
const { addWebhookJob } = require('../services/queueService');
const { PayOS } = require('@payos/node');

// Hỗ trợ cả tên biến cũ và mới để tránh lỗi
const clientId = process.env.PAYOS_CLIENT_ID || process.env.CASSO_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY || process.env.CASSO_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY || process.env.CASSO_CHECKSUM_KEY;

let payos = null;
if (clientId && apiKey && checksumKey) {
  payos = new PayOS(clientId, apiKey, checksumKey);
  console.log('✅ [PAYOS] Đã khởi tạo SDK thành công.');
} else {
  console.warn('⚠️ [PAYOS] Thiếu Key trong .env, nổ hũ thật có thể bị lỗi xác thực.');
}

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

/**
 * Trích xuất mã chiến dịch từ nội dung chuyển khoản
 */
function extractCampaignCode(description) {
  if (!description) return null;
  const text = String(description).toUpperCase();

  // 1. Tìm mẫu QGxxxx (Quy Góp) - cho phép có dấu cách ở giữa
  // Ví dụ: "QG 3B BC 08" -> "QG3BBC08"
  const qgRegex = /QG\s*([A-Z0-9]\s*){4,}/g;
  const qgMatch = text.match(qgRegex);
  if (qgMatch) {
    return qgMatch[0].replace(/\s/g, '');
  }

  // 2. Tìm mẫu UUID (ID chiến dịch)
  const uuidRegex = /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i;
  const uuidMatch = text.match(uuidRegex);
  if (uuidMatch) {
    return uuidMatch[0].toLowerCase();
  }

  // 3. Fallback: Tìm chuỗi alphanumeric 6-12 ký tự
  const fallbackRegex = /[A-Z0-9]{6,12}/;
  const fallbackMatch = text.replace(/[^A-Z0-9]/g, '').match(fallbackRegex);
  return fallbackMatch ? fallbackMatch[0] : null;
}

const isUuidString = (value) => {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

/**
 * Parser linh hoạt cho cả PayOS và Casso
 */
function parseWebhookPayload(req) {
  const body = req.body || {};
  
  // 1. Trường hợp là Casso (thường gửi mảng giao dịch trong data)
  if (Array.isArray(body.data)) {
    const firstTx = body.data[0] || {};
    return {
      source: 'Casso',
      amount: firstTx.amount || 0,
      description: firstTx.description || firstTx.memo || '',
      reference: firstTx.tid || firstTx.id || firstTx.transactionId || '',
      senderName: firstTx.cus_name || firstTx.senderName || 'Mạnh thường quân (Casso)',
      senderAccount: firstTx.cus_account || firstTx.senderAccount || '',
      success: true
    };
  }

  // 2. Trường hợp là PayOS (SDK có thể đã verify hoặc body chứa data object)
  const data = body.data && typeof body.data === 'object' ? body.data : body;
  
  return {
    source: body.signature ? 'PayOS (Signed)' : 'PayOS/Generic',
    amount: data.amount || data.total_amount || data.payment_amount || 0,
    description: data.description || data.desc || '',
    reference: data.reference || data.orderCode || data.paymentLinkId || data.id || '',
    senderName: data.counterAccountName || data.payerName || 'Mạnh thường quân (PayOS)',
    senderAccount: data.counterAccountNumber || data.accountNumber || '',
    success: body.success !== false && (body.code === undefined || String(body.code) === '00'),
    signature: body.signature
  };
}

/**
 * Webhook nhận thông báo chuyển khoản
 */
exports.payosWebhook = async (req, res) => {
  let webhookLogId = null;
  try {
    console.log('====================================================');
    console.log('🚀 [WEBHOOK] NHẬN THÔNG BÁO THANH TOÁN!');
    console.log('Source IP:', req.ip);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('====================================================');

    const parsed = parseWebhookPayload(req);
    
    // Ghi log vào Database ngay lập tức để truy vết
    const { data: logData, error: logError } = await supabase
      .from('webhook_logs')
      .insert([{
        payload: req.body,
        status: 'received',
        bank_transaction_id: parsed.reference?.toString(),
      }])
      .select()
      .single();
    
    if (logError) {
      console.error('❌ [WEBHOOK] Lỗi khi ghi log vào database:', logError.message);
    }
    
    webhookLogId = logData?.id;

    // Kiểm tra xác thực PayOS (nếu có SDK và có chữ ký)
    if (parsed.signature && payos) {
      try {
        console.log('🔐 [PAYOS] Đang xác thực chữ ký...');
        payos.webhooks.verify(req.body);
        console.log('✅ [PAYOS] Chữ ký hợp lệ.');
      } catch (e) {
        console.error('❌ [PAYOS] Chữ ký không hợp lệ:', e.message);
        // Trong môi trường dev có thể bỏ qua nếu muốn test thủ công
        if (process.env.NODE_ENV === 'production') {
          await supabase.from('webhook_logs').update({ status: 'error', error_message: 'Invalid Signature' }).eq('id', webhookLogId);
          return res.status(200).json({ success: false, message: 'Invalid Signature' });
        }
      }
    }

    if (!parsed.success) {
      console.log('⚠️ [WEBHOOK] Webhook báo thất bại hoặc là confirm URL. Bỏ qua.');
      await supabase.from('webhook_logs').update({ status: 'ignored', error_message: 'Not a success notification' }).eq('id', webhookLogId);
      return res.status(200).json({ success: true });
    }

    // Bỏ qua tin nhắn xác thực URL của PayOS
    if (normalizeString(parsed.description).includes('Webhook URL confirmation')) {
      await supabase.from('webhook_logs').update({ status: 'ignored', error_message: 'URL Confirmation' }).eq('id', webhookLogId);
      return res.status(200).json({ success: true });
    }

    const amountValue = parseFloat(String(parsed.amount).replace(/,/g, ''));
    if (!amountValue || amountValue <= 0) {
      console.error('❌ [WEBHOOK] Thiếu amount hợp lệ:', parsed.amount);
      await supabase.from('webhook_logs').update({ status: 'error', error_message: 'Invalid amount' }).eq('id', webhookLogId);
      return res.status(200).json({ success: true });
    }

    const campaignCode = extractCampaignCode(parsed.description);
    if (!campaignCode) {
      console.error('❌ [WEBHOOK] Không tìm thấy mã chiến dịch trong nội dung:', parsed.description);
      await supabase.from('webhook_logs').update({ status: 'error', error_message: 'Campaign code not found in description' }).eq('id', webhookLogId);
      return res.status(200).json({ success: true });
    }

    console.log(`🔎 Đang tìm chiến dịch cho mã: ${campaignCode} (Source: ${parsed.source})`);

    // Chiến thuật tìm kiếm linh hoạt
    let campaign = null;
    
    // 1. Tìm theo UUID nếu mã là UUID
    if (isUuidString(campaignCode)) {
      const { data } = await supabase.from('campaigns').select('id, title').eq('id', campaignCode).maybeSingle();
      campaign = data;
    }

    // 2. Tìm theo qr_code (Khớp hoàn toàn hoặc chứa mã)
    if (!campaign) {
      const { data } = await supabase
        .from('campaigns')
        .select('id, title')
        .or(`qr_code.eq.${campaignCode},qr_code.ilike.%${campaignCode}%`)
        .maybeSingle();
      campaign = data;
    }

    // 3. Tìm theo hậu tố của ID (Dành cho mã QGxxxxxx)
    if (!campaign && campaignCode.startsWith('QG')) {
      const suffix = campaignCode.replace('QG', '').toLowerCase();
      if (suffix.length >= 4) {
        const { data } = await supabase
          .from('campaigns')
          .select('id, title')
          .ilike('id', `%${suffix}`)
          .maybeSingle();
        campaign = data;
      }
    }

    if (!campaign) {
      console.error(`❌ Không tìm thấy chiến dịch nào khớp với "${campaignCode}"`);
      await supabase.from('webhook_logs').update({ status: 'error', error_message: `Campaign not found: ${campaignCode}` }).eq('id', webhookLogId);
      return res.status(200).json({ success: true });
    }

    console.log(`🎯 KHỚP: "${campaign.title}" - Đang nổ hũ...`, { campaignId: campaign.id });

    // Cập nhật log
    await supabase.from('webhook_logs').update({ 
      campaign_id: campaign.id,
      status: 'processed',
      processed_at: new Date().toISOString()
    }).eq('id', webhookLogId);

    const job = await addWebhookJob({
      transactionId: (parsed.reference || Date.now()).toString(),
      amount: amountValue,
      campaignId: campaign.id,
      description: normalizeString(parsed.description),
      senderName: normalizeString(parsed.senderName),
      senderAccount: normalizeString(parsed.senderAccount),
    });

    console.log('✅ Webhook job queued:', { jobId: job.id, campaignId: campaign.id });
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Lỗi Webhook:', error.message);
    if (webhookLogId) {
      await supabase.from('webhook_logs').update({ status: 'error', error_message: error.message }).eq('id', webhookLogId);
    }
    res.status(200).json({ success: true });
  }
};

exports.cassoWebhook = exports.payosWebhook;
exports.bankWebhook = exports.payosWebhook;
exports.ethereumWebhook = async (req, res) => res.json({ success: true });
exports.updateOnchainStatus = async (req, res) => res.json({ success: true });

exports.simulatePayment = async (req, res) => {
  try {
    const { campaignId, amount, senderName } = req.body;
    await addWebhookJob({
      transactionId: 'SIM-' + Date.now(),
      amount: parseFloat(amount),
      campaignId: campaignId,
      description: 'Mô phỏng nổ hũ',
      senderName: senderName || 'Mạnh Thường Quân (Test)'
    });
    res.json({ success: true });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

