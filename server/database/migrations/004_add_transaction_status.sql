-- Add status column to track onchain transaction state

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

UPDATE public.donations
SET status = 'Success'
WHERE status = 'Pending' AND tx_hash IS NOT NULL;

ALTER TABLE public.disbursements
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

UPDATE public.disbursements
SET status = 'Success'
WHERE status = 'Pending' AND tx_hash IS NOT NULL;
