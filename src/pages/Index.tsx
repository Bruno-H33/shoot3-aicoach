import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import CameraView from "@/components/CameraView";
import PaywallModal from "@/components/PaywallModal";
import AuthPrompt from "@/components/AuthPrompt";
import ReportView from "@/components/ReportView";

type View = "splash" | "onboarding" | "camera" | "auth-prompt" | "dashboard" | "report";

interface AnalysisResult {
  issues: Array<{ key: string; label: string; severity: string; feedback_fr: string }>;
  score: number;
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<View>("splash");
  const [userName, setUserName] = useState("");
  const [onboardingData, setOnboardingData] = useState<{ position: string; objective: string } | null>(null);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("studio");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  // Handle payment success redirect
  useEffect(() => {
    const payment = searchParams.get("payment");
    const savedAnalysisId = sessionStorage.getItem("s3_last_analysis_id");
    if (payment === "success" && savedAnalysisId && user) {
      setCurrentAnalysisId(savedAnalysisId);
      setView("report");
      setSearchParams({});
      sessionStorage.removeItem("s3_last_analysis_id");
    } else if (payment) {
      setSearchParams({});
    }
  }, [searchParams, user]);

  // If user is already authenticated, skip to dashboard
  useEffect(() => {
    if (!loading && user && view === "splash") {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
      if (name) setUserName(name);
      
      const pendingFlow = sessionStorage.getItem("s3_pending_auth_flow");
      if (pendingFlow) {
        sessionStorage.removeItem("s3_pending_auth_flow");
        const pending = JSON.parse(pendingFlow);
        if (pending.userName) setUserName(pending.userName);
        if (pending.onboardingData) setOnboardingData(pending.onboardingData);
        if (pending.analysisResult) setAnalysisResult(pending.analysisResult);
        setHasCompletedTest(true);
        setView("dashboard");
        setShowPaywall(true);
        
        // Save analysis to DB and show paywall
        if (pending.analysisResult) {
          saveAnalysis(pending.analysisResult, user.id).then((id) => {
            if (id) setCurrentAnalysisId(id);
          });
        }

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

  // After auth completes from auth-prompt
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

      // Save analysis to DB
      if (analysisResult) {
        saveAnalysis(analysisResult, user.id).then((id) => {
          if (id) setCurrentAnalysisId(id);
        });
      }

      setHasCompletedTest(true);
      setView("dashboard");
      setShowPaywall(true);
    }
  }, [user, view, onboardingData, userName]);

  const saveAnalysis = async (result: AnalysisResult, userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .insert({
          user_id: userId,
          issues: result.issues as any,
          overall_score: result.score,
        })
        .select("id")
        .single();
      if (error) { console.error("Save analysis error:", error); return null; }
      const id = data?.id || null;
      if (id) sessionStorage.setItem("s3_last_analysis_id", id);
      return id;
    } catch (e) {
      console.error("Save analysis error:", e);
      return null;
    }
  };

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

  const handleCameraComplete = (issues?: Array<{ key: string; label: string; severity: string; feedback_fr: string }>) => {
    setHasCompletedTest(true);
    const result: AnalysisResult = {
      issues: issues || [],
      score: issues && issues.length > 0 ? Math.max(40, 100 - issues.length * 12) : 85,
    };
    setAnalysisResult(result);
    
    if (user) {
      saveAnalysis(result, user.id).then((id) => {
        if (id) setCurrentAnalysisId(id);
      });
      setView("dashboard");
      setShowPaywall(true);
    } else {
      sessionStorage.setItem("s3_pending_auth_flow", JSON.stringify({
        userName,
        onboardingData,
        analysisResult: result,
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
            analysisId={currentAnalysisId}
            onViewReport={(id) => { setCurrentAnalysisId(id); setView("report"); }}
          />
        )}

        {view === "report" && currentAnalysisId && (
          <ReportView
            analysisId={currentAnalysisId}
            onBack={() => setView("dashboard")}
          />
        )}

        {showPaywall && (
          <PaywallModal
            userName={displayName}
            onClose={handlePaywallClose}
            onRegistered={handleRegistered}
            isRegistered={isRegistered}
            analysisResult={analysisResult}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
