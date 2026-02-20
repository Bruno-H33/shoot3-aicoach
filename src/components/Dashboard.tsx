import { useState } from "react";
import { Bell, Lock, Play, Dumbbell, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DashboardProps {
  userName: string;
  hasCompletedTest?: boolean;
  onAnalyze: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Dashboard = ({ userName, hasCompletedTest = false, onAnalyze, activeTab, onTabChange }: DashboardProps) => {
  const [drillFilter, setDrillFilter] = useState<"Tout" | "Neuro" | "Méca">("Tout");
  const [eliteModalOpen, setEliteModalOpen] = useState(false);

  const handleOfferClick = () => {
    toast({
      title: "Redirection Stripe",
      description: "Redirection vers la page de paiement Stripe... (Simulation)",
    });
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

                  {/* Upsell nudge */}
                  <button
                    onClick={handleMetricClick}
                    className="mt-4 w-full border border-primary/30 text-primary font-body text-xs tracking-widest py-2 rounded-xl transition-all active:scale-98 hover:bg-primary/10"
                  >
                    VOIR L'ANALYSE COMPLÈTE →
                  </button>
                </div>
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

            {/* Offer 1 — PDF Report 9.99€ */}
            <div className="rounded-2xl p-5 border border-white/10" style={{ background: "rgba(14,10,8,0.9)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-sport text-xl text-foreground tracking-wider">ANALYSE PDF DÉTAILLÉE</h4>
                  <span className="font-body text-xs text-muted-foreground">Accès immédiat · PDF envoyé par email</span>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {["Diagnostic des points bloquants", "Images frame-by-frame de ton tir", "Plan d'entraînement immédiat (3 exercices)"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/70 flex-shrink-0" />
                    <span className="font-body text-xs text-foreground/70">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleOfferClick} className="w-full border border-white/20 text-foreground font-sport text-base tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-white/40">
                DÉBLOQUER · 9.99€
              </button>
            </div>

            {/* Offer 2 — Sniper Elite 49.99€ */}
            <div className="rounded-2xl p-5 relative overflow-hidden neon-border" style={{ background: "linear-gradient(135deg, rgba(20,8,2,0.98), rgba(45,18,4,0.95))" }}>
              <div className="absolute top-4 right-4">
                <span className="font-body text-[9px] font-bold tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">Recommandé</span>
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
                  <span className="font-body text-xs text-primary/80">30 Jours · Transformation Complète</span>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {["Évolution adaptative IA", "Suivi quotidien", "Exercices neuro-cognitifs", "Correction biomécanique ciblée"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-body text-xs text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleOfferClick} className="btn-primary w-full text-base">
                DÉMARRER LE PROGRAMME · 49.99€
              </button>
            </div>

            {/* Offer 3 — Team 14.99€/mois */}
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
                {["Accès à la communauté privée", "Lives mensuels avec invités Pros", "Participations aux Défis et Events", "CV Sportif Certifié (après 3 mois)"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400/60 flex-shrink-0" />
                    <span className="font-body text-xs text-foreground/70">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleOfferClick} className="w-full border border-blue-500/40 text-blue-300 font-sport text-base tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-blue-400/60 hover:bg-blue-900/20">
                REJOINDRE LA LIGUE · 14.99€/MOIS
              </button>
            </div>

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
