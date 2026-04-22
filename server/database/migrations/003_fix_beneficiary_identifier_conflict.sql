-- Ensure beneficiaries.identifier has a plain unique constraint for UPSERT compatibility
DROP INDEX IF EXISTS public.uq_beneficiaries_identifier;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'beneficiaries_identifier_key'
      AND conrelid = 'public.beneficiaries'::regclass
  ) THEN
    ALTER TABLE public.beneficiaries
      ADD CONSTRAINT beneficiaries_identifier_key UNIQUE (identifier);
  END IF;
END $$;
