const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mfyncysdujxdeeypppbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meW5jeXNkdWp4ZGVleXBwcGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjMxMjYsImV4cCI6MjA4ODg5OTEyNn0.0y77bgFmMNNF1pP_eAyciPEq7-EQB0MWUFPKpZmztAo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('beneficiaries').select('id').limit(1);
  console.log("Beneficiaries:", data);
  console.log("Error:", error);
}
check();
