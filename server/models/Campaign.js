const supabase = require('../config/supabase');

const TABLE_NAME = 'campaigns';

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

// Create new campaign — toàn bộ field theo schema Supabase (snake_case)
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
      status,
      created_by
    } = campaignData;

    // Server-side validation
    if (!title || !description || !goal_amount || !start_date || !end_date) {
      throw new Error('Missing required fields: title, description, goal_amount, start_date, end_date');
    }

    if (goal_amount <= 0) {
      throw new Error('goal_amount must be greater than 0');
    }

    const newCampaign = {
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

// Update campaign — chấp nhận đúng tên field snake_case
const updateCampaign = async (id, updateData) => {
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Chỉ update những field được gửi lên (snake_case trực tiếp)
    const allowedFields = [
      'title', 'description',
      'goal_amount', 'raised_amount',
      'qr_code', 'category_id', 'beneficiary_id',
      'start_date', 'end_date',
      'status', 'created_by'
    ];

    const mappedData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        mappedData[field] = updateData[field];
      }
    });

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
