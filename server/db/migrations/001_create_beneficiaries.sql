-- Migration: create beneficiaries table
-- Run this SQL in your Supabase SQL editor (or via psql)

CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  image_url TEXT,
  image_public_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_at ON public.beneficiaries (created_at DESC);
