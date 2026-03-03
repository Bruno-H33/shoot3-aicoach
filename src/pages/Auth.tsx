import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!isLogin && !acceptedPrivacy) {
      toast.error("Tu dois accepter la politique de confidentialité pour t'inscrire.");
      setSubmitting(false);
      return;
    }
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Compte créé ! Tu peux maintenant te connecter.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'authentification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="font-sport text-2xl text-primary-foreground">S3</span>
          </div>
          <h1 className="font-sport text-4xl text-foreground">SHOOT<span className="text-primary">3</span></h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Elite AI Coach</p>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="w-full space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl bg-card border border-border px-5 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-2xl bg-card border border-border px-5 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />

          {/* Privacy consent checkbox (signup only) */}
          {!isLogin && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border accent-primary flex-shrink-0"
              />
              <span className="font-body text-xs text-muted-foreground leading-relaxed">
                J'accepte la{" "}
                <Link to="/privacy" className="text-primary underline" target="_blank">
                  politique de confidentialité
                </Link>{" "}
                et le traitement de mes données personnelles conformément au RGPD.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={submitting || (!isLogin && !acceptedPrivacy)}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "..." : isLogin ? "SE CONNECTER" : "S'INSCRIRE"}
          </button>
        </form>

        <p className="font-body text-sm text-muted-foreground mt-6">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold"
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
