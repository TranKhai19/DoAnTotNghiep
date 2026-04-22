# Schema Migrations for Blockchain Integration

**Date:** April 17, 2026  
**Purpose:** Add blockchain integration fields and event logging tables

## Migrations Required

### 1. Add blockchain_tx_hash to campaigns table

```sql
-- Add blockchain transaction hash field to campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(255) NULL;

-- Index for fast lookups
CREATE INDEX idx_campaigns_blockchain_tx_hash 
ON campaigns(blockchain_tx_hash);
```

**Purpose:** Store the blockchain transaction hash when a campaign is approved and minted on Besu.

**Schema:**
```sql
blockchain_tx_hash: VARCHAR(255) NULL
-- Example: "0x1234567890abcdef..."
-- Set when: Admin approves draft → createCampaign() minted on blockchain
-- Used for: Audit trail, linking off-chain campaign to on-chain record
```

---

### 2. Create blockchain_events table

```sql
-- Create table to store all blockchain events for audit trail
CREATE TABLE IF NOT EXISTS blockchain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(50) NOT NULL,
  -- 'CampaignCreated', 'DonationRecorded', 'FundsDisbursed', 'CampaignClosed'
  
  campaign_id VARCHAR(255) NOT NULL,
  -- Links to campaigns(id)
  
  amount NUMERIC(18, 6) NULL,
  -- For amount-bearing events (donations, disbursements)
  
  bank_transaction_id VARCHAR(255) NULL,
  -- For bank-initiated donations, cross-reference to donations table
  
  tx_hash VARCHAR(255) NULL,
  -- Blockchain transaction hash for verification
  -- Example: "0x1234567890abcdef..."
  
  block_number BIGINT NULL,
  -- Ethereum block number where event was emitted
  
  metadata JSONB NULL,
  -- Additional event-specific data
  -- Example: { "beneficiaryId": "...", "blockTimestamp": 1713360000 }
  
  payload JSONB NOT NULL,
  -- Full event data for complete audit trail
  
  status VARCHAR(20) NOT NULL DEFAULT 'processed',
  -- 'processed' | 'failed' | 'pending'
  
  error_message TEXT NULL,
  -- Error details if status='failed'
  
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  -- When event was processed
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  -- When record was created in database
  
  updated_at TIMESTAMP NULL DEFAULT NOW(),
  
  CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) 
    REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX idx_blockchain_events_event_name 
ON blockchain_events(event_name);

CREATE INDEX idx_blockchain_events_campaign_id 
ON blockchain_events(campaign_id);

CREATE INDEX idx_blockchain_events_tx_hash 
ON blockchain_events(tx_hash);

CREATE INDEX idx_blockchain_events_status 
ON blockchain_events(status);

CREATE INDEX idx_blockchain_events_created_at 
ON blockchain_events(created_at DESC);
```

**Purpose:** Store complete audit trail of all blockchain events for:
- Event recovery and replay
- Event deduplication
- Blockchain-to-database reconciliation
- Error recovery and retry logic

**Event Types:**
1. **CampaignCreated** - When admin approves draft → mints on blockchain
2. **DonationRecorded** - When blockchain receives donation
3. **FundsDisbursed** - When funds are distributed to beneficiary
4. **CampaignClosed** - When campaign ends

---

## Data Flow with Blockchain Integration

### Scenario 1: Admin Approves Draft Campaign

```
User clicks "Approve Draft" in Admin Dashboard
  ↓
POST /api/campaigns/draft/:id/approve
  ↓
approveCampaign(id) in Campaign.js
  ↓
(NEW) Call contractService.createCampaign(goal_amount)
  ↓
Besu blockchain receives {campaignId, targetAmount}
  ├─ Emits CampaignCreated event
  └─ Returns txHash = "0xabc123..."
  ↓
(NEW) Store txHash in campaigns.blockchain_tx_hash
  ↓
(NEW) Store event in blockchain_events table
  ↓
Return { campaign, blockchain: { txHash, receipt } }
  ↓
✅ Campaign now published AND minted on blockchain
```

### Scenario 2: Blockchain DonationRecorded Event

```
Bank/Ethereum sends donation
  ↓
Bank Webhook OR Blockchain event
  ↓
(NEW) blockchainEventService.processDonationReceivedEvent()
  ├─ Store event in blockchain_events table
  ├─ Check deduplication (if tx_hash exists, skip)
  ├─ Create donation record in donations table
  ├─ Update campaign.raised_amount
  └─ Emit Socket.io DonationProcessed event
  ↓
✅ Donation tracked both on-chain and off-chain
```

### Scenario 3: Failed Event Recovery

```
Blockchain event received BUT database fails
  ↓
blockchainEventService stores with status='failed'
  ↓
Every 5 minutes: processFailedEvents() runs
  ├─ Fetch events with status='failed'
  ├─ Retry processing each event
  └─ Change status='processed' if successful
  ↓
✅ Automatic recovery without manual intervention
```

---

## API Response Changes

### POST /api/campaigns/draft/:id/approve (UPDATED)

**Old Response:**
```json
{
  "success": true,
  "message": "Campaign approved and published successfully",
  "data": {
    "id": "camp-uuid",
    "status": "published",
    "title": "...",
    ...
  }
}
```

**New Response:**
```json
{
  "success": true,
  "message": "Campaign approved, published successfully & minted on blockchain",
  "data": {
    "campaign": {
      "id": "camp-uuid",
      "status": "published",
      "blockchain_tx_hash": "0x1234567890abcdef...",
      "approved_at": "2026-04-17T10:30:00Z",
      ...
    },
    "blockchain": {
      "txHash": "0x1234567890abcdef...",
      "transactionHash": "0x1234567890abcdef...",
      "receipt": {
        "transactionHash": "0x1234567890abcdef...",
        "blockNumber": 12345,
        "gasUsed": "50000",
        ...
      }
    }
  }
}
```

---

## Configuration

### Environment Variables

Add to `.env`:
```env
# Blockchain RPC
CHAIN_RPC_URL=http://localhost:8545
PRIVATE_KEY=your-private-key
FUNDCHAIN_CONTRACT_ADDRESS=0x...

# For error recovery
BLOCKCHAIN_EVENT_RECOVERY_INTERVAL=300000  # 5 minutes (ms)
```

---

## Testing Checklist

- [ ] Run migrations against test database
- [ ] Test Draft → Approve flow with blockchain unlocked
  - [ ] Verify blockchain_tx_hash stored in campaigns
  - [ ] Verify CampaignCreated event received
  - [ ] Verify event stored in blockchain_events table
- [ ] Test DonationRecorded event processing
  - [ ] Send blockchain DonationRecorded event
  - [ ] Verify donation created in donations table
  - [ ] Verify campaign.raised_amount updated
  - [ ] Verify event logged in blockchain_events
- [ ] Test failed event recovery
  - [ ] Simulate database failure during event processing
  - [ ] Verify event stored with status='failed'
  - [ ] Wait for recovery task (5 min)
  - [ ] Verify event reprocessed and status='processed'

---

## Rollback Plan

If issues arise:

```sql
-- Remove blockchain_tx_hash field (if needed)
ALTER TABLE campaigns DROP COLUMN blockchain_tx_hash;

-- Drop blockchain_events table (if needed)
DROP TABLE blockchain_events CASCADE;
```

---

**Status:** Ready for deployment  
**Risk Level:** Low (new tables + new column, no existing data affected)  
**Rollback Risk:** Very Low (can be reverted with simple DROP/ALTER commands)
