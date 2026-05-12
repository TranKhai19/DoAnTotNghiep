require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const campaignRoutes = require('./routes/campaigns');
const webhookRoutes = require('./routes/webhooks');
const authRoutes = require('./routes/authRoutes');
const disbursementRoutes = require('./routes/disbursements');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');

const socketService = require('./services/socketService');
const { initWebhookProcessor } = require('./services/queueService');
const { processBankWebhook } = require('./services/webhookProcessingService');
const { initBlockchainEventProcessor, startFailedEventRecovery } = require('./services/blockchainEventService');

const app = express();

// CORS cho các client như React chạy ở localhost:3002
app.use(cors({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Traffic Debugger
app.use((req, res, next) => {
  console.log(`🌐 [TRAFFIC] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/disbursements', disbursementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server with Socket.io
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketService.init(server, {
  cors: {
    origin: '*'
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// After io is initialized, initialize blockchain event processor (async)
(async () => {
  try {
    const processorReady = await initBlockchainEventProcessor();
    if (processorReady) {
      // Start periodic recovery task for failed events
      startFailedEventRecovery();
      console.log('✅ Blockchain event processor initialized and recovery task started');
    }
  } catch (err) {
    console.warn('⚠️ Could not initialize blockchain event processor:', err.message);
  }

  // Initialize webhook queue processor
  try {
    initWebhookProcessor(processBankWebhook);
    console.log('✅ Webhook queue processor initialized');
  } catch (err) {
    console.warn('⚠️  Could not initialize webhook queue processor:', err.message);
  }

  // Start server after all async initializations
  server.listen(PORT, () => {
    console.log('🚀 [SYSTEM] SERVER RESTARTED - VERSION 1.0.1 (DEBUG ENABLED)');
    console.log(`Server is running on port ${PORT}`);
  });
})();
