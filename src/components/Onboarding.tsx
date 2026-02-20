import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const postes = [
  { id: "guard", label: "Meneur / Arrière (Guard)", desc: "Tir en mouvement, pull-up." },
  { id: "forward", label: "Ailier (Forward)", desc: "Catch & Shoot, polyvalence." },
  { id: "center", label: "Intérieur (Big Man)", desc: "Tir de près, lancers francs." },
];

const objectifs = [
  { id: "regularite", label: "Régularité", desc: "Être constant match après match." },
  { id: "vitesse", label: "Vitesse", desc: "Shooter plus vite en situation de jeu." },
  { id: "portee", label: "Distance", desc: "Allonger ta zone de tir efficace." },
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [selectedPoste, setSelectedPoste] = useState<string | null>(null);
  const [selectedObjectif, setSelectedObjectif] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleNext = () => {
    if (step === 3) {
      if (!name.trim()) return;
      setIsLoading(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 2;
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(name.trim()), 300);
        }
      }, 40);
    } else {
      setStep(step + 1);
    }
  };

  const canNext =
    (step === 1 && selectedPoste) ||
    (step === 2 && selectedObjectif) ||
    (step === 3 && name.trim().length > 0);

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
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        {/* Progress dots */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
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

      {/* Content */}
      <div className="flex-1 px-6">
        {step === 1 && (
          <div className="animate-fade-in-up">
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
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
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
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
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
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 pt-6">
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          SUIVANT
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
