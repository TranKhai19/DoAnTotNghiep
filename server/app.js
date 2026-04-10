require('dotenv').config();
const express = require('express');
const http = require('http');
const campaignRoutes = require('./routes/campaigns');
const webhookRoutes = require('./routes/webhooks');
const beneficiaryRoutes = require('./routes/beneficiaries');
const socketService = require('./services/socketService');
const notifyRoutes = require('./routes/notify');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// API Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/notify', notifyRoutes);

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
  }
});

// After io is initialized, attach on-chain contract event listeners (if contract exists)
try {
  const { fundChainContract } = require('./config/chain');
  if (fundChainContract && io) {
    // CampaignCreated(uint256 indexed campaignId,uint256 targetAmount)
    fundChainContract.on('CampaignCreated', (campaignId, targetAmount, event) => {
      try { io.emit('CampaignCreated', { campaignId: campaignId.toString(), targetAmount: targetAmount.toString() }); } catch (e) { console.error(e); }
    });

    // DonationRecorded(uint256 indexed campaignId,string indexed bankRef,uint256 amount)
    fundChainContract.on('DonationRecorded', (campaignId, bankRef, amount, event) => {
      try { io.emit('DonationRecorded', { campaignId: campaignId.toString(), bankRef, amount: amount.toString() }); } catch (e) { console.error(e); }
    });

    // FundsDisbursed(uint256 indexed campaignId,uint256 amount,string beneficiaryId)
    fundChainContract.on('FundsDisbursed', (campaignId, amount, beneficiaryId, event) => {
      try { io.emit('FundsDisbursed', { campaignId: campaignId.toString(), amount: amount.toString(), beneficiaryId }); } catch (e) { console.error(e); }
    });

    // CampaignClosed(uint256 indexed campaignId)
    fundChainContract.on('CampaignClosed', (campaignId, event) => {
      try { io.emit('CampaignClosed', { campaignId: campaignId.toString() }); } catch (e) { console.error(e); }
    });
  }
} catch (err) {
  // If chain config throws due to missing env, just log — server should still run for non-chain flows
  console.warn('Could not attach contract event listeners:', err.message);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
