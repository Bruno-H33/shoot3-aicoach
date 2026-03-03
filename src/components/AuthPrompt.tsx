import { useNavigate } from "react-router-dom";

interface AuthPromptProps {
  userName: string;
}

const AuthPrompt = ({ userName }: AuthPromptProps) => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate("/auth");
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
            onClick={handleCreateAccount}
            className="w-full rounded-2xl py-4 px-6 font-sport text-lg tracking-widest uppercase transition-all active:scale-95 text-primary-foreground"
            style={{
              background: "linear-gradient(135deg, hsl(18 90% 40%), hsl(18 100% 50%))",
              boxShadow: "0 4px 30px hsl(18 100% 50% / 0.35)",
            }}
          >
            CRÉER MON COMPTE
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
