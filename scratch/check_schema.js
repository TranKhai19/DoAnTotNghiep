const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mfyncysdujxdeeypppbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meW5jeXNkdWp4ZGVleXBwcGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjMxMjYsImV4cCI6MjA4ODg5OTEyNn0.0y77bgFmMNNF1pP_eAyciPEq7-EQB0MWUFPKpZmztAo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('campaigns').select('id, beneficiary_id').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);

  // Try to insert a row with beneficiary_id = null
  const { data: insertData, error: insertError } = await supabase.from('campaigns').insert([{
    title: 'test schema',
    description: 'test schema',
    goal_amount: 100,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    beneficiary_id: null
  }]);
  console.log("Insert Error with null:", insertError);

  // Try to insert a row OMITTING beneficiary_id
  const { data: insertData2, error: insertError2 } = await supabase.from('campaigns').insert([{
    title: 'test schema 2',
    description: 'test schema',
    goal_amount: 100,
    start_date: '2026-01-01',
    end_date: '2026-12-31'
  }]);
  console.log("Insert Error omitting:", insertError2);
}
check();
