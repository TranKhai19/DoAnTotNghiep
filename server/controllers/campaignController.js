const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign
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
    const { title, description, goalAmount, startDate, endDate, createdBy, qrCode, contractAddress } = req.body;

    // Validation
    if (!title || !description || !goalAmount || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, goalAmount, startDate, endDate'
      });
    }

    if (isNaN(goalAmount) || goalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Goal amount must be a positive number'
      });
    }

    const campaignData = {
      title,
      description,
      goalAmount: parseFloat(goalAmount),
      startDate,
      endDate,
      qrCode,
      contractAddress
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
