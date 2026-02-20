import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import CameraView from "@/components/CameraView";
import PaywallModal from "@/components/PaywallModal";
import AuthPrompt from "@/components/AuthPrompt";

type View = "splash" | "onboarding" | "camera" | "auth-prompt" | "dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("splash");
  const [userName, setUserName] = useState("");
  const [onboardingData, setOnboardingData] = useState<{ position: string; objective: string } | null>(null);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("studio");

  // If user is already authenticated, skip to dashboard
  useEffect(() => {
    if (!loading && user && view === "splash") {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
      if (name) setUserName(name);
      
      // Check if user was in the middle of the onboarding flow (pre-auth)
      const pendingFlow = sessionStorage.getItem("s3_pending_auth_flow");
      if (pendingFlow) {
        sessionStorage.removeItem("s3_pending_auth_flow");
        const pending = JSON.parse(pendingFlow);
        if (pending.userName) setUserName(pending.userName);
        if (pending.onboardingData) setOnboardingData(pending.onboardingData);
        setHasCompletedTest(true);
        setView("dashboard");
        setShowPaywall(true);
        
        // Save profile data
        if (pending.onboardingData) {
          supabase.from("profiles").update({
            display_name: pending.userName || name,
            position: pending.onboardingData.position,
            objective: pending.onboardingData.objective,
          }).eq("user_id", user.id);
        }
      } else {
        setView("dashboard");
      }
    }
  }, [user, loading, view]);

  // After auth completes (from auth-prompt without page reload), save profile and go to dashboard
  useEffect(() => {
    if (user && view === "auth-prompt") {
      sessionStorage.removeItem("s3_pending_auth_flow");
      const saveProfile = async () => {
        if (onboardingData) {
          await supabase.from("profiles").update({
            display_name: userName,
            position: onboardingData.position,
            objective: onboardingData.objective,
          }).eq("user_id", user.id);
        }
      };
      saveProfile();
      setHasCompletedTest(true);
      setView("dashboard");
      setShowPaywall(true);
    }
  }, [user, view, onboardingData, userName]);

  if (loading && view === "splash") {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSplashLogin = () => {
    navigate("/auth");
  };

  const handleOnboardingComplete = (name: string, position: string, objective: string) => {
    setUserName(name);
    setOnboardingData({ position, objective });
    setView("camera");
  };

  const handleAnalyze = () => {
    setView("camera");
  };

  const handleCameraComplete = () => {
    setHasCompletedTest(true);
    if (user) {
      setView("dashboard");
      setShowPaywall(true);
    } else {
      // Save flow state before OAuth redirect (page will reload)
      sessionStorage.setItem("s3_pending_auth_flow", JSON.stringify({
        userName,
        onboardingData,
      }));
      setView("auth-prompt");
    }
  };

  const handleCameraClose = () => {
    if (user) {
      setView("dashboard");
    } else {
      setView("splash");
    }
  };

  const handleRegistered = () => {
    setIsRegistered(true);
    setHasCompletedTest(true);
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    setActiveTab("studio");
  };

  const displayName = userName || user?.user_metadata?.full_name || user?.user_metadata?.name || "Joueur";

  return (
    <div className="min-h-dvh bg-black flex justify-center">
      <div className="w-full max-w-[430px] relative">
        {view === "splash" && (
          <SplashScreen onStart={() => setView("onboarding")} onLogin={handleSplashLogin} />
        )}

        {view === "onboarding" && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {view === "camera" && (
          <CameraView
            onComplete={handleCameraComplete}
            onClose={handleCameraClose}
          />
        )}

        {view === "auth-prompt" && (
          <AuthPrompt userName={userName} />
        )}

        {view === "dashboard" && (
          <Dashboard
            userName={displayName}
            hasCompletedTest={hasCompletedTest || isRegistered}
            onAnalyze={handleAnalyze}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {showPaywall && (
          <PaywallModal
            userName={displayName}
            onClose={handlePaywallClose}
            onRegistered={handleRegistered}
            isRegistered={isRegistered}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
