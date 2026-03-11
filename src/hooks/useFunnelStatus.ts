import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserStatus = 'free' | 'trial' | 'locked' | 'elite';

interface FunnelState {
  userStatus: UserStatus;
  trialStartDate: Date | null;
  testCount: number;
  daysRemaining: number;
  isLoading: boolean;
}

export const useFunnelStatus = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FunnelState>({
    userStatus: 'free',
    trialStartDate: null,
    testCount: 0,
    daysRemaining: 0,
    isLoading: true,
  });

  const loadFunnelStatus = async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_status, trial_start_date, test_count')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const trialStart = data.trial_start_date ? new Date(data.trial_start_date) : null;
        let status = (data.user_status || 'free') as UserStatus;
        let daysRemaining = 0;

        // Check if trial has expired
        if (status === 'trial' && trialStart) {
          const now = new Date();
          const diffTime = now.getTime() - trialStart.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, 7 - diffDays);

          // Auto-lock if trial expired
          if (diffDays > 7) {
            status = 'locked';
            await updateUserStatus('locked');
          }
        }

        setState({
          userStatus: status,
          trialStartDate: trialStart,
          testCount: data.test_count || 0,
          daysRemaining,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading funnel status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateUserStatus = async (newStatus: UserStatus) => {
    if (!user) return;

    try {
      const updates: any = { user_status: newStatus };

      if (newStatus === 'trial' && !state.trialStartDate) {
        updates.trial_start_date = new Date().toISOString();
      }

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      await loadFunnelStatus();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const incrementTestCount = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ test_count: state.testCount + 1 })
        .eq('id', user.id);

      await loadFunnelStatus();
    } catch (error) {
      console.error('Error incrementing test count:', error);
    }
  };

  const simulateTimeTravel = async () => {
    if (!user || !state.trialStartDate) return;

    try {
      const newDate = new Date(state.trialStartDate);
      newDate.setDate(newDate.getDate() - 8);

      await supabase
        .from('profiles')
        .update({ trial_start_date: newDate.toISOString() })
        .eq('id', user.id);

      await loadFunnelStatus();
    } catch (error) {
      console.error('Error in time travel:', error);
    }
  };

  useEffect(() => {
    loadFunnelStatus();
  }, [user]);

  return {
    ...state,
    updateUserStatus,
    incrementTestCount,
    simulateTimeTravel,
    reload: loadFunnelStatus,
  };
};
