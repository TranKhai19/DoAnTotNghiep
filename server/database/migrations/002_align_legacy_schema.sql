-- Align legacy schema with current backend expectations (idempotent)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Beneficiaries: legacy columns are (name, description, document_url)
ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS identifier TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

UPDATE public.beneficiaries
SET full_name = COALESCE(full_name, name, 'Unknown beneficiary')
WHERE full_name IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_beneficiaries_identifier
ON public.beneficiaries(identifier)
WHERE identifier IS NOT NULL;

-- Campaign categories: guarantee upsert compatibility for seeder
CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_categories_name
ON public.campaign_categories(name);

-- Campaigns: legacy schema used target_amount; backend now uses goal_amount and extra metadata
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS goal_amount NUMERIC(20, 2),
  ADD COLUMN IF NOT EXISTS qr_code TEXT,
  ADD COLUMN IF NOT EXISTS category_id INTEGER,
  ADD COLUMN IF NOT EXISTS contract_address TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());

UPDATE public.campaigns
SET
  goal_amount = COALESCE(goal_amount, target_amount),
  description = COALESCE(description, title),
  start_date = COALESCE(start_date, created_at::timestamptz, timezone('utc', now())),
  end_date = COALESCE(end_date, (created_at::timestamptz + interval '120 days'), (timezone('utc', now()) + interval '120 days')),
  updated_at = COALESCE(updated_at, timezone('utc', now()))
WHERE
  goal_amount IS NULL
  OR description IS NULL
  OR start_date IS NULL
  OR end_date IS NULL
  OR updated_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_category_id_fkey'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_category_id_fkey
      FOREIGN KEY (category_id)
      REFERENCES public.campaign_categories(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Donations: keep optional donor/source metadata for analytics and webhook traceability
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS donor TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'bank';

UPDATE public.donations
SET source = COALESCE(source, 'bank')
WHERE source IS NULL;

-- Ensure trigger for campaigns.updated_at exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
