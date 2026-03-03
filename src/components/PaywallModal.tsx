import { useState, useEffect } from "react";
import { Lock, Check, FileText, ChevronRight, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnnotatedFrame from "./AnnotatedFrame";

interface AnalysisIssue {
  key: string;
  label: string;
  severity: string;
  feedback_fr: string;
}

interface AnalysisResult {
  issues: AnalysisIssue[];
  score: number;
  frames?: string[];
}

interface PaywallModalProps {
  userName: string;
  onClose: () => void;
  onRegistered: () => void;
  isRegistered: boolean;
  analysisResult?: AnalysisResult | null;
}

const RAPPORT_PRICE_ID = "price_1T345HRKXHvnBBog0jfr2XdU";

const PaywallModal = ({ userName, onClose, onRegistered, isRegistered, analysisResult }: PaywallModalProps) => {
  const [buyLoading, setBuyLoading] = useState(false);
  const [userGoal, setUserGoal] = useState("");

  useEffect(() => {
    if (!isRegistered) onRegistered();
    const goal = localStorage.getItem("s3_user_goal") || "";
    setUserGoal(goal);
  }, []);

  const handleStartFreeTrial = async () => {
    setBuyLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error: trialError } = await supabase
        .from("user_trials")
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        });

      if (trialError) throw trialError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ trial_drills_unlocked: true })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast.success("Free Trial activé ! Profite de 7 jours gratuits.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'activation du trial");
    } finally {
      setBuyLoading(false);
    }
  };

  const handleBuyReport = async () => {
    setBuyLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: RAPPORT_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Erreur de paiement");
    } finally {
      setBuyLoading(false);
    }
  };

  const issues = analysisResult?.issues || [];
  const firstIssue = issues[0];
  const lockedIssues = issues.slice(1, 3);
  const score = analysisResult?.score ?? 65;
  const firstFrame = analysisResult?.frames?.[0];
  const pseudo = localStorage.getItem("s3_user_pseudo") || userName || "Joueur";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto">
      <div className="flex-1 px-5 pb-8 space-y-6 max-w-[430px] mx-auto w-full relative">
        <div className="absolute inset-0 border-2 border-primary rounded-3xl m-4" style={{ boxShadow: "0 0 80px hsl(var(--primary) / 0.3)" }} />

        <div className="relative z-10 pt-12">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500 mx-auto mb-6 flex items-center justify-center animate-pulse" style={{ boxShadow: "0 0 60px rgba(34, 197, 94, 0.5)" }}>
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="font-sport text-5xl text-foreground mb-4 tracking-wider">
              COMPTE CRÉÉ
            </h1>

            <p className="font-body text-base text-muted-foreground mb-2">
              Voici le diagnostic de ton tir :
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="rounded-2xl p-6 border border-white/10 relative" style={{ background: "rgba(30, 40, 60, 0.9)" }}>
              <p className="font-body text-sm text-foreground/90 leading-relaxed mb-3">
                "{pseudo}, ton <span className="text-primary font-semibold">Coude</span> s'ouvre trop vers l'extérieur (112°). Ta cible idéale est 90°. Cela désaxe ta trajectoire vers la gauche."
              </p>
              <div className="pt-3 border-t border-white/10">
                <p className="font-body text-sm text-muted-foreground">
                  Score de stabilité : <span className="font-sport text-lg text-foreground">65/100</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-green-500/30 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(10, 30, 15, 0.95), rgba(15, 45, 20, 0.9))" }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-400" />
              <h3 className="font-sport text-xl text-foreground tracking-wider">DÉBLOQUE TON PROGRAMME</h3>
            </div>

            <p className="font-body text-base text-foreground leading-relaxed mb-4">
              L'IA a identifié tes failles. <span className="text-green-400 font-semibold">Débloque ton programme d'entraînement personnalisé gratuitement pendant 7 jours</span> pour commencer à corriger ça.
            </p>

            <div className="space-y-2 mb-6">
              {[
                "Accès aux Drills personnalisés",
                "Suivi de progression quotidien",
                "Exercices neuro-cognitifs et mécaniques",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <p className="font-body text-sm text-foreground/80">{item}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartFreeTrial}
              disabled={buyLoading}
              className="w-full py-4 rounded-2xl font-sport text-lg tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 text-black mb-3"
              style={{
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                boxShadow: "0 4px 20px rgba(34, 197, 94, 0.4)",
              }}
            >
              {buyLoading ? "ACTIVATION..." : "DÉMARRER 7 JOURS GRATUITS"}
            </button>

            <p className="font-body text-xs text-center text-muted-foreground">
              Sans engagement · Annule quand tu veux
            </p>
          </div>

          <div className="text-center">
            <p className="font-body text-xs text-muted-foreground mb-3">Ou</p>
            <button
              onClick={handleBuyReport}
              className="font-body text-sm text-primary underline hover:text-primary/80 transition-colors"
            >
              Acheter uniquement le Rapport PDF - 9.99€
            </button>
          </div>

          <button onClick={onClose} className="font-body text-sm text-muted-foreground underline text-center w-full py-4">
            Fermer et retourner au Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
