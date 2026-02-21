
-- Add credits column to profiles (2 free credits for each user)
ALTER TABLE public.profiles ADD COLUMN credits integer NOT NULL DEFAULT 2;

-- Update existing profiles to have 2 credits
UPDATE public.profiles SET credits = 2 WHERE credits = 0;
