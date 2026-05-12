const Queue = require('bull');

// Tạo queue cho webhook processing
// Nếu Redis không có, queue sẽ hoạt động ở chế độ "in-memory mock" để không crash server
let webhookQueue;
let redisAvailable = true;

// Mock queue khi không có Redis (dùng cho môi trường dev/demo)
const mockQueue = {
  add: async (data) => {
    const jobId = `mock_${Date.now()}`;
    console.log(`📝 [Mock Queue] Job ${jobId} added (Redis unavailable)`);
    // Process ngay lập tức (không async)
    return { id: jobId, data };
  },
  process: (concurrency, processor) => {
    console.log('⚠️  [Mock Queue] Processor registered (will process inline)');
    mockQueue._processor = processor;
  },
  on: () => {},
  _processor: null
};

try {
  webhookQueue = new Queue('webhooks', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
    },
  });

  webhookQueue.on('error', (error) => {
    if (!redisAvailable) return; // Chỉ log lần đầu
    redisAvailable = false;
    console.warn('⚠️  Redis unavailable, switching to inline processing:', error.message);
    
    // Nếu có processor đang xử lý, chuyển qua mockQueue
    if (webhookQueue._processor) {
        mockQueue._processor = webhookQueue._processor;
    }
    
    webhookQueue = mockQueue;
  });

  webhookQueue.on('failed', (job, error) => {
    console.error(`❌ Job ${job.id} failed:`, error.message);
  });

  webhookQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed:`, job.data.campaignId);
  });

} catch (err) {
  console.warn('⚠️  Could not create Bull queue, using inline mock:', err.message);
  webhookQueue = mockQueue;
  redisAvailable = false;
}

// Hàm thêm job vào queue
const addWebhookJob = async (jobData) => {
  try {
    console.log('🛠️ addWebhookJob called:', {
      transactionId: jobData.transactionId,
      amount: jobData.amount,
      campaignId: jobData.campaignId,
      useRedis: redisAvailable
    });
    const queue = redisAvailable ? webhookQueue : mockQueue;
    const job = await queue.add(jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false
    });

    // Nếu đang dùng mock + có processor, xử lý ngay
    const processorToUse = redisAvailable ? null : (mockQueue._processor || savedProcessor);
    if (processorToUse) {
      console.log('⚠️ Using inline mock processor for webhook job:', { jobId: job.id });
      setImmediate(() => {
        processorToUse(job).catch(err =>
          console.error('❌ Inline processor error:', err.message)
        );
      });
    }

    console.log(`📝 Webhook job ${job.id} added to queue`);
    return job;
  } catch (error) {
    console.error('❌ Error adding webhook job:', error);
    throw error;
  }
};

let savedProcessor = null;

// Khởi tạo queue processor
const initWebhookProcessor = (processor) => {
  savedProcessor = processor;
  if (redisAvailable) {
    webhookQueue.process(3, processor);
  } else {
    mockQueue._processor = processor;
  }
  console.log('✅ Webhook processor registered');
};

module.exports = {
  webhookQueue,
  addWebhookJob,
  initWebhookProcessor,
  getProcessor: () => savedProcessor
};

