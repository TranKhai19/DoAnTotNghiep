const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getDraftCampaigns,
  approveCampaign,
  rejectCampaign
} = require('../models/Campaign');

// Get all campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    res.json({
      success: true,
      data: campaigns,
      total: campaigns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create campaign
exports.createCampaign = async (req, res) => {
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
      status,
      created_by
    } = req.body;

    // Validation theo schema mới (snake_case)
    if (!title || !description || !goal_amount || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, goal_amount, start_date, end_date'
      });
    }

    if (isNaN(goal_amount) || goal_amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'goal_amount must be a positive number'
      });
    }

    const campaignData = {
      title,
      description,
      goal_amount: parseFloat(goal_amount),
      raised_amount: raised_amount !== undefined ? parseFloat(raised_amount) : 0,
      qr_code: qr_code || null,
      category_id: category_id ? parseInt(category_id) : null,
      beneficiary_id: beneficiary_id || null,
      start_date,
      end_date,
      status: status || 'Đang chạy',
      created_by: created_by || null
    };

    const newCampaign = await createCampaign(campaignData);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await updateCampaign(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await deleteCampaign(req.params.id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
      data: campaign
    });
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Create draft campaign
exports.createDraft = async (req, res) => {
  try {
    const {
      title,
      description,
      goal_amount,
      qr_code,
      category_id,
      beneficiary_id,
      start_date,
      end_date,
      created_by
    } = req.body;

    // Validation - chỉ cần título, description, goal_amount
    if (!title || !description || !goal_amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, goal_amount'
      });
    }

    if (isNaN(goal_amount) || goal_amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'goal_amount must be a positive number'
      });
    }

    const campaignData = {
      title,
      description,
      goal_amount: parseFloat(goal_amount),
      qr_code: qr_code || null,
      category_id: category_id ? parseInt(category_id) : null,
      beneficiary_id: beneficiary_id || null,
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: created_by || null,
      draft: true
    };

    const newDraft = await createCampaign(campaignData);

    res.status(201).json({
      success: true,
      message: 'Draft campaign created successfully',
      data: newDraft
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update draft campaign
exports.updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: `Cannot update campaign in ${campaign.status} status. Only draft campaigns can be updated.`
      });
    }

    const updatedCampaign = await updateCampaign(id, req.body);

    res.json({
      success: true,
      message: 'Draft campaign updated successfully',
      data: updatedCampaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all draft campaigns (for Admin review)
exports.getDrafts = async (req, res) => {
  try {
    const drafts = await getDraftCampaigns();
    res.json({
      success: true,
      data: drafts,
      total: drafts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin approve draft campaign
exports.approveDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedCampaign = await approveCampaign(id);

    res.json({
      success: true,
      message: 'Campaign approved and published successfully',
      data: approvedCampaign
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('not draft')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin reject draft campaign
exports.rejectDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const rejectedCampaign = await rejectCampaign(id, reason || null);

    res.json({
      success: true,
      message: 'Campaign rejected',
      data: rejectedCampaign
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('not draft')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
