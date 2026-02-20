import { useState } from "react";
import { Lock, Search, FileText, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaywallModalProps {
  userName: string;
  onClose: () => void;
  onRegistered: () => void;
  isRegistered: boolean;
}

const RAPPORT_PRICE_ID = "price_1T32lwEznnJeH6em5ubXNs97";

const PaywallModal = ({ userName, onClose, onRegistered, isRegistered }: PaywallModalProps) => {
  const [buyLoading, setBuyLoading] = useState(false);

  // User is already authenticated at this point, so we show the results directly
  // and call onRegistered to mark test as completed
  useState(() => {
    if (!isRegistered) {
      onRegistered();
    }
  });

  const handleBuyReport = async () => {
    setBuyLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: RAPPORT_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de paiement");
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto max-h-[92dvh] animate-fade-in-up"
        style={{
          background: "rgba(14,10,8,0.97)",
          border: "1.5px solid hsl(var(--neon-orange))",
          borderBottom: "none",
          boxShadow: "0 -10px 60px hsl(18 100% 50% / 0.2)",
        }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="px-6 py-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-4 glow-green">
              <Check className="w-8 h-8 text-success-foreground" />
            </div>
            <h2 className="font-sport text-4xl text-foreground">ANALYSE TERMINÉE</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Search className="w-4 h-4 text-primary" />
              <span className="font-body text-sm text-primary font-bold tracking-widest uppercase">
                2 Erreurs Majeures Détectées
              </span>
            </div>
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
            <button
              onClick={handleBuyReport}
              disabled={buyLoading}
              className="w-full bg-foreground text-background font-sport text-lg tracking-widest py-3 rounded-xl transition-all active:scale-98 disabled:opacity-50"
            >
              {buyLoading ? "REDIRECTION..." : "ACHETER LE RAPPORT - 9.99€"}
            </button>
          </div>

          <button onClick={onClose} className="font-body text-sm text-muted-foreground underline text-center w-full">
            Fermer et retourner au Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
