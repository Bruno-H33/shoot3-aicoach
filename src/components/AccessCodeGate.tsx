import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccessCodeGateProps {
  onValidated: () => void;
}

const AccessCodeGate = ({ onValidated }: AccessCodeGateProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("validate-access-code", {
        body: { code: code.trim() },
      });

      if (fnError) throw fnError;

      if (data?.valid) {
        toast.success(`Accès validé ! ${data.remaining} test${data.remaining > 1 ? "s" : ""} restant${data.remaining > 1 ? "s" : ""}`);
        sessionStorage.setItem("s3_access_granted", "true");
        sessionStorage.setItem("s3_access_code", code.trim().toUpperCase());
        onValidated();
      } else {
        setError(data?.error || "Code invalide");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container flex flex-col items-center justify-center bg-background px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-orange"
          style={{ background: "linear-gradient(135deg, hsl(18 80% 30%), hsl(18 100% 40%))" }}
        >
          <span className="font-sport text-3xl text-foreground">S3</span>
        </div>
        <h1 className="font-sport text-4xl text-foreground">
          SHOOT<span className="text-primary">3</span>
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-2">Accès Beta Privée</p>
      </div>

      {/* Code input */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            type="text"
            placeholder="Code d'accès"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            maxLength={30}
            className="w-full rounded-2xl bg-card border border-border px-5 py-4 font-sport text-xl text-center text-foreground placeholder:text-muted-foreground tracking-[0.2em] focus:outline-none focus:border-primary transition-colors uppercase"
          />
          {error && (
            <p className="font-body text-xs text-destructive mt-2 text-center">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "VÉRIFICATION..." : "ENTRER"}
        </button>
      </form>

      <p className="font-body text-xs text-muted-foreground mt-8 text-center">
        Demande ton code d'accès à l'équipe Shoot3.
      </p>
    </div>
  );
};

export default AccessCodeGate;
