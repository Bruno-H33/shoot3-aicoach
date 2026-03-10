import { useState } from "react";
import { ChevronLeft, Check, Target, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { activateTrial, updateUserProfile } from "@/lib/trial-management";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingProps {
  onComplete: (name: string, position: string, objective: string) => void;
}

const introSlides = [
  {
    icon: Target,
    title: "BIENVENUE DANS SHOOT3",
    subtitle: "Ton coach IA Elite",
    description: "Analyse biomécanique en temps réel. Transforme ta technique de tir comme un pro NBA.",
  },
  {
    icon: Zap,
    title: "DIAGNOSTIC GRATUIT",
    subtitle: "Découvre tes points d'amélioration",
    description: "Une analyse complète offerte pour identifier tes axes de progression.",
  },
  {
    icon: TrendingUp,
    title: "7 JOURS D'ESSAI GRATUIT",
    subtitle: "Accès complet à l'IA",
    description: "Programme personnalisé, exercices adaptés, suivi de progression. Aucune carte bancaire requise.",
  },
];

const niveaux = [
  { id: "debutant", label: "Débutant", desc: "Je débute le basket ou le tir." },
  { id: "intermediaire", label: "Intermédiaire", desc: "Je joue régulièrement en club." },
  { id: "avance", label: "Avancé", desc: "Je suis en compétition niveau régional." },
  { id: "elite", label: "Elite", desc: "Niveau national ou professionnel." },
];

const pratiques = [
  { id: "ballon", label: "ROUTINE PERSO", desc: "Session d'entraînement au tir." },
  { id: "libre", label: "PRÉPA LIBRE", desc: "Entraînement individuel. Focus technique." },
  { id: "match", label: "PRÉPA MATCH", desc: "Situation de jeu. Intensité max." },
];

const postes = [
  { id: "guard", label: "Meneur / Arrière", desc: "Tir en mouvement, pull-up." },
  { id: "forward", label: "Ailier", desc: "Catch & Shoot, polyvalence." },
  { id: "center", label: "Intérieur", desc: "Tir de près, lancers francs." },
];

const objectifs = [
  { id: "regularite", label: "Régularité", desc: "Être constant match après match." },
  { id: "vitesse", label: "Vitesse", desc: "Shooter plus vite en situation de jeu." },
  { id: "portee", label: "Distance", desc: "Allonger ta zone de tir efficace." },
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [selectedPratique, setSelectedPratique] = useState<string | null>(null);
  const [selectedPoste, setSelectedPoste] = useState<string | null>(null);
  const [selectedObjectif, setSelectedObjectif] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleNext = async () => {
    if (step === 7) {
      if (!name.trim()) return;

      setIsLoading(true);

      try {
        if (user) {
          await updateUserProfile(user.id, {
            niveau: selectedNiveau || undefined,
            practice_type: selectedPratique || undefined,
            position: selectedPoste || undefined,
            objective: selectedObjectif || undefined,
            display_name: name.trim(),
          });

          await activateTrial(user.id);
        }

        const posLabel = postes.find(p => p.id === selectedPoste)?.label || selectedPoste || "";
        const objLabel = objectifs.find(o => o.id === selectedObjectif)?.label || selectedObjectif || "";
        localStorage.setItem("s3_user_pseudo", name.trim());
        localStorage.setItem("s3_user_position", posLabel);
        localStorage.setItem("s3_user_goal", objLabel);

        let p = 0;
        const interval = setInterval(() => {
          p += 2;
          setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => onComplete(name.trim(), selectedPoste || "", selectedObjectif || ""), 300);
          }
        }, 40);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setIsLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const canNext =
    step < 3 ||
    (step === 3 && selectedNiveau) ||
    (step === 4 && selectedPratique) ||
    (step === 5 && selectedPoste) ||
    (step === 6 && selectedObjectif) ||
    (step === 7 && name.trim().length > 0);

  if (isLoading) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center bg-background px-8 gap-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-orange"
            style={{ background: "linear-gradient(135deg, hsl(18 80% 30%), hsl(18 100% 40%))" }}>
            <span className="font-sport text-3xl text-foreground">S3</span>
          </div>
          <h2 className="font-sport text-4xl text-foreground">CALIBRAGE DE L'IA</h2>
          <p className="font-body text-sm text-muted-foreground mt-2">Analyse de ton profil biomécanique...</p>
        </div>
        <div className="w-full">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, hsl(18 100% 40%), hsl(18 100% 60%))",
                boxShadow: "0 0 10px hsl(18 100% 50% / 0.6)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-body text-xs text-muted-foreground">Initialisation...</span>
            <span className="font-body text-xs text-primary">{progress}%</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          {["Modèle Guard chargé", "Paramètres biomécaniques OK", "Profil IA prêt"].map((line, i) => (
            progress > i * 33 + 10 && (
              <p key={i} className="terminal-text animate-terminal">{`> ${line}`}</p>
            )
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container flex flex-col bg-background">
      {/* Header - only show on profiling steps */}
      {step >= 3 && (
        <div className="flex items-center justify-between px-6 pt-12 pb-6">
          {step > 3 ? (
            <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          {/* Progress dots */}
          <div className="flex gap-2">
            {[3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className="rounded-full transition-all duration-300"
                style={{
                  width: s === step ? "24px" : "8px",
                  height: "8px",
                  background: s <= step ? "hsl(var(--primary))" : "hsl(var(--muted))",
                }}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Intro Slides (0-2) */}
          {step <= 2 && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full text-center"
            >
              {(() => {
                const slide = introSlides[step];
                const Icon = slide.icon;
                return (
                  <div className="space-y-8">
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, hsl(18 80% 30% / 0.2), hsl(18 100% 40% / 0.3))" }}>
                        <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h1 className="font-sport text-4xl text-foreground leading-tight">
                        {slide.title}
                      </h1>
                      <p className="font-sport text-xl text-primary">
                        {slide.subtitle}
                      </p>
                      <p className="font-body text-base text-muted-foreground max-w-sm mx-auto">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Profiling Steps (3-7) */}
          {step === 3 && (
            <motion.div
              key="niveau"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h1 className="font-sport text-5xl text-foreground mb-2 leading-tight">
                QUEL EST TON NIVEAU ?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8">
                L'IA adaptera la difficulté de ses exercices.
              </p>
              <div className="space-y-3">
                {niveaux.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNiveau(n.id)}
                    className={`selection-card flex items-center justify-between ${selectedNiveau === n.id ? "selected" : ""}`}
                  >
                    <div>
                      <p className="font-body font-bold text-foreground">{n.label}</p>
                      <p className="font-body text-sm text-muted-foreground">{n.desc}</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${selectedNiveau === n.id ? "bg-primary" : "bg-muted"}`}>
                      {selectedNiveau === n.id && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="pratique"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h1 className="font-sport text-5xl text-foreground mb-2 leading-tight">
                TYPE DE PRATIQUE ?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8">
                Comment tu vas utiliser Shoot3 aujourd'hui ?
              </p>
              <div className="space-y-3">
                {pratiques.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPratique(p.id)}
                    className={`selection-card flex items-center justify-between ${selectedPratique === p.id ? "selected" : ""}`}
                  >
                    <div>
                      <p className="font-body font-bold text-foreground">{p.label}</p>
                      <p className="font-body text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${selectedPratique === p.id ? "bg-primary" : "bg-muted"}`}>
                      {selectedPratique === p.id && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="poste"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h1 className="font-sport text-5xl text-foreground mb-2 leading-tight">
                QUEL EST TON POSTE ?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8">
                L'IA calibrera ses modèles biomécaniques selon ta position sur le terrain.
              </p>
              <div className="space-y-3">
                {postes.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPoste(p.id)}
                    className={`selection-card flex items-center justify-between ${selectedPoste === p.id ? "selected" : ""}`}
                  >
                    <div>
                      <p className="font-body font-bold text-foreground">{p.label}</p>
                      <p className="font-body text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${selectedPoste === p.id ? "bg-primary" : "bg-muted"}`}>
                      {selectedPoste === p.id && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="objectif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h1 className="font-sport text-5xl text-foreground mb-2 leading-tight">
                TON OBJECTIF N°1 ?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8">
                L'IA adaptera son programme d'entraînement à ton ambition principale.
              </p>
              <div className="space-y-3">
                {objectifs.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedObjectif(o.id)}
                    className={`selection-card flex items-center justify-between ${selectedObjectif === o.id ? "selected" : ""}`}
                  >
                    <div>
                      <p className="font-body font-bold text-foreground">{o.label}</p>
                      <p className="font-body text-sm text-muted-foreground">{o.desc}</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${selectedObjectif === o.id ? "bg-primary" : "bg-muted"}`}>
                      {selectedObjectif === o.id && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h1 className="font-sport text-5xl text-foreground mb-2 leading-tight">
                COMMENT ON T'APPELLE ?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-10">
                Ton coach IA utilisera ce nom dans chaque session.
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ton prénom ou pseudo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-transparent border-b-2 border-muted focus:border-primary outline-none text-foreground font-sport text-4xl pb-3 placeholder:text-muted-foreground/40 transition-colors"
                  style={{ caretColor: "hsl(var(--primary))" }}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 pt-6">
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {step <= 2 ? "CONTINUER" : step === 7 ? "ACTIVER MON ESSAI GRATUIT" : "SUIVANT"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
