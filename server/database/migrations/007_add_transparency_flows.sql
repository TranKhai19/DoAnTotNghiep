-- Flow 1: IPFS proofs for campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS proof_documents jsonb;

-- Flow 3: Disbursement Requests
CREATE TABLE IF NOT EXISTS public.disbursement_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id),
    requested_by uuid REFERENCES public.profiles(id),
    amount numeric NOT NULL,
    reason text NOT NULL,
    proof_documents jsonb,
    status text DEFAULT 'pending',
    approved_by uuid REFERENCES public.profiles(id),
    tx_hash text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Flow 4: Campaign Reports
CREATE TABLE IF NOT EXISTS public.campaign_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id),
    reported_by uuid REFERENCES public.profiles(id),
    description text NOT NULL,
    invoice_documents jsonb,
    tx_hash text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.disbursement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_reports ENABLE ROW LEVEL SECURITY;
