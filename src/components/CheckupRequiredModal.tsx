import { X, Target, TrendingUp } from "lucide-react";

interface CheckupRequiredModalProps {
  onStartCheckup: () => void;
  onClose?: () => void;
}

const CheckupRequiredModal = ({ onStartCheckup, onClose }: CheckupRequiredModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md px-5">
      <div
        className="glass rounded-3xl border border-primary/40 max-w-md w-full p-6 space-y-6 relative"
        style={{ boxShadow: '0 0 60px hsl(var(--primary) / 0.25)' }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 border border-white/20 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center mb-4" style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.3)" }}>
            <Target className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-sport text-3xl text-foreground tracking-wider">
            CHECK-UP REQUIS
          </h1>

          <p className="font-body text-base text-muted-foreground leading-relaxed">
            Tes 7 jours d'essai touchent à leur fin.
          </p>

          <div className="rounded-2xl p-5 border border-primary/30" style={{ background: "rgba(30, 15, 5, 0.8)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-sport text-lg text-foreground">Test de Progression</p>
                <p className="font-body text-xs text-muted-foreground">Mesure tes progrès en 7 jours</p>
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground text-left leading-relaxed">
              Refais un test de tir pour comparer ton niveau J-1 vs J-7 et débloquer ton rapport de progression personnalisé.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={onStartCheckup}
              className="w-full py-4 rounded-2xl font-sport text-lg tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-primary-foreground"
              style={{
                background: "linear-gradient(135deg, hsl(18 90% 40%), hsl(18 100% 50%))",
                boxShadow: "0 4px 30px hsl(18 100% 50% / 0.35)",
              }}
            >
              DÉMARRER LE CHECK-UP
            </button>

            <p className="font-body text-xs text-muted-foreground">
              Durée : 30 secondes · Test final gratuit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckupRequiredModal;
