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
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-sport text-lg tracking-wider text-foreground">RÉSULTAT D'ANALYSE</span>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center border border-white/10">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 px-5 pb-8 space-y-6 max-w-[430px] mx-auto w-full">
        {/* Score header */}
        <div className="text-center pt-6 space-y-2">
          <p className="font-body text-sm text-muted-foreground tracking-widest uppercase">Score Global</p>
          <p className="font-sport text-6xl text-foreground">{score}<span className="text-2xl text-muted-foreground">/100</span></p>
          <p className="font-body text-sm text-foreground/70">Bien joué {pseudo} ! Voici ce que l'IA a détecté 👇</p>
        </div>

        {/* ─── SECTION 1 : Free issue preview ─── */}
        {firstIssue && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-body text-xs font-bold tracking-widest uppercase text-primary">Erreur N°1</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-body text-[10px] font-bold uppercase tracking-widest">Gratuit</span>
            </div>

            <div
              className="rounded-2xl overflow-hidden border border-primary/30"
              style={{ background: "rgba(20, 15, 10, 0.9)", boxShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
            >
              {/* Annotated frame */}
              {firstFrame && (
                <div className="w-full aspect-video bg-black/50 overflow-hidden">
                  <AnnotatedFrame imageUrl={firstFrame} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-5 space-y-3">
                <p className="font-sport text-xl text-foreground tracking-wide">{firstIssue.label}</p>
                <div className="space-y-2">
                  <p className="font-body text-xs font-bold text-primary uppercase tracking-widest">Ce qu'on observe</p>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">{firstIssue.feedback_fr}</p>
                </div>
                {/* Deliberately NO correction section — curiosity gap */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-primary/60" />
                    <p className="font-body text-xs text-primary/60 italic">Comment corriger → disponible dans le Rapport Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 2 : Locked issues ─── */}
        {lockedIssues.length > 0 && (
          <div className="space-y-3">
            <p className="font-body text-xs font-bold tracking-widest uppercase text-muted-foreground">⚠️ Autres anomalies détectées</p>

            {lockedIssues.map((issue, i) => (
              <div
                key={issue.key}
                className="relative rounded-2xl overflow-hidden border border-white/5"
                style={{ background: "rgba(15, 12, 10, 0.8)" }}
              >
                {/* Blurred fake content */}
                <div className="p-5 blur-[6px] select-none pointer-events-none" aria-hidden>
                  <p className="font-sport text-lg text-foreground">{issue.label}</p>
                  <p className="font-body text-sm text-foreground/60 mt-2 leading-relaxed">
                    Analyse détaillée de la mécanique corporelle avec les angles mesurés et les corrections personnalisées pour ce problème spécifique...
                  </p>
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-body text-sm text-foreground font-semibold">Problème détecté sur :</p>
                  <p className="font-sport text-base text-primary tracking-wide">{issue.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── SECTION 3 : Visual PDF preview ─── */}
        <div className="space-y-3">
          <p className="font-body text-xs font-bold tracking-widest uppercase text-muted-foreground">Aperçu du Rapport</p>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
            {/* Fake PDF header */}
            <div className="px-5 pt-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-sport text-sm text-foreground tracking-wider">RAPPORT OFFICIEL</p>
                  <p className="font-body text-xs text-primary">{pseudo}</p>
                </div>
              </div>
            </div>

            {/* Fake PDF content */}
            <div className="px-5 py-4 space-y-3">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-5/6 rounded bg-white/10" />
              <div className="h-8 w-1/2 rounded bg-primary/10 mt-4" />
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-4/5 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-2/3 rounded bg-white/10" />
            </div>

            {/* Gradient blur overlay */}
            <div className="absolute inset-x-0 bottom-0 h-[80%] flex items-center justify-center"
              style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0.7) 30%, rgba(5,5,5,0.95) 100%)", backdropFilter: "blur(4px)" }}
            >
              <button
                onClick={handleBuyReport}
                disabled={buyLoading}
                className="px-6 py-3 rounded-2xl bg-primary/20 border border-primary/40 font-sport text-base text-primary tracking-widest uppercase flex items-center gap-2 hover:bg-primary/30 transition-colors"
              >
                <Lock className="w-4 h-4" />
                DÉVERROUILLER
              </button>
            </div>
          </div>
        </div>

        {/* ─── SECTION 4 : Sales pitch ─── */}
        <div className="space-y-4">
          <p className="font-sport text-2xl text-foreground tracking-wide text-center">
            {userGoal ? `Atteins ton objectif de ${userGoal}` : "Passe au niveau supérieur"}
          </p>

          <div className="space-y-3 px-2">
            {[
              "Diagnostic biomécanique complet (Angles & Posture)",
              "3 Exercices correctifs sur-mesure",
              "Plan d'entraînement ciblé",
              "Photos annotées exportables",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <p className="font-body text-sm text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pb-4">
          <button
            onClick={handleBuyReport}
            disabled={buyLoading}
            className="w-full py-4 rounded-2xl font-sport text-lg tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 animate-pulse-orange"
            style={{
              background: "linear-gradient(135deg, hsl(18 90% 40%), hsl(18 100% 50%))",
              boxShadow: "0 4px 30px hsl(18 100% 50% / 0.35)",
            }}
          >
            {buyLoading ? "REDIRECTION..." : (
              <>
                Obtenir mon Rapport Premium – 9.99€
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button onClick={onClose} className="font-body text-xs text-muted-foreground underline text-center w-full py-2">
            Retourner au Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
