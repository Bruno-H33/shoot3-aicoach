import { useState, useEffect } from "react";
import { Lock, Check, FileText, ChevronRight, X, Sparkles, Users, Clock } from "lucide-react";
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
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24h in seconds
  const [activationsToday, setActivationsToday] = useState(147);

  useEffect(() => {
    if (!isRegistered) onRegistered();
    const goal = localStorage.getItem("s3_user_goal") || "";
    setUserGoal(goal);

    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    // Random activations counter
    const activationInterval = setInterval(() => {
      setActivationsToday(prev => prev + Math.floor(Math.random() * 2));
    }, 45000);

    return () => {
      clearInterval(timer);
      clearInterval(activationInterval);
    };
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

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

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

          <div className="space-y-3 mb-8">
            {/* Premier problème visible */}
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

            {/* Problèmes floutés */}
            <div className="rounded-2xl p-6 border border-orange-400/40 relative overflow-hidden" style={{ background: "rgba(30, 40, 60, 0.9)" }}>
              <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center">
                <div className="text-center px-4">
                  <Lock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="font-sport text-sm text-orange-400 tracking-wider">DIAGNOSTIC COMPLET</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">Débloque 2 problèmes critiques</p>
                </div>
              </div>
              <p className="font-body text-sm text-foreground/90 leading-relaxed mb-3 blur-sm select-none">
                "{pseudo}, ton <span className="font-semibold">Poignet</span> casse trop tard dans le mouvement. L'angle de release optimal est atteint 0.12s après le point mort haut..."
              </p>
              <div className="pt-3 border-t border-white/10 blur-sm">
                <p className="font-body text-sm text-muted-foreground">
                  Impact sur précision : <span className="font-sport text-lg">-18%</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl p-6 border border-red-400/40 relative overflow-hidden" style={{ background: "rgba(30, 40, 60, 0.9)" }}>
              <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center">
                <div className="text-center px-4">
                  <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="font-sport text-sm text-red-400 tracking-wider">PROBLÈME CRITIQUE</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">Visible avec l'essai gratuit</p>
                </div>
              </div>
              <p className="font-body text-sm text-foreground/90 leading-relaxed mb-3 blur-sm select-none">
                "{pseudo}, ta <span className="font-semibold">Base</span> est déséquilibrée. Ton poids est décalé de 7cm vers l'avant-gauche ce qui crée une rotation non contrôlée..."
              </p>
              <div className="pt-3 border-t border-white/10 blur-sm">
                <p className="font-body text-sm text-muted-foreground">
                  Risque de blessure : <span className="font-sport text-lg text-red-400">Élevé</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-green-500/30 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(10, 30, 15, 0.95), rgba(15, 45, 20, 0.9))" }}>
            {/* Timer d'urgence */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-500/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <p className="font-body text-xs text-orange-400">Offre expire dans</p>
              </div>
              <p className="font-sport text-sm text-orange-400">
                {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
              </p>
            </div>

            {/* Preuve sociale */}
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-green-500/10">
              <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="font-body text-xs text-green-400">
                <span className="font-semibold">{activationsToday} joueurs</span> ont activé leur essai aujourd'hui
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-400" />
              <h3 className="font-sport text-xl text-foreground tracking-wider">DÉBLOQUE TON PROGRAMME</h3>
            </div>

            <p className="font-body text-base text-foreground leading-relaxed mb-4">
              L'IA a identifié <span className="text-red-400 font-semibold">3 problèmes critiques</span>. <span className="text-green-400 font-semibold">Débloque ton programme d'entraînement personnalisé gratuitement pendant 7 jours</span> pour commencer à corriger ça.
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

          <button onClick={onClose} className="font-body text-xs text-muted-foreground/50 hover:text-muted-foreground/70 text-center w-full py-2 mt-2 transition-colors">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
