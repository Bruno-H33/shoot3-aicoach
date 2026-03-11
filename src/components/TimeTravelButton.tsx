import { useState } from "react";
import { Button } from "./ui/button";
import { Clock, FastForward } from "lucide-react";
import { toast } from "sonner";

interface TimeTravelButtonProps {
  onTimeTravel: () => Promise<void>;
  daysRemaining: number;
  userStatus: string;
}

export const TimeTravelButton = ({ onTimeTravel, daysRemaining, userStatus }: TimeTravelButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onTimeTravel();
      toast.success("Voyage dans le temps effectué ! (+8 jours)", {
        description: "Le statut devrait maintenant être 'locked'",
      });
    } catch (error) {
      toast.error("Erreur lors du voyage dans le temps");
    } finally {
      setLoading(false);
    }
  };

  if (userStatus !== 'trial') return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Button
        onClick={handleClick}
        disabled={loading}
        size="sm"
        variant="outline"
        className="bg-black/80 border-primary/30 text-primary hover:bg-black/90 hover:text-primary backdrop-blur-sm"
      >
        <FastForward className="w-4 h-4 mr-2" />
        Dev: +7 Jours ({daysRemaining}J restants)
      </Button>
    </div>
  );
};
