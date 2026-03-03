import { useState } from "react";
import { Settings, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeOffset, setTimeOffset] = useState(parseInt(localStorage.getItem("s3_dev_time_offset") || "0"));

  const simulateDay7 = () => {
    const currentOffset = parseInt(localStorage.getItem("s3_dev_time_offset") || "0");
    const offset = currentOffset + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem("s3_dev_time_offset", offset.toString());
    setTimeOffset(offset);
    toast.success("⏰ Simulation : +7 jours activée");
    window.location.reload();
  };

  const resetTime = () => {
    localStorage.setItem("s3_dev_time_offset", "0");
    setTimeOffset(0);
    toast.success("⏰ Temps réinitialisé");
    window.location.reload();
  };

  const currentOffset = timeOffset / (1000 * 60 * 60 * 24);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center z-50 hover:bg-purple-600/30 transition-all"
        title="Dev Tools"
      >
        <Settings className="w-5 h-5 text-purple-400" />
      </button>

      {isOpen && (
        <div className="fixed bottom-40 right-4 w-72 rounded-2xl border border-purple-500/30 bg-background/95 backdrop-blur-lg p-4 z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sport text-lg text-foreground tracking-wider">DEV TOOLS</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <p className="font-body text-xs text-muted-foreground">Simulation Temporelle</p>
              </div>
              <p className="font-sport text-sm text-foreground mb-3">
                Décalage actuel : <span className="text-purple-400">+{currentOffset} jour{currentOffset > 1 ? "s" : ""}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={simulateDay7}
                  className="flex-1 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 font-body text-xs text-purple-300 hover:bg-purple-600/30 transition-all"
                >
                  Avancer à J+7
                </button>
                <button
                  onClick={resetTime}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  title="Reset"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="rounded-xl p-3 bg-white/5 border border-white/10">
              <p className="font-body text-xs text-muted-foreground mb-2">Infos</p>
              <div className="space-y-1">
                <p className="font-body text-[10px] text-foreground/60">
                  • Trial actif vérifié avec offset
                </p>
                <p className="font-body text-[10px] text-foreground/60">
                  • Cliquer plusieurs fois pour avancer plus
                </p>
                <p className="font-body text-[10px] text-foreground/60">
                  • Reload requis après modification
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevTools;
