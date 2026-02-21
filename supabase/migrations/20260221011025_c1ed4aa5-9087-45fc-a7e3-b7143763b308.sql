
-- Table to store shot analyses and payment status
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_score INTEGER NOT NULL DEFAULT 0,
  detailed_report JSONB, -- filled after payment via AI
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
ON public.analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_analyses_user_id ON public.analyses (user_id);
