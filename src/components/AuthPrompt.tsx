import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface AuthPromptProps {
  userName: string;
}

const AuthPrompt = ({ userName }: AuthPromptProps) => {
  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erreur de connexion Google");
  };

  const handleAppleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erreur de connexion Apple");
  };

  return (
    <div className="mobile-container flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 border-2 border-primary rounded-3xl m-4" style={{ boxShadow: "0 0 80px hsl(var(--primary) / 0.3)" }} />

      <div className="relative z-10 w-full max-w-md">
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
          <div className="rounded-2xl p-5 border border-white/10 relative" style={{ background: "rgba(30, 40, 60, 0.8)" }}>
            <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-background/90 border border-white/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <div className="blur-sm opacity-40 pointer-events-none select-none">
              <p className="font-body text-sm text-foreground/80 leading-relaxed mb-1">
                APERÇU IA :
              </p>
              <p className="font-body text-sm text-foreground leading-relaxed">
                {userName}, ton Coude s'ouvre trop vers l'extérieur (112°). Ta cible idéale est 90°. Cela désaxe ta trajectoire vers la gauche.
              </p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="font-body text-xs text-muted-foreground">
                  Score de stabilité : <span className="font-sport text-foreground">65/100</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="font-body text-sm text-center text-muted-foreground mb-6 leading-relaxed">
          Crée un compte gratuit pour sauvegarder ton profil et voir le diagnostic de l'IA.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6 bg-white text-black font-body font-semibold text-base transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6 bg-black border border-white/20 text-white font-body font-semibold text-base transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continuer avec Apple
          </button>
        </div>

        <p className="font-body text-xs text-center text-muted-foreground">
          Pas maintenant ? Tu vas perdre cette analyse.
        </p>
      </div>
    </div>
  );
};

export default AuthPrompt;
