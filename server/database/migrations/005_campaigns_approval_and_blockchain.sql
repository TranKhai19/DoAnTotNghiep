-- Migration 005: Align campaigns table with full DB schema (approval flow + blockchain metadata)
-- Run on Supabase SQL Editor

-- 1. Tạo ENUM types nếu chưa có
DO $$ BEGIN
  CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'pending_approval',
    'active',
    'completed',
    'rejected',
    'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.approval_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Chuyển cột status từ TEXT sang ENUM campaign_status (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'status' AND data_type = 'text'
  ) THEN
    -- Map giá trị cũ sang enum mới
    UPDATE public.campaigns SET status = 'active'           WHERE status IN ('Đang chạy', 'Dang chay', 'active');
    UPDATE public.campaigns SET status = 'draft'            WHERE status IN ('Nháp', 'Nhap', 'draft');
    UPDATE public.campaigns SET status = 'pending_approval' WHERE status IN ('Chờ duyệt', 'Cho duyet', 'pending_approval');
    UPDATE public.campaigns SET status = 'completed'        WHERE status IN ('Hoàn thành', 'Hoan thanh', 'completed');
    UPDATE public.campaigns SET status = 'rejected'         WHERE status IN ('Từ chối', 'Tu choi', 'rejected');
    UPDATE public.campaigns SET status = 'closed'           WHERE status IN ('Đã đóng', 'Da dong', 'closed');
    -- Default fallback
    UPDATE public.campaigns SET status = 'draft' WHERE status NOT IN ('draft','pending_approval','active','completed','rejected','closed');

    ALTER TABLE public.campaigns
      ALTER COLUMN status TYPE public.campaign_status USING status::public.campaign_status;

    ALTER TABLE public.campaigns
      ALTER COLUMN status SET DEFAULT 'draft';
  END IF;
END $$;

-- 3. Thêm các cột mới cho approval flow
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS approval_status public.approval_status_enum NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Thêm các cột blockchain metadata
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS onchain_campaign_id   BIGINT,
  ADD COLUMN IF NOT EXISTS blockchain_tx_hash    VARCHAR(66),
  ADD COLUMN IF NOT EXISTS blockchain_minted_at  TIMESTAMPTZ;

-- 5. Index bổ sung
CREATE INDEX IF NOT EXISTS idx_campaigns_approval_status ON public.campaigns(approval_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_onchain_id      ON public.campaigns(onchain_campaign_id) WHERE onchain_campaign_id IS NOT NULL;
