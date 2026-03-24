const supabase = require('../config/supabase');

const TABLE_NAME = 'campaigns'; // Tên bảng trong Supabase

// Get all campaigns
const getAllCampaigns = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// Get campaign by ID
const getCampaignById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

// Create new campaign
const createCampaign = async (campaignData) => {
  try {
    const { title, description, goalAmount, startDate, endDate, qrCode, contractAddress } = campaignData;

    // Validation
    if (!title || !description || !goalAmount || !startDate || !endDate) {
      throw new Error('Missing required fields: title, description, goalAmount, startDate, endDate');
    }

    if (goalAmount <= 0) {
      throw new Error('Goal amount must be greater than 0');
    }

    const newCampaign = {
      title,
      description,
      goal_amount: parseFloat(goalAmount),
      raised_amount: 0,
      start_date: startDate,
      end_date: endDate,
      status: 'active'
    };

    if (qrCode) newCampaign.qr_code = qrCode;
    if (contractAddress) newCampaign.contract_address = contractAddress;

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

// Update campaign
const updateCampaign = async (id, updateData) => {
  try {
    // Kiểm tra campaign tồn tại
    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Map frontend field names to database field names
    const mappedData = {};
    if (updateData.title) mappedData.title = updateData.title;
    if (updateData.description) mappedData.description = updateData.description;
    if (updateData.goalAmount !== undefined) mappedData.goal_amount = updateData.goalAmount;
    if (updateData.raisedAmount !== undefined) mappedData.raised_amount = updateData.raisedAmount;
    if (updateData.startDate) mappedData.start_date = updateData.startDate;
    if (updateData.endDate) mappedData.end_date = updateData.endDate;
    if (updateData.status) mappedData.status = updateData.status;
    if (updateData.qrCode) mappedData.qr_code = updateData.qrCode;
    if (updateData.contractAddress) mappedData.contract_address = updateData.contractAddress;

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

// Delete campaign
const deleteCampaign = async (id) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
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

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign
};
