# 🧪 TEST VARIABLES & CREDENTIALS

## 1️⃣ AUTHENTICATION CREDENTIALS

### Test Admin Account
```
Email: admin@doantotghiep.com
Password: Admin@123456
Role: admin
```

### Test Staff Account
```
Email: staff@doantotghiep.com
Password: Staff@123456
Role: staff
```

### Test Beneficiary Account
```
Email: beneficiary@doantotghiep.com
Password: Beneficiary@123456
Role: beneficiary
```

### Test User Account
```
Email: user@doantotghiep.com
Password: User@123456
Role: user
```

---

## 2️⃣ BLOCKCHAIN ACCOUNTS (Hardhat Test Accounts)

### Account #0 (Use this for server)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: 10000 ETH
```

### Account #1 (Alternative)
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Balance: 10000 ETH
```

### Account #2 (For testing)
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Balance: 10000 ETH
```

---

## 3️⃣ CAMPAIGN TEST DATA

### Test Campaign #1 (Active)
```
ID: 550e8400-e29b-41d4-a716-446655440000
Title: Chiến dịch cứu trợ lũ lụt 2026
Goal Amount: 100000000 (100M VND)
Raised Amount: 25000000 (initial)
Category ID: 1
Status: published
Start Date: 2026-04-01T00:00:00Z
End Date: 2026-06-30T00:00:00Z
QR Code: https://example.com/qr/campaign1.png
```

### Test Campaign #2 (Draft)
```
ID: 660e8400-e29b-41d4-a716-446655440001
Title: [DRAFT] Chiến dịch 2 - Chưa phê duyệt
Goal Amount: 50000000 (50M VND)
Category ID: 2
Status: draft
```

### Test Campaign #3 (For blockchain testing)
```
ID: 770e8400-e29b-41d4-a716-446655440002
Title: Blockchain Test Campaign
Goal Amount: 75000000 (75M VND)
Raised Amount: 0
Status: draft
Blockchain TX Hash: (will be set after approval)
```

---

## 4️⃣ WEBHOOK TEST PAYLOADS

### Bank Donation Webhook
```json
{
  "transactionId": "BANK_TX_20260417_001",
  "amount": 500000,
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Quyên góp chiến dịch cứu trợ lũ lụt",
  "timestamp": "2026-04-17T10:30:00Z",
  "senderName": "Nguyễn Văn A",
  "senderAccount": "0123456789"
}
```

### Ethereum Donation Webhook
```json
{
  "transactionHash": "0xb00cbfef5859f9b00f8bee7a8a3d93d5e2e6c7f8e9a0b1c2d3e4f5a6b7c8d9e0",
  "amount": 250000,
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "blockNumber": 18500000
}
```

### Duplicate Webhook (for deduplication testing)
```json
{
  "transactionId": "DUPLICATE_TX_001",
  "amount": 100000,
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "This will be sent twice to test deduplication"
}
```

---

## 5️⃣ DRAFT CAMPAIGN TEST DATA

### Create Draft
```json
{
  "title": "[DRAFT] Chiến dịch mới - Cần phê duyệt",
  "description": "Đây là bản nháp chiến dịch, cần Admin duyệt trước khi công bố",
  "goal_amount": 80000000,
  "qr_code": "https://example.com/qr/new_draft.png",
  "category_id": 3,
  "beneficiary_id": null
}
```

### Update Draft
```json
{
  "title": "[DRAFT UPDATE] Chiến dịch mới - Đã cập nhật",
  "goal_amount": 90000000,
  "start_date": "2026-05-01T00:00:00Z",
  "end_date": "2026-07-01T00:00:00Z"
}
```

### Approve Draft
```json
{}
```

### Reject Draft
```json
{
  "reason": "Thiếu thông tin chi tiết về người hưởng lợi"
}
```

---

## 6️⃣ POSTMAN ENVIRONMENT VARIABLES

Copy these into your Postman **Environment Settings**:

```json
{
  "baseUrl": "http://localhost:3000",
  "adminEmail": "admin@doantotghiep.com",
  "adminPassword": "Admin@123456",
  "staffEmail": "staff@doantotghiep.com",
  "staffPassword": "Staff@123456",
  "userEmail": "user@doantotghiep.com",
  "userPassword": "User@123456",
  "authToken": "",
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "draftCampaignId": "660e8400-e29b-41d4-a716-446655440001",
  "blockchainTestCampaignId": "770e8400-e29b-41d4-a716-446655440002",
  "hardhatRpcUrl": "http://127.0.0.1:8545",
  "hardhatPrivateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "blockchainAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

---

## 7️⃣ TESTING FLOW (Recommended Order)

### Phase 1: Authentication ✅
1. Register new user: `POST /api/auth/register`
   - Use email: `testuser_{{$randomInt}}@doantotghiep.com`
   - Password: `Test@123456`
   
2. Login: `POST /api/auth/login`
   - Use admin email/password
   - Save response `session.access_token` as `authToken`

### Phase 2: Campaign Management ✅
3. Create Campaign: `POST /api/campaigns`
   - Use provided test data
   - Save returned campaign ID as `campaignId`

4. Get Campaign: `GET /api/campaigns/{{campaignId}}`
   - Verify campaign created

5. Update Campaign: `PUT /api/campaigns/{{campaignId}}`
   - Modify title/amount

### Phase 3: Draft Mode ✅
6. Create Draft: `POST /api/campaigns/draft/create`
   - Use "Create Draft" test data
   - Save returned draft ID as `draftCampaignId`

7. Update Draft: `PATCH /api/campaigns/draft/{{draftCampaignId}}`
   - Use "Update Draft" test data

8. List Drafts: `GET /api/campaigns/draft/list`
   - Should see your draft

9. Approve Draft: `POST /api/campaigns/draft/{{draftCampaignId}}/approve`
   - Should get blockchain `txHash` in response
   - Verify blockchain integration

### Phase 4: Webhooks ✅
10. Bank Webhook: `POST /api/webhooks/bank`
    - Use "Bank Donation Webhook" payload
    - Should update `campaign.raised_amount`

11. Ethereum Webhook: `POST /api/webhooks/ethereum`
    - Use "Ethereum Donation Webhook" payload
    - Should create donation record

12. Test Deduplication: `POST /api/webhooks/bank` (twice)
    - Use "Duplicate Webhook" payload
    - Second call should be marked as duplicate

### Phase 5: Blockchain Integration ✅
13. Verify blockchain_tx_hash: `GET /api/campaigns/{{draftCampaignId}}`
    - Check for `blockchain_tx_hash` field
    - Should match the txHash from approval response

14. Query blockchain_events table (directly)
    - Run SQL to verify events stored:
    ```sql
    SELECT event_name, campaign_id, tx_hash, status 
    FROM blockchain_events 
    ORDER BY created_at DESC 
    LIMIT 20;
    ```

---

## 8️⃣ EXAMPLE RESPONSE VALUES

### Successful Campaign Creation
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Test Campaign",
  "goal_amount": 100000000,
  "raised_amount": 0,
  "status": "published",
  "created_at": "2026-04-17T12:00:00Z"
}
```

### Successful Draft Approval (with Blockchain)
```json
{
  "success": true,
  "message": "Campaign approved, published successfully & minted on blockchain",
  "data": {
    "campaign": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "status": "published",
      "blockchain_tx_hash": "0x1234567890abcdef...",
      "approved_at": "2026-04-17T12:05:00Z"
    },
    "blockchain": {
      "txHash": "0x1234567890abcdef...",
      "receipt": {
        "transactionHash": "0x1234567890abcdef...",
        "blockNumber": 123,
        "gasUsed": "50000"
      }
    }
  }
}
```

### Successful Donation
```json
{
  "success": true,
  "message": "Payment processed",
  "data": {
    "transactionId": "BANK_TX_20260417_001",
    "amount": 500000,
    "isDuplicate": false,
    "donation": {
      "id": "donation-uuid",
      "amount": 500000,
      "status": "success"
    },
    "updatedCampaign": {
      "raised_amount": 525000
    }
  }
}
```

---

## 9️⃣ QUICK TEST CHECKLIST

- [ ] Health Check: `GET /` → 200 OK
- [ ] Register User: `POST /api/auth/register` → 200
- [ ] Login: `POST /api/auth/login` → token received
- [ ] Create Campaign: `POST /api/campaigns` → ID saved
- [ ] Create Draft: `POST /api/campaigns/draft/create` → ID saved
- [ ] Approve Draft: `POST /api/campaigns/draft/:id/approve` → blockchain_tx_hash returned
- [ ] Bank Webhook: `POST /api/webhooks/bank` → donation created
- [ ] Ethereum Webhook: `POST /api/webhooks/ethereum` → donation processed
- [ ] Verify blockchain_events table: 4+ events stored
- [ ] Deduplication test: Same txHash sent twice → 2nd marked as duplicate

---

## 🔟 NOTES

- All emails can use any domain (e.g., `test@anything.com`)
- Campaign IDs are UUIDs - generate new ones for each campaign
- Test accounts have 10,000 ETH for blockchain testing
- Bank transaction IDs should be unique per request
- Use `{{$randomInt}}` in Postman for unique test data
- Blockchain features require both Hardhat & server running

