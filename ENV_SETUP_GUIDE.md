# 🚀 Environment Setup Guide

## Problem
The server needs environment variables to start. `.env` file has been created with placeholders.

---

## ✅ Quick Setup Steps

### 1. **Get Supabase Credentials** (REQUIRED)
If you don't have Supabase yet:
- Go to https://supabase.com/dashboard
- Create a new project (or use existing)
- Go to **Project Settings → API**
- Copy these values:

```env
SUPABASE_URL=https://your-project-xyz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the placeholders in `.env` file with your actual values.

### 2. **For Blockchain Testing (Optional)**
If you want to test blockchain features:

**Option A: Local Hardhat Node (Recommended for development)**
```bash
cd d:\DoAnTotNghiep\blockchain
npx hardhat node
```

This gives you:
- RPC URL: `http://localhost:8545`
- Private key: Copy from hardhat console output
- Contract address: Deploy FundChain contract first

**Option B: Besu Network (Production-like)**
- Configure your Besu node RPC URL
- Set PRIVATE_KEY with appropriate permissions
- Deploy FundChain contract to get CONTRACT_ADDRESS

**Set in `.env`:**
```env
CHAIN_RPC_URL=http://localhost:8545
PRIVATE_KEY=0x1234567890abcdef...
FUNDCHAIN_CONTRACT_ADDRESS=0xabcdef1234...
```

### 3. **For Redis Queue (Optional - Fallback to sync if unavailable)**
If you have Redis running:
```bash
redis-cli ping  # Should return PONG
```

Set in `.env`:
```env
REDIS_URL=redis://127.0.0.1:6379
```

If no Redis, the server will fall back to synchronous webhook processing (still works!).

---

## 📋 Current `.env` Status

```
✅ Created: server/.env
✅ Template: Based on .env.example
⏳ TODO: Fill in SUPABASE_URL and SUPABASE_KEY
⏳ TODO: (Optional) Add blockchain credentials
⏳ TODO: (Optional) Configure Redis URL
```

---

## 🔥 Start Server

After updating `.env` with your Supabase credentials:

```bash
cd d:\DoAnTotNghiep\server
npm start
```

Expected output:
```
Server is running on port 3000
✅ Webhook queue processor initialized
✅ Blockchain event processor initialized and recovery task started
```

---

## 🛠️ Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_KEY must be defined"
- **Cause:** Placeholders not replaced with real values
- **Fix:** Update `.env` with your actual Supabase credentials from dashboard

### Error: "Cannot connect to Supabase"
- **Cause:** Wrong URL or key, or network issue
- **Fix:** Verify credentials, check internet connection

### Error: "Cannot connect to blockchain"
- **Cause:** Hardhat/Besu node not running
- **Fix:** This is optional. Either start the node or leave as-is (blockchain features will warn but server still runs)

### Error: "Redis connection failed"
- **Cause:** Redis not running
- **Fix:** This is optional. Server will use synchronous processing instead (no queue)

---

## 📚 Environment Variables Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `SUPABASE_URL` | ✅ YES | Database connection | `https://abc.supabase.co` |
| `SUPABASE_KEY` | ✅ YES | Supabase API key | `eyJ...` |
| `CHAIN_RPC_URL` | ❌ No | Blockchain RPC endpoint | `http://localhost:8545` |
| `PRIVATE_KEY` | ❌ No | Wallet private key | `0x1234...` |
| `FUNDCHAIN_CONTRACT_ADDRESS` | ❌ No | Smart contract address | `0xabcd...` |
| `REDIS_URL` | ❌ No | Redis connection | `redis://localhost:6379` |
| `PORT` | ❌ No | API server port | `3000` |
| `NODE_ENV` | ❌ No | Environment mode | `development` |

---

## ✨ Next Steps

1. Update `.env` with Supabase credentials
2. Run `npm start` to start the server
3. Visit http://localhost:3000 in browser (should show `{ message: "Server is running" }`)
4. Import Postman collection and test API endpoints

---

**Need help?** Check the full documentation:
- API Docs: `server/README.md`
- Blockchain Setup: `BLOCKCHAIN_SCHEMA_MIGRATIONS.md`
- Implementation Status: `BLOCKCHAIN_COMPLETION_REPORT.md`
