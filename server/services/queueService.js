const Queue = require('bull');

// Tạo queue cho webhook processing
const webhookQueue = new Queue('webhooks', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  settings: {
    maxStalledCount: 3,        // Max attempts khi stall
    maxRetriesPerRequest: 3,   // Retry 3 lần
    lockDuration: 30000,       // Lock 30 seconds
    lockRenewTime: 15000       // Renew lock mỗi 15 seconds
  }
});

// Xử lý khi có lỗi
webhookQueue.on('error', (error) => {
  console.error('❌ Queue Error:', error);
});

webhookQueue.on('failed', (job, error) => {
  console.error(`❌ Job ${job.id} failed after 3 attempts:`, error.message);
});

webhookQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed:`, job.data.campaignId);
});

// Hàm thêm job vào queue
const addWebhookJob = async (jobData) => {
  try {
    const job = await webhookQueue.add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000  // Start with 2s, exponential growth
      },
      removeOnComplete: true,
      removeOnFail: false  // Keep failed jobs for debugging
    });
    
    console.log(`📝 Webhook job ${job.id} added to queue`);
    return job;
  } catch (error) {
    console.error('❌ Error adding webhook job:', error);
    throw error;
  }
};

// Khởi tạo queue processor
const initWebhookProcessor = (processor) => {
  webhookQueue.process(3, processor); // 3 concurrent workers
};

module.exports = {
  webhookQueue,
  addWebhookJob,
  initWebhookProcessor
};
