-- Migration: create transactions table
-- Run this SQL in your Supabase SQL editor (or via psql)

CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  campaign_id BIGINT NOT NULL,
  amount NUMERIC NOT NULL,
  sender_name TEXT,
  sender_account TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_campaign_id ON public.transactions (campaign_id);
