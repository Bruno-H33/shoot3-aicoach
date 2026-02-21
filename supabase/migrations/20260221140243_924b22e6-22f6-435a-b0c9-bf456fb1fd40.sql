
-- Table for access codes
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 3,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Allow anyone to read codes (to validate them)
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read access codes"
ON public.access_codes FOR SELECT
USING (true);

-- Only service role can insert/update (managed via SQL or edge function)
CREATE POLICY "Service role can manage access codes"
ON public.access_codes FOR ALL
USING (auth.role() = 'service_role');

-- Table to track which code was used for each analysis
CREATE TABLE public.access_code_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.access_codes(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_fingerprint TEXT
);

ALTER TABLE public.access_code_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert uses"
ON public.access_code_uses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read uses"
ON public.access_code_uses FOR SELECT
USING (true);

-- Insert a default test code with 10 uses
INSERT INTO public.access_codes (code, max_uses) VALUES ('SHOOT3BETA', 10);
