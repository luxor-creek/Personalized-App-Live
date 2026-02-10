
-- Affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  affiliate_code text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(8), 'hex'),
  commission_rate numeric(5,2) NOT NULL DEFAULT 30.00,
  payout_method text CHECK (payout_method IN ('paypal', 'wise', 'wire', null)),
  payout_details text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
  total_earned numeric(10,2) NOT NULL DEFAULT 0,
  total_paid numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage affiliates
CREATE POLICY "Admins can view all affiliates"
  ON public.affiliates FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert affiliates"
  ON public.affiliates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update affiliates"
  ON public.affiliates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete affiliates"
  ON public.affiliates FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Affiliate users can view their own record
CREATE POLICY "Affiliates can view own record"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

-- Referrals table tracks each conversion
CREATE TABLE public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email text,
  plan text,
  subscription_amount numeric(10,2) DEFAULT 0,
  commission_amount numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  converted_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all referrals"
  ON public.affiliate_referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert referrals"
  ON public.affiliate_referrals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update referrals"
  ON public.affiliate_referrals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete referrals"
  ON public.affiliate_referrals FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Affiliates can view their own referrals
CREATE POLICY "Affiliates can view own referrals"
  ON public.affiliate_referrals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = affiliate_referrals.affiliate_id
    AND a.user_id = auth.uid()
  ));

-- Updated_at trigger for affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
