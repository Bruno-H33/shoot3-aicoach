import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Share2, CircleCheck as CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ProgressComparisonResultProps {
  open: boolean;
  onClose: () => void;
  onShareToParents: () => void;
  onSimulateElite: () => void;
}

export const ProgressComparisonResult = ({
  open,
  onClose,
  onShareToParents,
  onSimulateElite,
}: ProgressComparisonResultProps) => {
  const handleShare = () => {
    navigator.clipboard.writeText('https://shoot3.app/parent-report/share-123');
    toast.success('Lien copié dans le presse-papier !');
    onShareToParents();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-gray-900 to-black border-2 border-green-600/50">
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <h2 className="font-sport text-3xl text-foreground mb-2">
              COMPARAISON J1 VS J7
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Résultats de ta progression
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-green-600/10 rounded-lg p-4 border border-green-600/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm text-muted-foreground">Angle du Coude</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-sport text-3xl text-green-600">+12%</span>
                <span className="font-body text-sm text-muted-foreground">amélioré</span>
              </div>
            </div>

            <div className="bg-green-600/10 rounded-lg p-4 border border-green-600/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm text-muted-foreground">Alignement Poignet</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-sport text-3xl text-green-600">+8%</span>
                <span className="font-body text-sm text-muted-foreground">amélioré</span>
              </div>
            </div>

            <div className="bg-green-600/10 rounded-lg p-4 border border-green-600/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm text-muted-foreground">Fluidité du Geste</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-sport text-3xl text-green-600">+15%</span>
                <span className="font-body text-sm text-muted-foreground">amélioré</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-6 space-y-3">
            <p className="font-sport text-lg text-foreground">
              TU AS LA PREUVE QUE ÇA FONCTIONNE
            </p>
            <p className="font-body text-sm text-muted-foreground">
              Pour ancrer cette mémoire musculaire, il te faut le Bootcamp 90 jours.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleShare}
              className="w-full h-14 font-sport text-lg bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/50 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              PARTAGER MON BILAN AUX PARENTS
            </Button>

            <Button
              onClick={onSimulateElite}
              variant="outline"
              className="w-full h-10 font-body text-xs border-muted-foreground/30 hover:bg-muted-foreground/10"
            >
              Simuler l'achat Parent (Dev)
            </Button>
          </div>

          <button
            onClick={onClose}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
