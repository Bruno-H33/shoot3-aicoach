import { useState, useEffect } from "react";
import { Bell, Lock, Play, Dumbbell, User, LogOut, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const PRICES = {
  rapport: "price_1T345HRKXHvnBBog0jfr2XdU",
  sniper: "price_1T347IRKXHvnBBog16QQGxBo",
  team: "price_1T3irvRKXHvnBBogPa9edglS",
};

interface DashboardProps {
  userName: string;
  hasCompletedTest?: boolean;
  onAnalyze: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  analysisId?: string | null;
  onViewReport?: (id: string) => void;
}

const Dashboard = ({ userName, hasCompletedTest = false, onAnalyze, activeTab, onTabChange, analysisId, onViewReport }: DashboardProps) => {
  const { signOut, user } = useAuth();
  const [drillFilter, setDrillFilter] = useState<"Tout" | "Neuro" | "Méca">("Tout");
  const [eliteModalOpen, setEliteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [pastReports, setPastReports] = useState<Array<{ id: string; overall_score: number; created_at: string }>>([]);
  const [showAllReports, setShowAllReports] = useState(false);

  // Fetch past paid reports
  useEffect(() => {
    if (!user) return;
    const fetchReports = async () => {
      const { data } = await supabase
        .from("analyses")
        .select("id, overall_score, created_at")
        .eq("user_id", user.id)
        .eq("paid", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setPastReports(data);
    };
    fetchReports();
  }, [user]);

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleOfferClick = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer la session de paiement",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleMetricClick = () => {
    toast({
      title: "Fonctionnalité Premium",
      description: "Débloque l'analyse complète sur la page Pro",
    });
  };

  return (
    <div className="mobile-container flex flex-col bg-background relative">
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button onClick={() => onTabChange("studio")} className="flex items-center gap-3 active:opacity-70 transition-opacity">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(18 80% 30%), hsl(18 100% 40%))" }}
            >
              <span className="font-sport text-lg text-foreground">S3</span>
            </div>
            <span className="font-sport text-2xl tracking-wider">
              SHOOT<span className="text-primary">3</span>
            </span>
          </button>
          <div className="relative w-11 h-11 rounded-full glass flex items-center justify-center">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* ==================== STUDIO ==================== */}
        {activeTab === "studio" && (
          <div className="px-5 space-y-4 animate-fade-in-up">
            {/* Welcome */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-body text-xs text-primary font-semibold tracking-widest uppercase">Profil Prêt</span>
                </div>
                <h2 className="font-sport text-4xl text-foreground">
                  SALUT, {userName.toUpperCase()} ›
                </h2>
              </div>
              <div className="text-right">
                <p className="font-sport text-3xl text-foreground">Test</p>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Évaluation</p>
              </div>
            </div>

            {/* Main CTA Card */}
            <div
              onClick={onAnalyze}
              className="rounded-3xl p-6 cursor-pointer active:scale-98 transition-all relative overflow-hidden neon-border"
              style={{ background: "linear-gradient(135deg, rgba(20,10,5,0.95), rgba(40,20,8,0.9))" }}
            >
              <div className="absolute top-4 right-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center glow-orange">
                  <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
                </div>
              </div>
              <span className="inline-block font-body text-xs font-bold tracking-widest bg-primary/20 text-primary border border-primary/40 px-3 py-1 rounded-full mb-3">
                TEST INITIAL REQUIS
              </span>
              <h3 className="font-sport text-4xl text-foreground mb-2">ANALYSER MON TIR</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Fais un test de 30s pour obtenir ton diagnostic IA gratuit.
              </p>
            </div>

            {/* Bannière Upgrade */}
            <div
              className="rounded-2xl p-4 border border-primary/20 flex items-center justify-between gap-3"
              style={{ background: "linear-gradient(135deg, rgba(20,8,2,0.95), rgba(40,18,4,0.9))" }}
            >
              <div className="flex-1">
                <h4 className="font-sport text-lg text-foreground tracking-wider">PASSE AU NIVEAU SUPÉRIEUR</h4>
                <p className="font-body text-[11px] text-muted-foreground leading-relaxed">Découvre le programme Sniper Elite et le Pass Team.</p>
              </div>
              <button
                onClick={() => onTabChange("pro")}
                className="flex-shrink-0 bg-primary text-primary-foreground font-body text-[11px] font-semibold tracking-wider px-4 py-2 rounded-xl transition-all active:scale-95 glow-orange"
              >
                VOIR LES OFFRES
              </button>
            </div>

            {/* Mes Rapports */}
            <div
              className="rounded-2xl p-5 border border-white/10"
              style={{ background: "rgba(10,10,10,0.9)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-sport text-xl text-foreground tracking-wider">MES RAPPORTS</h3>
              </div>
              <div className="space-y-2">
                {pastReports.length > 0 && onViewReport ? (
                  <>
                    {(showAllReports ? pastReports : pastReports.slice(0, 3)).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onViewReport(r.id)}
                        className="w-full flex items-center justify-between rounded-xl p-3 border border-white/5 active:scale-98 transition-all hover:border-primary/30"
                        style={{ background: "rgba(20,20,20,0.8)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-sport text-sm text-foreground">RAPPORT D'ANALYSE</p>
                            <p className="font-body text-[10px] text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-sport text-lg ${r.overall_score >= 80 ? "text-green-400" : r.overall_score >= 60 ? "text-primary" : "text-red-400"}`}>
                            {r.overall_score}
                          </p>
                          <p className="font-body text-[9px] text-muted-foreground">/100</p>
                        </div>
                      </button>
                    ))}
                    {pastReports.length > 3 && (
                      <button
                        onClick={() => setShowAllReports(!showAllReports)}
                        className="w-full font-body text-xs text-primary/80 hover:text-primary py-2 transition-colors"
                      >
                        {showAllReports ? "Voir moins" : `Voir tout (${pastReports.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {[
                      { label: "Rapport d'analyse #1", date: "—", score: "—" },
                      { label: "Rapport d'analyse #2", date: "—", score: "—" },
                    ].map((r, i) => (
                      <div
                        key={i}
                        className="w-full flex items-center justify-between rounded-xl p-3 border border-white/5 opacity-40"
                        style={{ background: "rgba(20,20,20,0.8)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-left">
                            <p className="font-sport text-sm text-foreground">{r.label}</p>
                            <p className="font-body text-[10px] text-muted-foreground">{r.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-sport text-lg text-muted-foreground">{r.score}</p>
                        </div>
                      </div>
                    ))}
                    <p className="font-body text-[10px] text-muted-foreground text-center mt-1">Lance ton premier test pour voir tes rapports ici.</p>
                  </>
                )}
              </div>
            </div>

            {/* Heatmap (7J) - Locked with real content preview */}
            <div
              className="rounded-2xl p-5 border border-white/10 relative overflow-hidden"
              style={{ background: "rgba(10,10,10,0.85)" }}
            >
              <div className="opacity-30 grayscale blur-[2px] pointer-events-none">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-sport text-xl text-foreground tracking-wider">Heatmap (7J)</h3>
                    <p className="font-body text-xs text-muted-foreground">Volume et réussite sur la semaine</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sport text-2xl text-green-400">74%</p>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Réussite</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-16 mt-4">
                  {[
                    { h: "35%", color: "#7f1d1d" },
                    { h: "55%", color: "#374151" },
                    { h: "65%", color: "#14532d" },
                    { h: "45%", color: "#7f1d1d" },
                    { h: "80%", color: "#16a34a" },
                    { h: "90%", color: "#22c55e" },
                    { h: "100%", color: "hsl(18 100% 50%)" },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div className="w-full rounded-t-md" style={{ height: bar.h, backgroundColor: bar.color, minHeight: "8px" }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <span key={i} className="flex-1 text-center font-body text-[9px] text-muted-foreground">{d}</span>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-background/80 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground tracking-widest uppercase">Test requis</span>
                </div>
              </div>
            </div>

            {/* Team Shoot3 - Locked with real content preview */}
            <div
              className="rounded-2xl p-5 border border-blue-500/15 relative overflow-hidden"
              style={{ background: "rgba(8,10,20,0.9)" }}
            >
              <div className="opacity-30 grayscale blur-[2px] pointer-events-none flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-900/60 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sport text-xl text-foreground tracking-wider">Team Shoot3</h3>
                  <p className="font-body text-xs text-blue-400/80">Rejoins la ligue &amp; Défie les pros</p>
                  <div className="flex gap-2 mt-2">
                    {["Ligue", "Défis", "Live Pro"].map((tag) => (
                      <span key={tag} className="font-body text-[9px] border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center text-right flex-shrink-0">
                  <p className="font-sport text-2xl text-blue-300">247</p>
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Membres</p>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 rounded-full bg-background/80 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DATA ==================== */}
        {activeTab === "data" && (
          <>
            {!hasCompletedTest ? (
              <div className="flex flex-col items-center justify-center h-96 px-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h2 className="font-sport text-4xl text-foreground">
                  ESPACE DATA <span className="text-primary">VERROUILLÉ</span>
                </h2>
                <p className="font-body text-sm text-muted-foreground mt-4 mb-8 leading-relaxed">
                  Tu dois d'abord effectuer une analyse vidéo pour que l'IA génère tes statistiques.
                </p>
                <button onClick={onAnalyze} className="btn-primary">
                  LANCER MON TEST IA
                </button>
              </div>
            ) : (
              <div className="px-5 space-y-5 animate-fade-in-up">
                {/* Page title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-body text-xs text-primary font-semibold tracking-widest uppercase">Analyse IA Complète</span>
                  </div>
                  <h2 className="font-sport text-4xl text-foreground">PERFORMANCE <span className="text-primary">DATA</span></h2>
                </div>

                {/* Top metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Précision */}
                  <button
                    onClick={handleMetricClick}
                    className="rounded-2xl p-4 border border-white/10 text-left active:scale-98 transition-all"
                    style={{ background: "rgba(10,10,10,0.9)" }}
                  >
                    <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">Précision</p>
                    <p className="font-sport text-4xl text-foreground">48<span className="text-2xl">%</span></p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-body text-[11px] text-green-400 font-semibold">▲ +2.4%</span>
                      <span className="font-body text-[10px] text-muted-foreground">cette semaine</span>
                    </div>
                  </button>
                  {/* BEEF Score */}
                  <button
                    onClick={handleMetricClick}
                    className="rounded-2xl p-4 border border-white/10 text-left active:scale-98 transition-all"
                    style={{ background: "rgba(10,10,10,0.9)" }}
                  >
                    <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">B.E.E.F Score</p>
                    <p className="font-sport text-4xl text-primary">8.5<span className="text-2xl text-muted-foreground">/10</span></p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-body text-[10px] text-muted-foreground">Indice mécanique</span>
                    </div>
                  </button>
                </div>

                {/* Analyse Mécanique */}
                <div
                  className="rounded-2xl p-5 border border-white/10"
                  style={{ background: "rgba(10,10,10,0.9)" }}
                >
                  <h3 className="font-sport text-xl text-foreground tracking-wider mb-4">Analyse Mécanique</h3>
                  <div className="space-y-4">
                    {/* Balance */}
                    <button onClick={handleMetricClick} className="w-full text-left active:opacity-80 transition-opacity">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-body text-xs text-foreground/80 uppercase tracking-wider">Balance</span>
                        <span className="font-sport text-sm text-green-400">92%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: "92%", background: "linear-gradient(90deg, #15803d, #22c55e)" }}
                        />
                      </div>
                    </button>

                    {/* Coude */}
                    <button onClick={handleMetricClick} className="w-full text-left active:opacity-80 transition-opacity">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-body text-xs text-foreground/80 uppercase tracking-wider">Coude</span>
                        <span className="font-sport text-sm text-red-400">64%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: "64%", background: "linear-gradient(90deg, #991b1b, #ef4444)" }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span className="font-body text-[10px] text-red-400">Alerte: Ton coude s'ouvre à 112°</span>
                      </div>
                    </button>

                    {/* Poignet */}
                    <button onClick={handleMetricClick} className="w-full text-left active:opacity-80 transition-opacity">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-body text-xs text-foreground/80 uppercase tracking-wider">Poignet</span>
                        <span className="font-sport text-sm text-foreground">78%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: "78%", background: "linear-gradient(90deg, hsl(18 80% 30%), hsl(18 100% 50%))" }}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Report CTA */}
                  {analysisId && onViewReport ? (
                    <button
                      onClick={() => onViewReport(analysisId)}
                      className="mt-4 w-full bg-primary text-primary-foreground font-sport text-xs tracking-widest py-2.5 rounded-xl transition-all active:scale-98"
                    >
                      VOIR MON RAPPORT COMPLET →
                    </button>
                  ) : (
                    <button
                      onClick={handleMetricClick}
                      className="mt-4 w-full border border-primary/30 text-primary font-body text-xs tracking-widest py-2 rounded-xl transition-all active:scale-98 hover:bg-primary/10"
                    >
                      VOIR L'ANALYSE COMPLÈTE →
                    </button>
                  )}
                </div>

                {/* Partager mon Diagnostic */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + "/diagnostic");
                    toast({
                      title: "Lien copié !",
                      description: "Prêt à être posté dans le Discord Shoot3.",
                    });
                  }}
                  className="w-full rounded-2xl p-4 border border-primary/20 font-sport text-sm tracking-widest text-primary transition-all active:scale-98 hover:bg-primary/10 flex items-center justify-center gap-3"
                  style={{ background: "rgba(20,8,2,0.6)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  PARTAGER MON DIAGNOSTIC (VESTIAIRE)
                </button>
              </div>
            )}
          </>
        )}

        {/* ==================== DRILLS ==================== */}
        {activeTab === "drills" && (
          <>
            {!hasCompletedTest ? (
              <div className="flex flex-col items-center justify-center h-96 px-8 text-center animate-fade-in-up">
                <Dumbbell className="w-16 h-16 text-muted-foreground/40 mb-6" />
                <h2 className="font-sport text-4xl text-foreground">
                  PROGRAMMES <span className="text-primary">VERROUILLÉS</span>
                </h2>
                <p className="font-body text-sm text-muted-foreground mt-4 mb-8 leading-relaxed">
                  Passe ton test IA. Nous te recommanderons des exercices adaptés à tes défauts.
                </p>
                <button onClick={onAnalyze} className="btn-primary">
                  LANCER MON TEST IA
                </button>
              </div>
            ) : (
              <div className="px-5 space-y-4 animate-fade-in-up">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-body text-xs text-primary font-semibold tracking-widest uppercase">Recommandé par l'IA</span>
                  </div>
                  <h2 className="font-sport text-4xl text-foreground">MES <span className="text-primary">DRILLS</span></h2>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2">
                  {(["Tout", "Neuro", "Méca"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDrillFilter(f)}
                      className={`font-body text-xs tracking-widest px-4 py-1.5 rounded-full border transition-all ${
                        drillFilter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-white/20 text-muted-foreground hover:border-white/40"
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Drill Cards */}
                <div className="space-y-3">
                  {/* Card 1 — Neuro-Focus (Elite) */}
                  {(drillFilter === "Tout" || drillFilter === "Neuro") && (
                    <button
                      onClick={() => setEliteModalOpen(true)}
                      className="w-full rounded-2xl p-5 border border-primary/30 relative overflow-hidden text-left active:scale-98 transition-all neon-border"
                      style={{ background: "linear-gradient(135deg, rgba(20,8,2,0.98), rgba(45,18,4,0.95))" }}
                    >
                      {/* Elite badge */}
                      <div className="absolute top-4 right-4">
                        <span className="font-body text-[9px] font-bold tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">ELITE</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="font-body text-[9px] border border-primary/50 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Neuro</span>
                        <span className="font-body text-[9px] text-muted-foreground">· 15 min</span>
                      </div>
                      <h4 className="font-sport text-2xl text-foreground tracking-wider mb-1">NEURO-FOCUS</h4>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        Protocole cognitif pour améliorer la concentration au tir sous pression.
                      </p>
                    </button>
                  )}

                  {/* Card 2 — Form Shooting */}
                  {(drillFilter === "Tout" || drillFilter === "Méca") && (
                    <button
                      onClick={handleMetricClick}
                      className="w-full rounded-2xl p-5 border border-white/10 text-left active:scale-98 transition-all"
                      style={{ background: "rgba(10,10,10,0.9)" }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="font-body text-[9px] border border-white/20 text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">Méca</span>
                        <span className="font-body text-[9px] text-muted-foreground">· 10 min</span>
                      </div>
                      <h4 className="font-sport text-2xl text-foreground tracking-wider mb-1">FORM SHOOTING</h4>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        Répétitions lentes axées sur la correction du coude et le suivi de poignet.
                      </p>
                    </button>
                  )}

                  {/* Card 3 — Balance Training */}
                  {(drillFilter === "Tout" || drillFilter === "Méca") && (
                    <button
                      onClick={handleMetricClick}
                      className="w-full rounded-2xl p-5 border border-white/10 text-left active:scale-98 transition-all"
                      style={{ background: "rgba(10,10,10,0.9)" }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="font-body text-[9px] border border-white/20 text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">Méca</span>
                        <span className="font-body text-[9px] text-muted-foreground">· 12 min</span>
                      </div>
                      <h4 className="font-sport text-2xl text-foreground tracking-wider mb-1">BALANCE TRAINING</h4>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        Exercices de stabilisation pour maximiser ton équilibre au moment du tir.
                      </p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== PRO ==================== */}
        {activeTab === "pro" && (
          <div className="px-5 pb-4 space-y-4 animate-fade-in-up">
            {/* User Profile Header */}
            <div className="flex items-center gap-4 py-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(18 80% 30%), hsl(18 100% 45%))" }}
              >
                <span className="font-sport text-2xl text-foreground">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="font-sport text-2xl text-foreground tracking-wider">{userName.toUpperCase()}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-body text-xs text-muted-foreground tracking-widest uppercase">Profil Actif · Niveau Débutant</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/8" />

            {/* Section label */}
            <div>
              <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">Offres Premium</p>
              <h3 className="font-sport text-3xl text-foreground">PASSE AU <span className="text-primary">NIVEAU SUP</span></h3>
            </div>

            {/* Offer 1 — Rapport d'Analyse 9.99€ */}
            <div className="rounded-2xl p-5 border border-white/10" style={{ background: "rgba(14,10,8,0.95)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/60">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sport text-xl text-foreground tracking-wider">RAPPORT D'ANALYSE (PDF)</h4>
                  <span className="font-body text-xs text-muted-foreground">Accès immédiat · Ton plan d'action d'urgence</span>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {[
                  "Décryptage visuel (frame-by-frame)",
                  "Analyse chiffrée (angles, appuis)",
                  "Routine express ciblée",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/70 flex-shrink-0 mt-1.5" />
                    <span className="font-body text-xs text-foreground/70">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleOfferClick(PRICES.rapport)} disabled={checkoutLoading === PRICES.rapport} className="w-full border border-white/20 text-foreground font-sport text-sm tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-white/40 hover:bg-white/5 disabled:opacity-50">
                DÉBLOQUER MON RAPPORT · 9.99€
              </button>
            </div>

            {/* Offer 2 — Pass Team 19.99€/mois */}
            <div className="rounded-2xl p-5 border border-blue-500/20" style={{ background: "rgba(8,10,18,0.95)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sport text-xl text-foreground tracking-wider">PASS TEAM SHOOT3</h4>
                  <span className="font-body text-xs text-blue-400/80">Abonnement mensuel · Sans engagement</span>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {[
                  "1 analyse biomécanique par semaine",
                  "Le Vestiaire (Groupe privé d'entraide)",
                  "Ligue Shoot3 (Classements & Challenges)",
                  "Shoot3 ID (CV Sportif Certifié au bout de 3 mois)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400/60 flex-shrink-0" />
                    <span className="font-body text-xs text-foreground/70">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleOfferClick(PRICES.team)} disabled={checkoutLoading === PRICES.team} className="w-full border border-blue-500/40 text-blue-300 font-sport text-base tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-blue-400/60 hover:bg-blue-900/20 disabled:opacity-50">
                REJOINDRE LA LIGUE · 19.99€/MOIS
              </button>
            </div>

            {/* Offer 3 — Sniper Elite 49.99€ */}
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(20,8,2,0.98), rgba(45,18,4,0.95))", boxShadow: "0 0 0 1.5px hsl(var(--primary) / 0.6), 0 0 24px hsl(var(--primary) / 0.18), 0 0 48px hsl(var(--primary) / 0.08)" }}>
              <div className="absolute top-4 right-4">
                <span className="font-body text-[9px] font-bold tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded-full uppercase">RECOMMANDÉ</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 glow-orange" style={{ background: "hsl(var(--primary))" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sport text-xl text-foreground tracking-wider">PROGRAMME SNIPER ELITE</h4>
                  <span className="font-body text-xs text-primary/80">3 Mois · Bootcamp sur-mesure</span>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {[
                  "Plan de training sur 3 mois (+12 analyses)",
                  "Check-up biomécanique hebdomadaire",
                  "Exercices neuro-cognitifs et méca.",
                  "Ajustement selon tes progrès",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <span className="font-body text-xs text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Séparateur inclus Pass Team */}
              <div className="border-t border-primary/30 my-4 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-sport text-xs text-primary tracking-widest">+ INCLUS : TOUS LES AVANTAGES DU PASS TEAM</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Le Vestiaire (Groupe privé)",
                    "Ligue Shoot3 (Classements & Challenges)",
                    "Shoot3 ID (CV Sportif Certifié au bout de 3 mois)",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                      <span className="font-body text-[11px] text-foreground/60">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={() => handleOfferClick(PRICES.sniper)} disabled={checkoutLoading === PRICES.sniper} className="btn-primary w-full text-base py-3 disabled:opacity-50">
                DÉMARRER LE BOOTCAMP · 49.99€
              </button>
            </div>

            {/* Déconnexion */}
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-6 border border-white/10 font-body text-sm text-muted-foreground transition-all active:scale-95 hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>

            {/* Suppression de compte */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-6 border border-destructive/30 font-body text-xs text-destructive/70 transition-all active:scale-95 hover:border-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer mon compte et mes données
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[360px] rounded-2xl border border-destructive/30 bg-background">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-sport text-xl text-foreground">SUPPRIMER MON COMPTE</AlertDialogTitle>
                  <AlertDialogDescription className="font-body text-sm text-muted-foreground leading-relaxed">
                    Cette action est <strong className="text-destructive">irréversible</strong>. Toutes tes données seront définitivement supprimées : profil, analyses, frames vidéo, rapports.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="font-body text-sm rounded-xl">Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deletingAccount}
                    onClick={async (e) => {
                      e.preventDefault();
                      setDeletingAccount(true);
                      try {
                        const { error } = await supabase.functions.invoke("delete-account");
                        if (error) throw error;
                        toast({ title: "Compte supprimé", description: "Toutes tes données ont été effacées." });
                        await signOut();
                        window.location.href = "/";
                      } catch (err: any) {
                        toast({ title: "Erreur", description: err.message || "Impossible de supprimer le compte", variant: "destructive" });
                        setDeletingAccount(false);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground font-sport text-xs tracking-widest rounded-xl hover:bg-destructive/90"
                  >
                    {deletingAccount ? "SUPPRESSION..." : "CONFIRMER LA SUPPRESSION"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Lien politique de confidentialité */}
            <a href="/privacy" className="block text-center font-body text-xs text-muted-foreground underline hover:text-foreground transition-colors">
              Politique de confidentialité
            </a>

            <div className="pb-2" />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] nav-bar">
        <div className="flex items-end justify-around px-4 pt-2 pb-5 relative">
          <NavItem icon="🏀" label="STUDIO" active={activeTab === "studio"} onClick={() => onTabChange("studio")} />
          <NavItem icon={<TrendingUpIcon />} label="DATA" active={activeTab === "data"} onClick={() => onTabChange("data")} />
          <div className="flex flex-col items-center -mt-6">
            <button
              onClick={onAnalyze}
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 glow-orange"
              style={{ background: "hsl(var(--primary))" }}
            >
              <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-1" />
            </button>
            <span className="font-body text-[10px] text-muted-foreground mt-1 tracking-widest">ANALYSER</span>
          </div>
          <NavItem icon={<DumbbellIcon />} label="DRILLS" active={activeTab === "drills"} onClick={() => onTabChange("drills")} />
          <NavItem icon={<UserIcon />} label="PRO" active={activeTab === "pro"} onClick={() => onTabChange("pro")} />
        </div>
      </div>

      {/* Elite Modal */}
      <Dialog open={eliteModalOpen} onOpenChange={setEliteModalOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl border border-primary/30 bg-background">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2" style={{ background: "hsl(var(--primary))" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <DialogTitle className="font-sport text-2xl text-foreground tracking-wider text-center">ACCÈS ELITE REQUIS</DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground text-center leading-relaxed">
              Ce programme nécessite le Pass Sniper Elite
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => { setEliteModalOpen(false); onTabChange("pro"); }}
            className="btn-primary w-full mt-2"
          >
            VOIR L'OFFRE SNIPER ELITE →
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Nav icons
const TrendingUpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const DumbbellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 9.5h2M18 9.5h2M4 14.5h2M18 14.5h2M2 8.5h2v7H2zM20 8.5h2v7h-2z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
  </svg>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[50px]">
    <span className={`text-xl transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
      {typeof icon === "string" ? icon : <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>}
    </span>
    <span className={`font-body text-[10px] tracking-widest transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
      {label}
    </span>
  </button>
);

export default Dashboard;
