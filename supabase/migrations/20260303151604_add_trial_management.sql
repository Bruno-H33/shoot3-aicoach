/*
  # Add Trial Management and Profiling to Profiles Table

  1. New Columns Added to `profiles` Table
    - `trial_started_at` (timestamptz, nullable) - When the user's free trial begins
    - `trial_ends_at` (timestamptz, nullable) - When the free trial expires (7 days from start)
    - `has_completed_free_diagnosis` (boolean) - Whether user has used their free diagnosis analysis
    - `niveau` (text, nullable) - Player skill level (Débutant, Intermédiaire, Avancé, Elite)
    - `practice_type` (text, nullable) - Training type (Ballon, Libre, Match)
    - `subscription_tier` (text, nullable) - Current subscription tier (free_trial, pass_team, sniper_elite, or null for free)
    - `subscription_started_at` (timestamptz, nullable) - When the current subscription began
    - `subscription_ends_at` (timestamptz, nullable) - When the current subscription expires
    - `stripe_customer_id` (text, nullable) - Stripe customer ID for payment tracking
    - `is_onboarded` (boolean) - Whether user has completed the onboarding flow

  2. New RPC Functions
    - `check_trial_status(p_user_id UUID)` - Returns trial status and expiration info
    - `activate_trial(p_user_id UUID)` - Activates a 7-day free trial for the user
    - `check_subscription_validity(p_user_id UUID)` - Verifies if user's subscription is still active

  3. Security
    - Trial and subscription data is protected by existing RLS policies
    - RPC functions use SECURITY DEFINER to allow safe data access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_started_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_ends_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_completed_free_diagnosis'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN has_completed_free_diagnosis boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'niveau'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN niveau text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'practice_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN practice_type text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_started_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_ends_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_onboarded'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_onboarded boolean DEFAULT false;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.check_trial_status(p_user_id UUID)
RETURNS TABLE(
  is_trial_active BOOLEAN,
  trial_days_remaining INTEGER,
  trial_ends_at TIMESTAMPTZ,
  has_completed_diagnosis BOOLEAN
) AS $$
DECLARE
  v_trial_ends_at TIMESTAMPTZ;
  v_has_diagnosis BOOLEAN;
BEGIN
  SELECT trial_ends_at, has_completed_free_diagnosis
  INTO v_trial_ends_at, v_has_diagnosis
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF v_trial_ends_at IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, NULL::TIMESTAMPTZ, COALESCE(v_has_diagnosis, FALSE);
  ELSE
    RETURN QUERY SELECT
      (v_trial_ends_at > NOW()),
      EXTRACT(DAY FROM (v_trial_ends_at - NOW()))::INTEGER,
      v_trial_ends_at,
      COALESCE(v_has_diagnosis, FALSE);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.activate_trial(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ
) AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
BEGIN
  v_start_time := NOW();
  v_end_time := NOW() + INTERVAL '7 days';

  UPDATE public.profiles
  SET 
    trial_started_at = v_start_time,
    trial_ends_at = v_end_time,
    is_onboarded = TRUE
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT TRUE, v_start_time, v_end_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_subscription_validity(p_user_id UUID)
RETURNS TABLE(
  is_active BOOLEAN,
  subscription_tier TEXT,
  days_remaining INTEGER,
  ends_at TIMESTAMPTZ
) AS $$
DECLARE
  v_subscription_tier TEXT;
  v_subscription_ends_at TIMESTAMPTZ;
BEGIN
  SELECT subscription_tier, subscription_ends_at
  INTO v_subscription_tier, v_subscription_ends_at
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF v_subscription_ends_at IS NULL OR v_subscription_tier IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 0, NULL::TIMESTAMPTZ;
  ELSE
    RETURN QUERY SELECT
      (v_subscription_ends_at > NOW()),
      v_subscription_tier,
      EXTRACT(DAY FROM (v_subscription_ends_at - NOW()))::INTEGER,
      v_subscription_ends_at;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;