// Ensure .env is loaded even if this module is required before app.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
