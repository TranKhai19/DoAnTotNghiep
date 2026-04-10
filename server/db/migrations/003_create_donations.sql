-- Migration: create donations table
-- Run this SQL in your Supabase SQL editor (or via psql)

CREATE TABLE IF NOT EXISTS public.donations (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT,
  bank_ref TEXT,
  amount NUMERIC NOT NULL,
  donor TEXT,
  transaction_hash TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON public.donations (campaign_id);
