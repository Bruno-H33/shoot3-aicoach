import { Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SNIPER_PRICE_ID = "price_1T347IRKXHvnBBog16QQGxBo";

interface NoCreditsModalProps {
  onClose: () => void;
}

const NoCreditsModal = ({ onClose }: NoCreditsModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: SNIPER_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erreur de paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-[90%] max-w-[380px] rounded-3xl overflow-hidden animate-fade-in-up"
        style={{
          background: "rgba(14,10,8,0.97)",
          border: "1.5px solid hsl(var(--neon-orange))",
          boxShadow: "0 0 60px hsl(18 100% 50% / 0.2)",
        }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="px-6 py-8 space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h2 className="font-sport text-3xl text-foreground">CRÉDITS ÉPUISÉS</h2>
            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
              Tu as utilisé tes 2 analyses gratuites. Pour continuer à t'entraîner, passe au programme Sniper Elite.
            </p>
          </div>

          <div
            className="rounded-2xl p-4 text-left"
            style={{
              background: "linear-gradient(135deg, hsl(18 90% 35%), hsl(18 100% 45%))",
              boxShadow: "0 4px 30px hsl(18 100% 50% / 0.3)",
            }}
          >
            <p className="font-sport text-lg text-foreground tracking-wider mb-1">PROGRAMME SNIPER ELITE</p>
            <p className="font-body text-xs text-foreground/80 mb-3">
              Bootcamp 30 jours sur-mesure + analyses illimitées
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-foreground text-background font-sport text-base tracking-widest py-3 rounded-xl transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? "REDIRECTION..." : "S'ABONNER — 49.99€"}
            </button>
          </div>

          <button onClick={onClose} className="font-body text-sm text-muted-foreground underline">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoCreditsModal;
