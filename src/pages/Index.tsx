import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import CameraView from "@/components/CameraView";
import PaywallModal from "@/components/PaywallModal";

type View = "splash" | "onboarding" | "dashboard" | "camera";

const Index = () => {
  const [view, setView] = useState<View>("splash");
  const [userName, setUserName] = useState("");
  const [_hasCompletedTest, setHasCompletedTest] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("studio");

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
            userName={userName || "Joueur"}
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
            userName={userName || "Joueur"}
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
