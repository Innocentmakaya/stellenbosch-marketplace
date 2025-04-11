-- Create payments table to track transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT NOT NULL,
  m_payment_id TEXT,
  listing_id UUID REFERENCES public.listings(id),
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  item_name TEXT,
  custom_data TEXT,
  payment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add a sold status to the listings table if it doesn't already have it
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE;

-- Grant permissions
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own payments (as buyer or seller)
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Only system can insert/update payments (via API)
CREATE POLICY "System can manage payments" 
  ON public.payments 
  FOR ALL 
  TO service_role;

-- Add status index
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments (status);

-- Add listing_id index
CREATE INDEX IF NOT EXISTS payments_listing_id_idx ON public.payments (listing_id);

-- Add buyer and seller indices
CREATE INDEX IF NOT EXISTS payments_buyer_id_idx ON public.payments (buyer_id);
CREATE INDEX IF NOT EXISTS payments_seller_id_idx ON public.payments (seller_id); 