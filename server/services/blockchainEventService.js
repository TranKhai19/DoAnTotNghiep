/**
 * Blockchain Event Processor Service
 * Listens to blockchain events (DonationReceived, CampaignCreated, etc.)
 * Processes them and stores in off-chain database for audit trail
 */

const supabase = require('../config/supabase');
let fundChainContract = null;
let socketService = null;
let isProcessing = false;

const EVENTS_TABLE = 'blockchain_events';
const DONATIONS_TABLE = 'donations';
const CAMPAIGNS_TABLE = 'campaigns';

/**
 * Initialize blockchain event listeners
 * Called from app.js after Socket.io is initialized
 */
const initBlockchainEventProcessor = async () => {
  try {
    // Import here to avoid circular dependency
    fundChainContract = require('../config/chain').fundChainContract;
    socketService = require('./socketService');

    if (!fundChainContract) {
      console.warn('⚠️ Blockchain contract not available - event processor disabled');
      return false;
    }

    console.log('🔗 Initializing blockchain event processor...');

    // Log khi có client kết nối để dễ debug
    const io = socketService.getIo();
    io.on('connection', (socket) => {
      console.log(`📱 Client connected to Socket.io: ${socket.id}`);
    });

    // Listen to DonationRecorded events
    // Ethers v6 signature: (campaignId, bankRef, amount, eventPayload)
    fundChainContract.on('DonationRecorded', async (campaignId, bankRef, amount, payload) => {
      try {
        console.log('📦 Full Event Payload:', JSON.stringify(payload, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
        
        // Cách lấy txHash an toàn cho Ethers v6
        const txHash = payload.log?.transactionHash || payload.transactionHash || (payload.log && payload.log.hash) || 'unknown';
        console.log(`🔔 New on-chain event: DonationRecorded. Tx: ${txHash}`);
        
        await processDonationReceivedEvent({ 
          campaignId: campaignId.toString(), 
          bankRef, 
          amount: amount.toString(), 
          event: { transactionHash: txHash, blockNumber: payload.log?.blockNumber } 
        });
      } catch (err) {
        console.error('❌ Error in DonationRecorded listener:', err);
      }
    });

    // TEST SOCKET: Xóa bot test - gây lỗi async response
    // Chỉ emit khi có event thực tế từ blockchain

    // Listen to CampaignCreated event
    fundChainContract.on('CampaignCreated', async (campaignId, targetAmount, event) => {
      await processCampaignCreatedEvent({
        campaignId: campaignId.toString(),
        targetAmount: targetAmount.toString(),
        event: event
      });
    });

    // Listen to FundsDisbursed event
    fundChainContract.on('FundsDisbursed', async (campaignId, amount, beneficiaryId, event) => {
      await processFundsDisbursedEvent({
        campaignId: campaignId.toString(),
        amount: amount.toString(),
        beneficiaryId,
        event: event
      });
    });

    // Listen to CampaignClosed event
    fundChainContract.on('CampaignClosed', async (campaignId, event) => {
      await processCampaignClosedEvent({
        campaignId: campaignId.toString(),
        event: event
      });
    });

    console.log('✅ Blockchain event processor initialized - listening to contract events');
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to initialize blockchain event processor:', error.message);
    return false;
  }
};

/**
 * Process DonationRecorded event from blockchain
 * Creates corresponding donation record in database if not exists
 */
const processDonationReceivedEvent = async (eventData) => {
  if (isProcessing) return; // Prevent concurrent processing
  isProcessing = true;

  try {
    const { campaignId, bankRef, amount, event } = eventData;
    const txHash = event?.transactionHash || event?.hash || null;

    console.log(`📝 Processing DonationRecorded event: campaign=${campaignId}, amount=${amount}, txHash=${txHash}`);

    // Store event in blockchain_events table for audit
    await storeBlockchainEvent({
      eventName: 'DonationRecorded',
      campaignId,
      bankRef,
      amount,
      txHash,
      blockNumber: event?.blockNumber,
      payload: eventData
    });

    console.log('🚀 processDonationReceivedEvent triggered!');
    
    // Phát socket nổ hũ nếu là sự kiện từ blockchain (dành cho người dùng đang xem trang)
    try {
      const { getIo } = require('./socketService');
      const { getCampaignById } = require('../models/Campaign');
      const io = getIo();
      const campaign = await getCampaignById(campaignId);
      
      if (io && campaign) {
        console.log(`📣 Emitting donation:confirmed for campaign ${campaign.id} ($${amount})`);
        io.emit('donation:confirmed', {
          campaignId: campaign.id,
          transactionId: bankRef || `onchain_${txHash?.substring(0, 10)}`,
          amount: parseFloat(amount),
          newRaisedAmount: campaign.raised_amount,
          txHash,
          donorName: 'Người dùng On-chain',
          campaignTitle: campaign.title,
          timestamp: new Date().toISOString()
        });
      }
    } catch (socketErr) {
      console.warn('⚠️ [SOCKET-DEBUG] Error emitting socket:', socketErr.message);
      console.warn('Stack trace:', socketErr.stack);
    }

    console.log(`✅ Event DonationRecorded audited successfully.`);
  } catch (error) {
    console.error('❌ Error processing DonationRecorded event:', error);
    // Store failed event for retry
    await storeFailedEvent(eventData, error.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Process CampaignCreated event from blockchain
 * Stores event for audit trail
 */
const processCampaignCreatedEvent = async (eventData) => {
  try {
    const { campaignId, targetAmount, event } = eventData;
    const txHash = event?.transactionHash || event?.hash || null;

    console.log(`📝 Processing CampaignCreated event: id=${campaignId}, targetAmount=${targetAmount}`);

    await storeBlockchainEvent({
      eventName: 'CampaignCreated',
      campaignId,
      amount: targetAmount,
      txHash,
      blockNumber: event?.blockNumber,
      payload: eventData
    });

    console.log(`✅ CampaignCreated event stored for campaign ${campaignId}`);

    // Emit real-time update
    if (socketService && socketService.getIo) {
      socketService.getIo().emit('CampaignCreatedOnChain', {
        campaignId,
        targetAmount,
        txHash
      });
    }
  } catch (error) {
    console.error('❌ Error processing CampaignCreated event:', error);
    await storeFailedEvent(eventData, error.message);
  }
};

/**
 * Process FundsDisbursed event from blockchain
 * Stores event for audit trail
 */
const processFundsDisbursedEvent = async (eventData) => {
  try {
    const { campaignId, amount, beneficiaryId, event } = eventData;
    const txHash = event?.transactionHash || event?.hash || null;

    console.log(`📝 Processing FundsDisbursed event: campaign=${campaignId}, amount=${amount}, beneficiary=${beneficiaryId}`);

    await storeBlockchainEvent({
      eventName: 'FundsDisbursed',
      campaignId,
      amount,
      txHash,
      blockNumber: event?.blockNumber,
      metadata: { beneficiaryId },
      payload: eventData
    });

    console.log(`✅ FundsDisbursed event stored for campaign ${campaignId}`);

    // Emit real-time update
    if (socketService && socketService.getIo) {
      socketService.getIo().emit('FundsDisbursedOnChain', {
        campaignId,
        amount,
        beneficiaryId,
        txHash
      });
    }
  } catch (error) {
    console.error('❌ Error processing FundsDisbursed event:', error);
    await storeFailedEvent(eventData, error.message);
  }
};

/**
 * Process CampaignClosed event from blockchain
 * Stores event for audit trail
 */
const processCampaignClosedEvent = async (eventData) => {
  try {
    const { campaignId, event } = eventData;
    const txHash = event?.transactionHash || event?.hash || null;

    console.log(`📝 Processing CampaignClosed event: campaign=${campaignId}`);

    await storeBlockchainEvent({
      eventName: 'CampaignClosed',
      campaignId,
      txHash,
      blockNumber: event?.blockNumber,
      payload: eventData
    });

    // Update campaign status to 'closed' in database
    const { error: updateError } = await supabase
      .from(CAMPAIGNS_TABLE)
      .update({ status: 'closed' })
      .eq('id', campaignId);

    if (updateError) {
      console.warn(`⚠️ Could not update campaign status to closed: ${updateError.message}`);
    }

    console.log(`✅ CampaignClosed event stored and campaign ${campaignId} marked as closed`);

    // Emit real-time update
    if (socketService && socketService.getIo) {
      socketService.getIo().emit('CampaignClosedOnChain', {
        campaignId,
        txHash
      });
    }
  } catch (error) {
    console.error('❌ Error processing CampaignClosed event:', error);
    await storeFailedEvent(eventData, error.message);
  }
};

/**
 * Store blockchain event in database for audit trail
 */
const storeBlockchainEvent = async (eventData) => {
  try {
    const { eventName, campaignId, amount, bankRef, txHash, blockNumber, metadata, payload } = eventData;
    const replacer = (key, value) => typeof value === 'bigint' ? value.toString() : value;

    const { error } = await supabase
      .from(EVENTS_TABLE)
      .insert([{
        event_name: eventName,
        campaign_id: campaignId,
        amount: amount ? parseFloat(amount) : null,
        bank_transaction_id: bankRef || null,
        tx_hash: txHash,
        block_number: blockNumber,
        metadata: metadata ? JSON.stringify(metadata, replacer) : null,
        payload: JSON.stringify(payload, replacer),
        processed_at: new Date().toISOString(),
        status: 'processed'
      }]);

    if (error) {
      console.warn(`⚠️ Could not store blockchain event: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Error storing blockchain event:', error);
  }
};

/**
 * Store failed event for retry
 */
const storeFailedEvent = async (eventData, errorMessage) => {
  try {
    const { eventName, campaignId, amount, txHash } = eventData;
    const replacer = (key, value) => typeof value === 'bigint' ? value.toString() : value;

    const { error } = await supabase
      .from(FAILED_EVENTS_TABLE)
      .insert([{
        event_name: eventName,
        campaign_id: campaignId,
        amount: amount ? parseFloat(amount) : null,
        tx_hash: txHash,
        payload: JSON.stringify(eventData, replacer),
        processed_at: new Date().toISOString(),
        status: 'failed',
        error_message: errorMessage
      }]);

    if (error) {
      console.warn(`⚠️ Could not store failed event: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Error storing failed event:', error);
  }
};

/**
 * Process failed events (called periodically for recovery)
 */
const processFailedEvents = async () => {
  try {
    const { data: failedEvents, error } = await supabase
      .from(EVENTS_TABLE)
      .select('*')
      .eq('status', 'failed')
      .order('processed_at', { ascending: true })
      .limit(10);

    if (error) {
      console.warn(`⚠️ Could not fetch failed events: ${error.message}`);
      return;
    }

    if (!failedEvents || failedEvents.length === 0) {
      return;
    }

    console.log(`🔄 Retrying ${failedEvents.length} failed blockchain events...`);

    for (const event of failedEvents) {
      try {
        const payload = JSON.parse(event.payload);

        switch (event.event_name) {
          case 'DonationRecorded':
            await processDonationReceivedEvent(payload);
            break;
          case 'CampaignCreated':
            await processCampaignCreatedEvent(payload);
            break;
          case 'FundsDisbursed':
            await processFundsDisbursedEvent(payload);
            break;
          case 'CampaignClosed':
            await processCampaignClosedEvent(payload);
            break;
        }

        // Mark as processed
        await supabase
          .from(EVENTS_TABLE)
          .update({ status: 'processed', error_message: null })
          .eq('id', event.id);

        console.log(`✅ Recovered failed event: ${event.event_name} (${event.id})`);
      } catch (retryError) {
        console.error(`❌ Retry failed for event ${event.id}:`, retryError);
      }
    }
  } catch (error) {
    console.error('❌ Error processing failed events:', error);
  }
};

/**
 * Start periodic task to retry failed events (every 5 minutes)
 */
const startFailedEventRecovery = () => {
  setInterval(async () => {
    await processFailedEvents();
  }, 5 * 60 * 1000); // 5 minutes

  console.log('🔄 Failed event recovery task started (checks every 5 minutes)');
};

module.exports = {
  initBlockchainEventProcessor,
  startFailedEventRecovery,
  processDonationReceivedEvent,
  processCampaignCreatedEvent,
  processFundsDisbursedEvent,
  processCampaignClosedEvent,
  storeBlockchainEvent,
  processFailedEvents
};
