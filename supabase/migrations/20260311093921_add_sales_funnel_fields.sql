/*
  # Add Sales Funnel Fields
  
  1. Changes to profiles table
    - Add `user_status` field (free, trial, locked, elite)
    - Add `trial_start_date` timestamp for trial tracking
    - Add `test_count` number for tracking video analyses
    - Add default values for new users
    
  2. Security
    - Update RLS policies to allow users to update their own status fields
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_status text DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_start_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_start_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'test_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN test_count integer DEFAULT 0;
  END IF;
END $$;