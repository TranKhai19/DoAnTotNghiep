const { createCampaign } = require('./models/Campaign');

async function test() {
  try {
    const res = await createCampaign({
      title: 'Test RLS Campaign',
      description: 'This is a test description 20 chars',
      goal_amount: 1000,
      start_date: '2026-05-15',
      end_date: '2026-06-15',
      status: 'pending_approval'
    });
    console.log('Success:', res);
  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();
