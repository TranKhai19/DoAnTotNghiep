const supabase = require('./config/supabase');

async function check() {
  const newCampaign = {
    title: 'Test insert script',
    description: 'Test insert script description',
    goal_amount: 100,
    start_date: '2026-04-01T00:00:00Z',
    end_date: '2026-12-31T00:00:00Z',
    status: 'draft',
    beneficiary_id: null
  };
  
  const { data, error } = await supabase
      .from('campaigns')
      .insert([newCampaign])
      .select()
      .single();
      
  console.log("Insert result:");
  console.log("Data:", data);
  console.log("Error:", error);
}
check();
