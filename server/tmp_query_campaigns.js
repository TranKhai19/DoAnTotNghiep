const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mfyncysdujxdeeypppbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meW5jeXNkdWp4ZGVleXBwcGJrIiwicm9sZSI6ImF1bm8iLCJpYXQiOjE3NzMzMjMxMjYsImV4cCI6MjA4ODg5OTEyNn0.0y77bgFmMNNF1pP_eAyciPEq7-EQB0MWUFPKpZmztAo';
const supabase = createClient(supabaseUrl, supabaseKey);
(async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, qr_code, title, status, approval_status, start_date, end_date')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('ERROR', error);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
})();
