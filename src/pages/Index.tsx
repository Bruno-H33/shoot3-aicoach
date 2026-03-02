import { useState, useEffect, useCallback } from "react";
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
import AccessCodeGate from "@/components/AccessCodeGate";
import NoCreditsModal from "@/components/NoCreditsModal";

type View = "splash" | "onboarding" | "camera" | "auth-prompt" | "dashboard" | "report";

interface AnalysisResult {
  issues: Array<{ key: string; label: string; severity: string; feedback_fr: string }>;
  score: number;
  frames?: string[];
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<View>("splash");
  const [accessGranted, setAccessGranted] = useState(() => sessionStorage.getItem("s3_access_granted") === "true");
  const [userName, setUserName] = useState("");
  const [onboardingData, setOnboardingData] = useState<{ position: string; objective: string } | null>(null);
  const [hasCompletedTest, setHasCompletedTest] = useState(() => {
    const code = sessionStorage.getItem("s3_access_code");
    return code === "SHOOT3ADMIN";
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("studio");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [showNoCredits, setShowNoCredits] = useState(false);

  // Fetch user credits
  const fetchCredits = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .single();
    if (data) setCredits(data.credits);
  }, []);

  useEffect(() => {
    if (user) fetchCredits(user.id);
  }, [user, fetchCredits]);

  // Handle payment success redirect
  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
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
  }, [searchParams, user, loading]);

  // If user is already authenticated, skip to dashboard
  useEffect(() => {
    if (!loading && user && view === "splash" && !searchParams.get("payment")) {
      // Prioritize localStorage pseudo over OAuth name
      const savedPseudo = localStorage.getItem("s3_user_pseudo");
      const name = savedPseudo || user.user_metadata?.full_name || user.user_metadata?.name || "";
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
          saveAnalysis(pending.analysisResult, user.id, pending.analysisResult?.frames).then((id) => {
            if (id) setCurrentAnalysisId(id);
          });
        }

      if (pending.onboardingData) {
          // Always prioritize the pseudo from onboarding over OAuth name
          const pseudoName = localStorage.getItem("s3_user_pseudo") || pending.userName || name;
          supabase.from("profiles").update({
            display_name: pseudoName,
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
          // Prioritize localStorage pseudo over OAuth name
          const pseudoName = localStorage.getItem("s3_user_pseudo") || userName;
          await supabase.from("profiles").update({
            display_name: pseudoName,
            position: onboardingData.position,
            objective: onboardingData.objective,
          }).eq("user_id", user.id);
        }
      };
      saveProfile();

      // Save analysis to DB
      if (analysisResult) {
        saveAnalysis(analysisResult, user.id, analysisResult?.frames).then((id) => {
          if (id) setCurrentAnalysisId(id);
        });
      }

      setHasCompletedTest(true);
      setView("dashboard");
      setShowPaywall(true);
    }
  }, [user, view, onboardingData, userName]);

  const uploadFrames = async (frames: string[], userId: string, analysisId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < frames.length; i++) {
      try {
        const base64 = frames[i].split(",")[1];
        const byteString = atob(base64);
        const ab = new Uint8Array(byteString.length);
        for (let j = 0; j < byteString.length; j++) ab[j] = byteString.charCodeAt(j);
        const blob = new Blob([ab], { type: "image/jpeg" });
        const path = `${userId}/${analysisId}/frame_${i}.jpg`;
        const { error: upErr } = await supabase.storage.from("analysis-frames").upload(path, blob);
        if (upErr) { console.error("Upload frame error:", upErr); continue; }
        // Store the path (not a public URL) — signed URLs are generated on demand
        urls.push(path);
      } catch (e) {
        console.error("Frame upload error:", e);
      }
    }
    return urls;
  };

  const saveAnalysis = async (result: AnalysisResult, userId: string, frames?: string[]): Promise<string | null> => {
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
      if (id) {
        sessionStorage.setItem("s3_last_analysis_id", id);
        // Upload frames and save URLs
        if (frames && frames.length > 0) {
          const frameUrls = await uploadFrames(frames, userId, id);
          if (frameUrls.length > 0) {
            await supabase.from("analyses").update({ frames_urls: frameUrls }).eq("id", id);
          }
        }
      }
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
    // Check credits for logged-in users
    if (user && credits !== null && credits <= 0) {
      setShowNoCredits(true);
      return;
    }
    setView("camera");
  };

  const handleCameraComplete = async (issues?: Array<{ key: string; label: string; severity: string; feedback_fr: string }>, frames?: string[]) => {
    setHasCompletedTest(true);
    const result: AnalysisResult = {
      issues: issues || [],
      score: issues && issues.length > 0 ? Math.max(40, 100 - issues.length * 12) : 85,
      frames,
    };
    setAnalysisResult(result);
    
    if (user) {
      const { data, error } = await supabase.rpc('decrement_user_credits', {
        p_user_id: user.id,
      });
      if (data && data.length > 0 && data[0].success) {
        setCredits(data[0].remaining_credits);
      }

      saveAnalysis(result, user.id, frames).then((id) => {
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

  const displayName = localStorage.getItem("s3_user_pseudo") || userName || user?.user_metadata?.full_name || user?.user_metadata?.name || "Joueur";

  return (
    <div className="min-h-dvh bg-black flex justify-center">
      <div className="w-full max-w-[430px] relative">
        {!accessGranted && !user ? (
          <AccessCodeGate onValidated={() => setAccessGranted(true)} />
        ) : (
        <>
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

        {showNoCredits && (
          <NoCreditsModal onClose={() => setShowNoCredits(false)} />
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Index;
