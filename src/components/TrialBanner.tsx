import { Clock } from "lucide-react";

interface TrialBannerProps {
  daysRemaining: number;
}

export const TrialBanner = ({ daysRemaining }: TrialBannerProps) => {
  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-orange-600 py-3 px-4 flex items-center justify-center gap-2 shadow-lg">
      <Clock className="w-5 h-5 text-white animate-pulse" />
      <p className="font-sport text-sm text-white">
        ESSAI D'URGENCE : J-{daysRemaining} RESTANTS
      </p>
    </div>
  );
};
