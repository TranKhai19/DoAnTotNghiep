const supabase = require('../config/supabase');
const contractService = require('../services/contractService');

const TABLE_NAME = 'campaigns';

// ─── Enum constants (đồng bộ với migration 005) ───────────────────────────────
const CAMPAIGN_STATUS = {
  DRAFT:            'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE:           'active',
  COMPLETED:        'completed',
  REJECTED:         'rejected',
  CLOSED:           'closed',
};

const APPROVAL_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const VALID_CAMPAIGN_STATUSES  = Object.values(CAMPAIGN_STATUS);
const VALID_APPROVAL_STATUSES  = Object.values(APPROVAL_STATUS);

// ─── Allowed update fields (không bao gồm các field chỉ admin mới được sửa) ──
const PUBLIC_UPDATE_FIELDS = [
  'title', 'description',
  'goal_amount', 'raised_amount',
  'qr_code', 'category_id', 'beneficiary_id',
  'start_date', 'end_date',
  'status',
];

const ADMIN_UPDATE_FIELDS = [
  ...PUBLIC_UPDATE_FIELDS,
  'approval_status', 'approved_by', 'approved_at', 'rejection_reason',
  'onchain_campaign_id', 'blockchain_tx_hash', 'blockchain_minted_at',
];

// ─────────────────────────────────────────────────────────────────────────────
// Get all campaigns
// ─────────────────────────────────────────────────────────────────────────────
const getAllCampaigns = async ({ status, approval_status, created_by } = {}) => {
  try {
    let query = supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (status)          query = query.eq('status', status);
    if (approval_status) query = query.eq('approval_status', approval_status);
    if (created_by)      query = query.eq('created_by', created_by);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get campaign by ID
// ─────────────────────────────────────────────────────────────────────────────
const getCampaignById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    // PGRST116 = "no rows found" — tất cả lỗi khác mới throw
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Create campaign — luôn tạo với status='draft', approval_status='pending'
// ─────────────────────────────────────────────────────────────────────────────
const createCampaign = async (campaignData) => {
  try {
    const {
      title,
      description,
      goal_amount,
      raised_amount,
      qr_code,
      category_id,
      beneficiary_id,
      start_date,
      end_date,
      created_by,
      status,            // staff có thể truyền 'draft' hoặc 'pending_approval'
    } = campaignData;

    // Validation bắt buộc
    if (!title || !description || !goal_amount || !start_date || !end_date) {
      throw new Error(
        'Missing required fields: title, description, goal_amount, start_date, end_date'
      );
    }

    if (isNaN(Number(goal_amount)) || Number(goal_amount) <= 0) {
      throw new Error('goal_amount must be a positive number');
    }

    if (new Date(end_date) < new Date(start_date)) {
      throw new Error('end_date must be on or after start_date');
    }

    // Chỉ cho phép status hợp lệ lúc tạo
    const allowedCreateStatuses = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.PENDING_APPROVAL];
    const resolvedStatus = allowedCreateStatuses.includes(status)
      ? status
      : CAMPAIGN_STATUS.DRAFT;

    const newCampaign = {
      title:            title.trim(),
      description:      description.trim(),
      goal_amount:      parseFloat(goal_amount),
      raised_amount:    raised_amount !== undefined ? parseFloat(raised_amount) : 0,
      qr_code:          qr_code || null,
      category_id:      category_id ? parseInt(category_id) : null,
      beneficiary_id:   beneficiary_id || null,
      start_date,
      end_date,
      status:           resolvedStatus,
      approval_status:  APPROVAL_STATUS.PENDING,  // luôn bắt đầu là pending
      created_by:       created_by || null,
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([newCampaign])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update campaign (staff update — không cho phép sửa approval fields)
// ─────────────────────────────────────────────────────────────────────────────
const updateCampaign = async (id, updateData) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) throw new Error('Campaign not found');

    // Chỉ cho phép chỉnh sửa khi đang là draft hoặc bị rejected
    const editableStatuses = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.REJECTED];
    if (!editableStatuses.includes(campaign.status)) {
      throw new Error(
        `Cannot edit campaign with status "${campaign.status}". Only draft or rejected campaigns can be edited.`
      );
    }

    const mappedData = {};
    PUBLIC_UPDATE_FIELDS.forEach(field => {
      if (updateData[field] !== undefined) {
        mappedData[field] = updateData[field];
      }
    });

    // Validate status transition khi staff cập nhật
    if (mappedData.status) {
      const allowedTransitions = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.PENDING_APPROVAL];
      if (!allowedTransitions.includes(mappedData.status)) {
        throw new Error(`Invalid status transition: "${mappedData.status}"`);
      }
      // Nếu submit lại sau khi rejected, reset approval_status
      if (campaign.status === CAMPAIGN_STATUS.REJECTED && mappedData.status === CAMPAIGN_STATUS.PENDING_APPROVAL) {
        mappedData.approval_status  = APPROVAL_STATUS.PENDING;
        mappedData.rejection_reason = null;
      }
    }

    if (Object.keys(mappedData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(mappedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update campaign approval (admin only)
// Xử lý duyệt hoặc từ chối — cập nhật approval_status, status và metadata
// ─────────────────────────────────────────────────────────────────────────────
const updateCampaignApproval = async (id, { approval_status, rejection_reason, approved_by }) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) throw new Error('Campaign not found');

    if (!VALID_APPROVAL_STATUSES.includes(approval_status)) {
      throw new Error(`Invalid approval_status: "${approval_status}". Must be one of: ${VALID_APPROVAL_STATUSES.join(', ')}`);
    }

    if (campaign.status !== CAMPAIGN_STATUS.PENDING_APPROVAL) {
      throw new Error(
        `Campaign must be in "pending_approval" status to be reviewed. Current status: "${campaign.status}"`
      );
    }

    const updatePayload = {
      approval_status,
      approved_by:   approved_by || null,
      approved_at:   new Date().toISOString(),
    };

    if (approval_status === APPROVAL_STATUS.APPROVED) {
      updatePayload.status           = CAMPAIGN_STATUS.ACTIVE;
      updatePayload.rejection_reason = null;
    } else if (approval_status === APPROVAL_STATUS.REJECTED) {
      updatePayload.status           = CAMPAIGN_STATUS.REJECTED;
      updatePayload.rejection_reason = rejection_reason || null;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating campaign approval:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update blockchain metadata (sau khi onchain tx thành công)
// ─────────────────────────────────────────────────────────────────────────────
const updateCampaignBlockchain = async (id, { onchain_campaign_id, blockchain_tx_hash }) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) throw new Error('Campaign not found');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        onchain_campaign_id:  onchain_campaign_id ?? campaign.onchain_campaign_id,
        blockchain_tx_hash:   blockchain_tx_hash  ?? campaign.blockchain_tx_hash,
        blockchain_minted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating campaign blockchain metadata:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete campaign (chỉ cho phép xóa nháp hoặc bị từ chối)
// ─────────────────────────────────────────────────────────────────────────────
const deleteCampaign = async (id) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) throw new Error('Campaign not found');

    const deletableStatuses = [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.REJECTED];
    if (!deletableStatuses.includes(campaign.status)) {
      throw new Error(
        `Cannot delete campaign with status "${campaign.status}". Only draft or rejected campaigns can be deleted.`
      );
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

// Get all draft campaigns
const getDraftCampaigns = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching draft campaigns:', error);
    throw error;
  }
};

// Approve (publish) draft campaign & mint on blockchain
const approveCampaign = async (id) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new Error(`Campaign status is ${campaign.status}, not draft. Can only approve draft campaigns.`);
    }

    // Khi approve, cần có start_date và end_date
    if (!campaign.start_date || !campaign.end_date) {
      throw new Error('Campaign must have start_date and end_date to be approved');
    }

    // Step 1: Mint campaign on blockchain (Besu)
    let blockchainTxHash = null;
    let blockchainReceipt = null;
    try {
      blockchainReceipt = await contractService.createCampaign(campaign.goal_amount);
      blockchainTxHash = blockchainReceipt?.transactionHash || null;
      console.log(`✅ Campaign ${id} minted on blockchain: ${blockchainTxHash}`);
    } catch (blockchainError) {
      console.error(`⚠️ Blockchain minting failed for campaign ${id}:`, blockchainError.message);
      throw new Error(`Failed to mint campaign on blockchain: ${blockchainError.message}`);
    }

    // Step 2: Update campaign status in database
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        status: 'published',
        approved_at: new Date().toISOString(),
        blockchain_tx_hash: blockchainTxHash
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Step 3: Return both database record and blockchain receipt
    return {
      campaign: data,
      blockchain: {
        txHash: blockchainTxHash,
        receipt: blockchainReceipt,
        transactionHash: blockchainTxHash
      }
    };
  } catch (error) {
    console.error('Error approving campaign:', error);
    throw error;
  }
};

// Reject draft campaign
const rejectCampaign = async (id, reasonForRejection = null) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new Error(`Campaign status is ${campaign.status}, not draft. Can only reject draft campaigns.`);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        status: 'rejected',
        rejection_reason: reasonForRejection || null,
        rejected_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error rejecting campaign:', error);
    throw error;
  }
};

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  updateCampaignApproval,
  updateCampaignBlockchain,
  deleteCampaign,
  CAMPAIGN_STATUS,
  APPROVAL_STATUS,
};
