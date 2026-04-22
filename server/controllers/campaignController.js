const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  updateCampaignApproval,
  updateCampaignBlockchain,
  deleteCampaign,
  CAMPAIGN_STATUS,
  APPROVAL_STATUS,
} = require('../models/Campaign');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/campaigns
// Query params: ?status=draft&approval_status=pending&created_by=<uuid>
// ─────────────────────────────────────────────────────────────────────────────
exports.getCampaigns = async (req, res) => {
  try {
    const { status, approval_status, created_by } = req.query;
    const campaigns = await getAllCampaigns({ status, approval_status, created_by });
    res.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/campaigns/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/campaigns
// Body: { title, description, goal_amount, start_date, end_date,
//         qr_code?, category_id?, beneficiary_id?, status?, created_by? }
// status cho phép: 'draft' (mặc định) hoặc 'pending_approval' (gửi duyệt ngay)
// ─────────────────────────────────────────────────────────────────────────────
exports.createCampaign = async (req, res) => {
  try {
    const {
      title, description, goal_amount,
      raised_amount, qr_code, category_id, beneficiary_id,
      start_date, end_date, status, created_by,
    } = req.body;

    // Required field check (nhanh, trước khi vào model)
    if (!title || !description || !goal_amount || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, goal_amount, start_date, end_date',
      });
    }

    if (isNaN(Number(goal_amount)) || Number(goal_amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'goal_amount must be a positive number',
      });
    }

    const newCampaign = await createCampaign({
      title, description, goal_amount,
      raised_amount, qr_code, category_id, beneficiary_id,
      start_date, end_date, status, created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/campaigns/:id
// Chỉ staff/author được sửa, chỉ khi status = draft | rejected
// ─────────────────────────────────────────────────────────────────────────────
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await updateCampaign(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    });
  } catch (error) {
    const status = error.message === 'Campaign not found' ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/campaigns/:id/approval  (Admin only)
// Body: { approval_status: 'approved'|'rejected', rejection_reason?, approved_by? }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateCampaignApproval = async (req, res) => {
  try {
    const { approval_status, rejection_reason, approved_by } = req.body;

    if (!approval_status) {
      return res.status(400).json({
        success: false,
        error: 'approval_status is required (approved | rejected)',
      });
    }

    if (approval_status === APPROVAL_STATUS.REJECTED && !rejection_reason) {
      return res.status(400).json({
        success: false,
        error: 'rejection_reason is required when rejecting a campaign',
      });
    }

    const campaign = await updateCampaignApproval(req.params.id, {
      approval_status,
      rejection_reason,
      approved_by,
    });

    res.json({
      success: true,
      message: approval_status === APPROVAL_STATUS.APPROVED
        ? 'Campaign approved and is now active'
        : 'Campaign rejected',
      data: campaign,
    });
  } catch (error) {
    const status = error.message === 'Campaign not found' ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/campaigns/:id/blockchain  (Internal — called after on-chain tx)
// Body: { onchain_campaign_id, blockchain_tx_hash }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateCampaignBlockchain = async (req, res) => {
  try {
    const { onchain_campaign_id, blockchain_tx_hash } = req.body;

    if (!onchain_campaign_id && !blockchain_tx_hash) {
      return res.status(400).json({
        success: false,
        error: 'At least one of onchain_campaign_id or blockchain_tx_hash is required',
      });
    }

    const campaign = await updateCampaignBlockchain(req.params.id, {
      onchain_campaign_id,
      blockchain_tx_hash,
    });

    res.json({
      success: true,
      message: 'Campaign blockchain metadata updated',
      data: campaign,
    });
  } catch (error) {
    const status = error.message === 'Campaign not found' ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/campaigns/:id
// Chỉ xóa được khi status = draft | rejected
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await deleteCampaign(req.params.id);
    res.json({
      success: true,
      message: 'Campaign deleted successfully',
      data: campaign,
    });
  } catch (error) {
    const status = error.message === 'Campaign not found' ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};


