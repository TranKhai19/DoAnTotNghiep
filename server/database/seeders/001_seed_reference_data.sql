-- Seed reference and sample data (idempotent)
INSERT INTO public.campaign_categories (name)
VALUES
  ('Giao duc'),
  ('Y te'),
  ('Cuu tro khan cap')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.beneficiaries (full_name, identifier, phone, address)
VALUES
  ('Tran Van An', 'BNF001', '0900000001', 'Da Nang'),
  ('Nguyen Thi Binh', 'BNF002', '0900000002', 'Hue')
ON CONFLICT (identifier) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

WITH selected_category AS (
  SELECT id FROM public.campaign_categories WHERE name = 'Giao duc' LIMIT 1
),
selected_beneficiary AS (
  SELECT id FROM public.beneficiaries WHERE identifier = 'BNF001' LIMIT 1
)
INSERT INTO public.campaigns (
  title,
  description,
  goal_amount,
  raised_amount,
  qr_code,
  category_id,
  beneficiary_id,
  status,
  start_date,
  end_date
)
SELECT
  'Hoc bong tiep suc den truong',
  'Ho tro hoc bong cho hoc sinh kho khan.',
  50000000,
  0,
  'https://example.com/qrcode/hoc-bong',
  selected_category.id,
  selected_beneficiary.id,
  'Dang chay',
  timezone('utc', now()),
  timezone('utc', now()) + interval '120 days'
FROM selected_category, selected_beneficiary
WHERE NOT EXISTS (
  SELECT 1
  FROM public.campaigns
  WHERE title = 'Hoc bong tiep suc den truong'
);
