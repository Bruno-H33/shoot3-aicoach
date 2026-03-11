import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lock } from "lucide-react";

interface Day7LockModalProps {
  open: boolean;
  onStartTest: () => void;
}

export const Day7LockModal = ({ open, onStartTest }: Day7LockModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md bg-gradient-to-b from-gray-900 to-black border-2 border-red-600/50"
        hideClose
      >
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          <div>
            <h2 className="font-sport text-3xl text-foreground mb-2">
              FIN DU STARTER PACK
            </h2>
            <p className="font-body text-base text-muted-foreground">
              L'IA exige un test de progression pour évaluer tes 7 jours d'entraînement.
            </p>
          </div>

          <div className="bg-red-600/10 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-600" />
              <p className="font-sport text-lg text-foreground">
                TEST OBLIGATOIRE
              </p>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              Compare ton geste J1 vs J7 pour mesurer ta progression réelle
            </p>
          </div>

          <Button
            onClick={onStartTest}
            className="w-full h-14 font-sport text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-600/90 hover:to-orange-600/90 shadow-lg shadow-red-600/50"
          >
            LANCER MON 2ÈME TEST
          </Button>

          <p className="font-body text-xs text-muted-foreground">
            Déblocage des autres fonctions après le test
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
