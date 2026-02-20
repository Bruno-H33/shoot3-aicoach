import { Bell, Lock, Play, TrendingUp, Dumbbell, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DashboardProps {
  userName: string;
  hasCompletedTest?: boolean;
  onAnalyze: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Dashboard = ({ userName, onAnalyze, activeTab, onTabChange }: DashboardProps) => {
  const handleOfferClick = () => {
    toast({
      title: "Redirection Stripe",
      description: "Redirection vers la page de paiement Stripe... (Simulation)",
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
              style={{
                background: "linear-gradient(135deg, rgba(20,10,5,0.95), rgba(40,20,8,0.9))",
              }}
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

            {/* Heatmap IA - Locked */}
            <div
              className="rounded-2xl p-5 border border-white/8 relative overflow-hidden"
              style={{ background: "rgba(10,10,10,0.8)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-sport text-2xl text-foreground/50">HEATMAP IA</h3>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Passe ton test pour débloquer tes statistiques.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 h-10 rounded-xl bg-muted/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] rounded-2xl" />
            </div>

            {/* Team Shoot3 - Locked */}
            <div
              className="rounded-2xl p-5 border border-white/8 relative overflow-hidden flex items-center gap-4"
              style={{ background: "rgba(10,10,10,0.8)" }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-blue-400/60" />
              </div>
              <div className="flex-1">
                <h3 className="font-sport text-xl text-foreground/50">Team Shoot3</h3>
                <p className="font-body text-xs text-muted-foreground">Rejoins la communauté</p>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] rounded-2xl" />
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="flex flex-col items-center justify-center h-96 px-8 text-center animate-fade-in-up">
            <TrendingUp className="w-16 h-16 text-muted-foreground/40 mb-6" />
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
        )}

        {activeTab === "drills" && (
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
        )}

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
            <div
              className="rounded-2xl p-5 border border-white/10"
              style={{ background: "rgba(14,10,8,0.9)" }}
            >
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
              <button
                onClick={() => handleOfferClick()}
                className="w-full border border-white/20 text-foreground font-sport text-base tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-white/40"
              >
                DÉBLOQUER · 9.99€
              </button>
            </div>

            {/* Offer 2 — Sniper Elite 49.99€ (Hero) */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden neon-border"
              style={{ background: "linear-gradient(135deg, rgba(20,8,2,0.98), rgba(45,18,4,0.95))" }}
            >
              {/* Recommandé badge */}
              <div className="absolute top-4 right-4">
                <span className="font-body text-[9px] font-bold tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">Recommandé</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 glow-orange" style={{ background: "hsl(var(--primary))" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                    <line x1="12" y1="2" x2="12" y2="5"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="5" y2="12"/>
                    <line x1="19" y1="12" x2="22" y2="12"/>
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
              <button
                onClick={() => handleOfferClick()}
                className="btn-primary w-full text-base"
              >
                DÉMARRER LE PROGRAMME · 49.99€
              </button>
            </div>

            {/* Offer 3 — Team Subscription 14.99€/mois */}
            <div
              className="rounded-2xl p-5 border border-blue-500/20"
              style={{ background: "rgba(8,10,18,0.95)" }}
            >
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
              <button
                onClick={() => handleOfferClick()}
                className="w-full border border-blue-500/40 text-blue-300 font-sport text-base tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-blue-400/60 hover:bg-blue-900/20"
              >
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
          {/* Left tabs */}
          <NavItem icon="🏀" label="STUDIO" active={activeTab === "studio"} onClick={() => onTabChange("studio")} />
          <NavItem icon={<TrendingUpIcon />} label="DATA" active={activeTab === "data"} onClick={() => onTabChange("data")} />

          {/* FAB center */}
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

          {/* Right tabs */}
          <NavItem icon={<DumbbellIcon />} label="DRILLS" active={activeTab === "drills"} onClick={() => onTabChange("drills")} />
          <NavItem icon={<UserIcon />} label="PRO" active={activeTab === "pro"} onClick={() => onTabChange("pro")} />
        </div>
      </div>
    </div>
  );
};

// Simple nav icons using SVG
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
