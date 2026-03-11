import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";

interface StarterPackPaywallProps {
  open: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export const StarterPackPaywall = ({ open, onClose, onPurchase }: StarterPackPaywallProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-gray-900 to-black border-2 border-primary/50">
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Zap className="w-10 h-10 text-primary" />
          </div>

          <div>
            <h2 className="font-sport text-3xl text-foreground mb-2">
              STARTER PACK
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Débloque ton rapport complet + 7 jours d'exercices ciblés
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">✓</span>
              </div>
              <p className="font-body text-sm text-foreground text-left">
                Analyse complète de tes 5 erreurs biomécaniques
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">✓</span>
              </div>
              <p className="font-body text-sm text-foreground text-left">
                7 jours d'accès aux exercices correctifs vidéo
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">✓</span>
              </div>
              <p className="font-body text-sm text-foreground text-left">
                Test de progression au jour 7
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-sport text-2xl text-muted-foreground line-through">19.99€</span>
              <span className="font-sport text-5xl text-primary">3.99€</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Offre de lancement limitée
            </p>
          </div>

          <Button
            onClick={onPurchase}
            className="w-full h-14 font-sport text-lg bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/50"
          >
            DÉBLOQUER MON RAPPORT - 3.99€
          </Button>

          <button
            onClick={onClose}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Plus tard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
