/**
 * reportController.js
 * Luồng 4: Staff nộp báo cáo thực địa, Admin nghiệm thu và đóng chiến dịch on-chain.
 */
const supabase = require('../config/supabase');
const contractService = require('../services/contractService');
const { uploadFileToIPFS } = require('../services/ipfsService');
const { hashText } = require('../services/hashService');

/**
 * GET /api/reports?campaign_id=...
 */
exports.listReports = async (req, res) => {
  try {
    const { campaign_id } = req.query;
    let query = supabase
      .from('campaign_reports')
      .select(`
        *,
        campaign:campaigns(id, title, onchain_campaign_id),
        reporter:profiles!reported_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (campaign_id) query = query.eq('campaign_id', campaign_id);
    
    // Nếu là public (không có user hoặc user không phải admin/staff), chỉ hiện 'approved'
    const isInternal = req.user && (req.user.role === 'admin' || req.user.role === 'staff');
    if (!isInternal) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/reports
 * Staff nộp báo cáo thực địa + upload ảnh hóa đơn lên IPFS
 * Body: { campaign_id, description }
 * File (multipart): invoice_files
 */
exports.createReport = async (req, res) => {
  try {
    const { campaign_id, description } = req.body;
    const reported_by = req.user?.id;

    if (!campaign_id || !description) {
      return res.status(400).json({ success: false, error: 'Thiếu campaign_id hoặc description' });
    }

    // Upload hóa đơn, ảnh thực địa lên IPFS
    let invoice_documents = null;
    if (req.files && req.files.length > 0) {
      const uploaded = await Promise.all(
        req.files.map(f => uploadFileToIPFS(f.buffer, f.originalname, f.mimetype))
      );
      invoice_documents = uploaded.map(u => ({
        name: u.cid,
        gatewayUrl: u.gatewayUrl,
        ipfsUrl: u.ipfsUrl
      }));
    }

    const { data, error } = await supabase
      .from('campaign_reports')
      .insert([{
        campaign_id,
        reported_by,
        description,
        invoice_documents,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/reports/:id/close-campaign
 * Admin nghiệm thu, băm báo cáo và gọi closeCampaign on-chain
 */
exports.closeWithReport = async (req, res) => {
  try {
    const { id } = req.params; // report ID

    // Lấy thông tin báo cáo
    const { data: report, error: repErr } = await supabase
      .from('campaign_reports')
      .select(`*, campaign:campaigns(id, title, onchain_campaign_id)`)
      .eq('id', id)
      .single();

    if (repErr || !report) {
      return res.status(404).json({ success: false, error: 'Báo cáo không tồn tại' });
    }

    const onchain_campaign_id = report.campaign?.onchain_campaign_id;
    if (!onchain_campaign_id) {
      return res.status(400).json({ success: false, error: 'Chiến dịch chưa được mint lên Blockchain' });
    }

    // Tạo proofHash từ toàn bộ nội dung báo cáo
    const proofPayload = {
      report_id: id,
      campaign_id: report.campaign_id,
      description: report.description,
      invoice_documents: report.invoice_documents,
      timestamp: new Date().toISOString()
    };
    const proofHash = hashText(JSON.stringify(proofPayload));

    // Gọi Smart Contract closeCampaign với proofHash
    const result = await contractService.closeCampaign(onchain_campaign_id, proofHash);

    // Cập nhật tx_hash vào báo cáo
    await supabase
      .from('campaign_reports')
      .update({ tx_hash: result.transactionHash, updated_at: new Date().toISOString() })
      .eq('id', id);

    // Cập nhật trạng thái campaign thành closed
    await supabase
      .from('campaigns')
      .update({ status: 'closed' })
      .eq('id', report.campaign_id);

    res.json({
      success: true,
      message: 'Đã đóng chiến dịch và ghi bằng chứng lên Blockchain',
      blockchain: { tx_hash: result.transactionHash, proofHash }
    });
  } catch (error) {
    console.error('Close campaign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/reports/:id/approve
 * Admin duyệt báo cáo nghiệm thu
 */
exports.approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('campaign_reports')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Đã duyệt báo cáo', data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/reports/:id/reject
 * Admin từ chối báo cáo nghiệm thu
 */
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('campaign_reports')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Đã từ chối báo cáo', data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
