import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startedAt: string | null;
  endsAt: string | null;
  isLoading: boolean;
  needsCheckup: boolean;
  hasCompletedCheckup: boolean;
}

export const useFreeTrial = () => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isActive: false,
    daysRemaining: 0,
    startedAt: null,
    endsAt: null,
    isLoading: true,
    needsCheckup: false,
    hasCompletedCheckup: false,
  });

  const fetchTrialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTrialStatus({
          isActive: false,
          daysRemaining: 0,
          startedAt: null,
          endsAt: null,
          isLoading: false,
          needsCheckup: false,
          hasCompletedCheckup: false,
        });
        return;
      }

      const devTimeOffset = parseInt(localStorage.getItem("s3_dev_time_offset") || "0");

      const { data: trials } = await supabase
        .from("user_trials")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1);

      if (trials && trials.length > 0) {
        const trial = trials[0];
        const now = new Date(Date.now() + devTimeOffset);
        const endsAt = new Date(trial.ends_at);
        const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isActive = trial.is_active && now < endsAt;

        const { data: checkup } = await supabase
          .from("progress_checkups")
          .select("*")
          .eq("user_id", user.id)
          .eq("day_number", 7)
          .maybeSingle();

        const needsCheckup = daysRemaining === 0 && !checkup;
        const hasCompletedCheckup = !!checkup;

        setTrialStatus({
          isActive,
          daysRemaining,
          startedAt: trial.started_at,
          endsAt: trial.ends_at,
          isLoading: false,
          needsCheckup,
          hasCompletedCheckup,
        });
      } else {
        setTrialStatus({
          isActive: false,
          daysRemaining: 0,
          startedAt: null,
          endsAt: null,
          isLoading: false,
          needsCheckup: false,
          hasCompletedCheckup: false,
        });
      }
    } catch (error) {
      console.error("Error fetching trial status:", error);
      setTrialStatus({
        isActive: false,
        daysRemaining: 0,
        startedAt: null,
        endsAt: null,
        isLoading: false,
        needsCheckup: false,
        hasCompletedCheckup: false,
      });
    }
  };

  useEffect(() => {
    fetchTrialStatus();

    const channel = supabase
      .channel("trial-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_trials",
        },
        () => {
          fetchTrialStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { ...trialStatus, refetch: fetchTrialStatus };
};
