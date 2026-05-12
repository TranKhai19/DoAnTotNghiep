/**
 * disbursementController.js
 * Luồng 3: Staff tạo yêu cầu giải ngân, Admin duyệt và ghi on-chain.
 */
const supabase = require('../config/supabase');
const contractService = require('../services/contractService');
const { uploadFileToIPFS } = require('../services/ipfsService');
const { hashText } = require('../services/hashService');

/**
 * GET /api/disbursements?campaign_id=...
 * Lấy danh sách tất cả yêu cầu giải ngân (Admin/Staff)
 */
exports.listDisbursements = async (req, res) => {
  try {
    const { campaign_id, status } = req.query;
    let query = supabase
      .from('disbursement_requests')
      .select(`
        *,
        campaign:campaigns(id, title, onchain_campaign_id),
        requester:profiles!requested_by(id, full_name),
        approver:profiles!approved_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (campaign_id) query = query.eq('campaign_id', campaign_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/disbursements
 * Staff tạo yêu cầu giải ngân
 * Body: { campaign_id, amount, reason }
 * File (multipart): proof_files
 */
exports.createDisbursement = async (req, res) => {
  try {
    const { campaign_id, amount, reason } = req.body;
    const requested_by = req.user?.id;

    if (!campaign_id || !amount || !reason) {
      return res.status(400).json({ success: false, error: 'Thiếu campaign_id, số tiền hoặc lý do giải ngân' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Số tiền không hợp lệ' });
    }

    // Kiểm tra campaign active
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('id, title, status, raised_amount, onchain_campaign_id')
      .eq('id', campaign_id)
      .single();

    if (campErr || !campaign) {
      return res.status(404).json({ success: false, error: 'Chiến dịch không tồn tại' });
    }
    if (!['active', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ success: false, error: 'Chiến dịch phải đang active hoặc completed' });
    }

    // Upload file chứng minh lên IPFS (nếu có)
    let proof_documents = null;
    if (req.files && req.files.length > 0) {
      try {
        console.log(`📤 [IPFS] Uploading ${req.files.length} files to Pinata...`);
        const uploaded = await Promise.all(
          req.files.map(f => uploadFileToIPFS(f.buffer, f.originalname, f.mimetype))
        );
        proof_documents = uploaded.map(u => ({ name: u.cid, gatewayUrl: u.gatewayUrl, ipfsUrl: u.ipfsUrl }));
        console.log(`✅ [IPFS] Upload successful:`, proof_documents.map(d => d.name));
      } catch (ipfsErr) {
        console.error('❌ [IPFS] Pinata upload failed:', ipfsErr.message);
        return res.status(500).json({ 
          success: false, 
          error: `Lỗi upload tài liệu chứng minh lên IPFS: ${ipfsErr.message}` 
        });
      }
    }

    const { data, error } = await supabase
      .from('disbursement_requests')
      .insert([{
        campaign_id,
        requested_by,
        amount: parsedAmount,
        reason,
        proof_documents,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ [DISBURSEMENT] Supabase insert error:', error);
      throw error;
    }
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('❌ [DISBURSEMENT] Error creating disbursement request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/disbursements/:id/approve
 * Admin duyệt yêu cầu giải ngân -> gọi Smart Contract disburseFunds
 */
exports.approveDisbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user?.id;

    // Lấy thông tin yêu cầu giải ngân
    const { data: request, error: reqErr } = await supabase
      .from('disbursement_requests')
      .select(`*, campaign:campaigns(id, title, onchain_campaign_id, beneficiary_id)`)
      .eq('id', id)
      .single();

    if (reqErr || !request) {
      return res.status(404).json({ success: false, error: 'Yêu cầu giải ngân không tồn tại' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Yêu cầu đã ở trạng thái ${request.status}` });
    }

    const onchain_campaign_id = request.campaign?.onchain_campaign_id;
    if (!onchain_campaign_id) {
      return res.status(400).json({ success: false, error: 'Chiến dịch chưa được mint lên Blockchain' });
    }

    // Tạo reasonHash từ thông tin yêu cầu
    const reasonPayload = {
      disbursement_id: id,
      campaign_id: request.campaign_id,
      amount: request.amount,
      reason: request.reason,
      proof_documents: request.proof_documents,
      timestamp: new Date().toISOString()
    };
    const reasonHash = hashText(JSON.stringify(reasonPayload));

    // Gọi Smart Contract disburseFunds
    const beneficiaryId = request.campaign?.beneficiary_id || 'unknown';
    const result = await contractService.disburseFunds(
      onchain_campaign_id,
      Math.round(request.amount),
      beneficiaryId.toString(),
      reasonHash
    );

    // Cập nhật trạng thái trong DB
    const { data, error } = await supabase
      .from('disbursement_requests')
      .update({
        status: 'approved',
        approved_by,
        tx_hash: result.transactionHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Đã duyệt giải ngân và ghi lên Blockchain',
      data,
      blockchain: { tx_hash: result.transactionHash, reasonHash }
    });
  } catch (error) {
    console.error('Approve disbursement error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/disbursements/:id/reject
 * Admin từ chối yêu cầu giải ngân
 */
exports.rejectDisbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const approved_by = req.user?.id;

    const { data, error } = await supabase
      .from('disbursement_requests')
      .update({
        status: 'rejected',
        approved_by,
        reason: reason || 'Không được duyệt',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Đã từ chối yêu cầu giải ngân', data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
