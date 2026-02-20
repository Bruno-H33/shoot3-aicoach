import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import CameraView from "@/components/CameraView";
import PaywallModal from "@/components/PaywallModal";

type View = "splash" | "onboarding" | "dashboard" | "camera";

const Index = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>("splash");
  const [userName, setUserName] = useState("");
  const [_hasCompletedTest, setHasCompletedTest] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("studio");

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
    setView("dashboard");
  };

  const handleAnalyze = () => {
    setView("camera");
  };

  const handleCameraComplete = () => {
    setView("dashboard");
    setShowPaywall(true);
  };

  const handleCameraClose = () => {
    setView("dashboard");
  };

  const handleRegistered = () => {
    setIsRegistered(true);
    setHasCompletedTest(true);
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    setActiveTab("studio");
  };

  const displayName = userName || user.user_metadata?.full_name || user.user_metadata?.name || "Joueur";

  return (
    <div className="min-h-dvh bg-black flex justify-center">
      <div className="w-full max-w-[430px] relative">
        {view === "splash" && (
          <SplashScreen onStart={() => setView("onboarding")} />
        )}

        {view === "onboarding" && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {view === "dashboard" && (
          <Dashboard
            userName={displayName}
            hasCompletedTest={isRegistered}
            onAnalyze={handleAnalyze}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {view === "camera" && (
          <CameraView
            onComplete={handleCameraComplete}
            onClose={handleCameraClose}
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
