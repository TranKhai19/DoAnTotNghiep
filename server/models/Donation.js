const supabase = require('../config/supabase');

const TABLE_NAME = 'donations';

const createDonation = async (donation) => {
  try {
    const { campaign_id, bank_ref, amount, donor, transaction_hash, timestamp } = donation;
    const row = {
      campaign_id: campaign_id || null,
      bank_ref: bank_ref || null,
      amount: parseFloat(amount) || 0,
      donor: donor || null,
      transaction_hash: transaction_hash || null,
      timestamp: timestamp || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([row])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};

module.exports = {
  createDonation
};
