import { supabase } from '@/integrations/supabase/client';

export interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  trialEndsAt: string | null;
  hasCompletedDiagnosis: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: string | null;
  daysRemaining: number;
  endsAt: string | null;
}

export async function checkTrialStatus(userId: string): Promise<TrialStatus | null> {
  try {
    const { data, error } = await supabase
      .rpc('check_trial_status', { p_user_id: userId });

    if (error) {
      console.error('Error checking trial status:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        isTrialActive: false,
        daysRemaining: 0,
        trialEndsAt: null,
        hasCompletedDiagnosis: false,
      };
    }

    const result = data[0];
    return {
      isTrialActive: result.is_trial_active,
      daysRemaining: result.trial_days_remaining,
      trialEndsAt: result.trial_ends_at,
      hasCompletedDiagnosis: result.has_completed_diagnosis,
    };
  } catch (error) {
    console.error('Error in checkTrialStatus:', error);
    return null;
  }
}

export async function activateTrial(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('activate_trial', { p_user_id: userId });

    if (error) {
      console.error('Error activating trial:', error);
      return false;
    }

    return data && data.length > 0 && data[0].success;
  } catch (error) {
    console.error('Error in activateTrial:', error);
    return false;
  }
}

export async function checkSubscriptionValidity(userId: string): Promise<SubscriptionStatus | null> {
  try {
    const { data, error } = await supabase
      .rpc('check_subscription_validity', { p_user_id: userId });

    if (error) {
      console.error('Error checking subscription validity:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        isActive: false,
        tier: null,
        daysRemaining: 0,
        endsAt: null,
      };
    }

    const result = data[0];
    return {
      isActive: result.is_active,
      tier: result.subscription_tier,
      daysRemaining: result.days_remaining,
      endsAt: result.ends_at,
    };
  } catch (error) {
    console.error('Error in checkSubscriptionValidity:', error);
    return null;
  }
}

export async function markDiagnosisComplete(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ has_completed_free_diagnosis: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking diagnosis complete:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markDiagnosisComplete:', error);
    return false;
  }
}

export async function updateUserProfile(userId: string, updates: {
  niveau?: string;
  practice_type?: string;
  display_name?: string;
  position?: string;
  objective?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
}
