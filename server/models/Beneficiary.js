let supabase;
try { supabase = require('../config/supabase'); } catch (e) { supabase = null; }

const TABLE_NAME = 'beneficiaries';

// If Supabase points to a local placeholder or anon key is used, allow an in-memory fallback
const useInMemory = (() => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_KEY || '';
  if (!supabase) return true;
  if (url.includes('127.0.0.1') || url.includes('localhost')) return true;
  if (key.toLowerCase().includes('anon')) return true;
  return false;
})();

// Simple in-memory store for local/dev testing
const _inMemory = { rows: [], nextId: 1 };

const getAllBeneficiaries = async () => {
  try {
    if (useInMemory) {
      return _inMemory.rows.slice().reverse();
    }
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    throw error;
  }
};

const getBeneficiaryById = async (id) => {
  try {
    if (useInMemory) {
      const found = _inMemory.rows.find(r => String(r.id) === String(id));
      return found || null;
    }
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    throw error;
  }
};

const createBeneficiary = async (beneficiaryData) => {
  try {
    const { name, email, phone, address, image_url, image_public_id } = beneficiaryData;

    if (!name) throw new Error('Missing required field: name');

    if (useInMemory) {
      const row = {
        id: _inMemory.nextId++,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        image_url: image_url || null,
        image_public_id: image_public_id || null,
        created_at: new Date().toISOString()
      };
      _inMemory.rows.push(row);
      return row;
    }

    const newRow = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      image_url: image_url || null,
      image_public_id: image_public_id || null
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([newRow])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    throw error;
  }
};

const updateBeneficiary = async (id, updateData) => {
  try {
    const beneficiary = await getBeneficiaryById(id);
    if (!beneficiary) throw new Error('Beneficiary not found');

    const mapped = {};
    if (updateData.name) mapped.name = updateData.name;
    if (updateData.email !== undefined) mapped.email = updateData.email;
    if (updateData.phone !== undefined) mapped.phone = updateData.phone;
    if (updateData.address !== undefined) mapped.address = updateData.address;
    if (updateData.image_url !== undefined) mapped.image_url = updateData.image_url;
    if (updateData.image_public_id !== undefined) mapped.image_public_id = updateData.image_public_id;

    if (useInMemory) {
      const idx = _inMemory.rows.findIndex(r => String(r.id) === String(id));
      if (idx === -1) throw new Error('Beneficiary not found');
      _inMemory.rows[idx] = { ..._inMemory.rows[idx], ...mapped };
      return _inMemory.rows[idx];
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(mapped)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    throw error;
  }
};

const deleteBeneficiary = async (id) => {
  try {
    const beneficiary = await getBeneficiaryById(id);
    if (!beneficiary) throw new Error('Beneficiary not found');

    if (useInMemory) {
      const idx = _inMemory.rows.findIndex(r => String(r.id) === String(id));
      if (idx === -1) throw new Error('Beneficiary not found');
      const deleted = _inMemory.rows.splice(idx, 1)[0];
      return deleted;
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
    console.error('Error deleting beneficiary:', error);
    throw error;
  }
};

module.exports = {
  getAllBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary
};
