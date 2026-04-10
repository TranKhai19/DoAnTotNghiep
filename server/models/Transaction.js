const supabase = require('../config/supabase');

const TABLE_NAME = 'transactions';

const createTransaction = async (tx) => {
  try {
    const { transaction_id, campaign_id, amount, sender_name, sender_account, description, timestamp } = tx;
    const row = {
      transaction_id,
      campaign_id,
      amount: parseFloat(amount),
      sender_name: sender_name || null,
      sender_account: sender_account || null,
      description: description || null,
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
    console.error('Error creating transaction:', error);
    throw error;
  }
};

module.exports = {
  createTransaction
};
