import { useState } from "react";
import { Lock, Search, FileText, Check } from "lucide-react";

interface PaywallModalProps {
  userName: string;
  onClose: () => void;
  onRegistered: () => void;
  isRegistered: boolean;
}

const PaywallModal = ({ userName, onClose, onRegistered, isRegistered }: PaywallModalProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = (provider: string) => {
    setLoading(provider);
    setTimeout(() => {
      setLoading(null);
      onRegistered();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={isRegistered ? onClose : undefined} />

      {/* Modal */}
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto max-h-[92dvh] animate-fade-in-up"
        style={{
          background: "rgba(14,10,8,0.97)",
          border: "1.5px solid hsl(var(--neon-orange))",
          borderBottom: "none",
          boxShadow: "0 -10px 60px hsl(18 100% 50% / 0.2)",
        }}
      >
        {/* Top orange line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="px-6 py-8 space-y-6">
          {!isRegistered ? (
            <>
              {/* Title */}
              <div className="text-center">
                <h2 className="font-sport text-4xl text-foreground">ANALYSE TERMINÉE</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="font-body text-sm text-primary font-bold tracking-widest uppercase">
                    2 Erreurs Majeures Détectées
                  </span>
                </div>
              </div>

              {/* Teaser blurred box */}
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: "rgba(30, 20, 10, 0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-3">Aperçu IA :</p>
                <div className="relative">
                  <p className="font-body text-sm text-foreground leading-relaxed blur-sm select-none">
                    Ton coude s'ouvre à 112° vers l'extérieur. La cible idéale est 90°. Ce désaxement provoque une déviation vers la gauche sur tes tirs de mi-distance. Score de stabilité : 65/100.
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/80 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA text */}
              <p className="font-body text-sm text-muted-foreground text-center leading-relaxed">
                Crée un compte gratuit pour sauvegarder ton profil et voir le diagnostic de l'IA.
              </p>

              {/* Social login buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleLogin("google")}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 bg-foreground text-background font-body font-bold py-4 rounded-2xl transition-all active:scale-98 disabled:opacity-70"
                >
                  {loading === "google" ? (
                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continuer avec Google
                </button>

                <button
                  onClick={() => handleLogin("apple")}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 border text-foreground font-body font-bold py-4 rounded-2xl transition-all active:scale-98 disabled:opacity-70"
                  style={{ background: "rgba(40,40,40,0.8)", borderColor: "rgba(120,120,120,0.5)" }}
                >
                  {loading === "apple" ? (
                    <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  )}
                  Continuer avec Apple
                </button>
              </div>

              <p className="font-body text-xs text-muted-foreground/60 text-center">
                Pas maintenant ? Tu vas perdre cette analyse.
              </p>
            </>
          ) : (
            /* Post-registration view */
            <>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-4 glow-green">
                  <Check className="w-8 h-8 text-success-foreground" />
                </div>
                <h2 className="font-sport text-4xl text-foreground">COMPTE CRÉÉ</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">Voici le diagnostic de ton tir :</p>
              </div>

              {/* Revealed diagnosis */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(20, 30, 50, 0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="font-body text-base text-foreground leading-relaxed">
                  "{userName}, ton <span className="text-primary font-bold">Coude</span> s'ouvre trop vers l'extérieur (112°). Ta cible idéale est 90°. Cela désaxe ta trajectoire vers la gauche."
                </p>
                <div className="border-t border-white/10 mt-4 pt-4">
                  <p className="font-body text-sm text-muted-foreground">Score de stabilité : <span className="text-foreground font-semibold">65/100</span></p>
                </div>
              </div>

              {/* Upsell */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "linear-gradient(135deg, hsl(18 90% 35%), hsl(18 100% 45%))",
                  boxShadow: "0 4px 30px hsl(18 100% 50% / 0.3)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-foreground" />
                  <span className="font-sport text-xl text-foreground tracking-wider">DÉBLOQUE LA SOLUTION</span>
                </div>
                <p className="font-body text-sm text-foreground/80 mb-4 leading-relaxed">
                  Obtiens le Rapport PDF complet qui inclue le plan d'action pour corriger ça.
                </p>
                <button className="w-full bg-foreground text-background font-sport text-lg tracking-widest py-3 rounded-xl transition-all active:scale-98">
                  ACHETER LE RAPPORT - 9.99€
                </button>
              </div>

              <button onClick={onClose} className="font-body text-sm text-muted-foreground underline text-center w-full">
                Fermer et retourner au Studio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
