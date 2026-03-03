/*
  # Système de Free Trial et Suivi de Progression

  1. Nouvelles Tables
    - `user_trials` - Suivi des périodes d'essai gratuites
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `started_at` (timestamptz) - Date de début du trial
      - `ends_at` (timestamptz) - Date de fin du trial
      - `is_active` (boolean) - Trial actif ou non
      - `converted` (boolean) - L'utilisateur a-t-il souscrit après le trial
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `progress_checkups` - Enregistrements des check-ups de progression
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `analysis_id` (uuid, foreign key to analyses)
      - `day_number` (integer) - Jour 1, 7, 14, etc.
      - `overall_score` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Modifications de la table profiles
    - Ajout de colonnes pour le tracking du trial et des drills
    - `trial_drills_unlocked` (boolean) - Accès aux drills débloqué
    - `last_checkup_at` (timestamptz) - Date du dernier check-up

  3. Security
    - Enable RLS sur toutes les nouvelles tables
    - Policies restrictives basées sur auth.uid()
*/

-- Table user_trials
CREATE TABLE IF NOT EXISTS user_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  ends_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  converted boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, started_at)
);

ALTER TABLE user_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trials"
  ON user_trials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trials"
  ON user_trials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trials"
  ON user_trials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table progress_checkups
CREATE TABLE IF NOT EXISTS progress_checkups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_id uuid REFERENCES analyses(id) ON DELETE SET NULL,
  day_number integer DEFAULT 1 NOT NULL,
  overall_score integer DEFAULT 0 NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE progress_checkups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkups"
  ON progress_checkups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkups"
  ON progress_checkups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkups"
  ON progress_checkups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ajout de colonnes à profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_drills_unlocked'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_drills_unlocked boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_checkup_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_checkup_at timestamptz;
  END IF;
END $$;

-- Fonction pour vérifier si le trial est encore actif
CREATE OR REPLACE FUNCTION is_trial_active(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_trial_active boolean;
BEGIN
  SELECT 
    CASE 
      WHEN ends_at > now() AND is_active = true THEN true
      ELSE false
    END INTO v_trial_active
  FROM user_trials
  WHERE user_id = p_user_id
  ORDER BY started_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_trial_active, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les jours restants du trial
CREATE OR REPLACE FUNCTION get_trial_days_remaining(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_days_remaining integer;
BEGIN
  SELECT 
    GREATEST(0, EXTRACT(DAY FROM (ends_at - now()))::integer)
  INTO v_days_remaining
  FROM user_trials
  WHERE user_id = p_user_id AND is_active = true
  ORDER BY started_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_days_remaining, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_trials_user_id ON user_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_ends_at ON user_trials(ends_at);
CREATE INDEX IF NOT EXISTS idx_progress_checkups_user_id ON progress_checkups(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_checkups_day ON progress_checkups(day_number);