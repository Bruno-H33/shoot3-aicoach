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

          <div className="rounded-2xl p-6 border border-primary/20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(25, 15, 5, 0.95), rgba(45, 25, 10, 0.9))" }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-sport text-xl text-foreground tracking-wider">DÉBLOQUE LA SOLUTION</h3>
            </div>

            <p className="font-body text-sm text-foreground/80 leading-relaxed mb-6">
              Obtiens le Rapport PDF complet incluant le plan d'entraînement sur 30 jours pour corriger ce défaut précis.
            </p>

            <button
              onClick={handleBuyReport}
              disabled={buyLoading}
              className="w-full py-4 rounded-2xl font-sport text-lg tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 text-background"
              style={{
                background: "linear-gradient(135deg, #e0e0e0, #ffffff)",
                boxShadow: "0 4px 20px rgba(255, 255, 255, 0.3)",
              }}
            >
              {buyLoading ? "REDIRECTION..." : "ACHETER LE RAPPORT - 9.99€"}
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
