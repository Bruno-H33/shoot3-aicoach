import { useState, useEffect } from "react";
import { Play, ChevronRight, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DrillVideo {
  id: string;
  title: string;
  duration: string;
  category: "Neuro" | "Méca";
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const DRILL_VIDEOS: DrillVideo[] = [
  {
    id: "drill-1",
    title: "CORRECTION DU COUDE",
    duration: "8 min",
    category: "Méca",
    description: "Exercice ciblé pour corriger l'ouverture du coude et maintenir un angle optimal à 90°",
    thumbnailUrl: "https://images.pexels.com/photos/1080882/pexels-photo-1080882.jpeg?auto=compress&cs=tinysrgb&w=800",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "drill-2",
    title: "STABILITÉ DU POIGNET",
    duration: "10 min",
    category: "Méca",
    description: "Renforce la stabilité du poignet et améliore le follow-through",
    thumbnailUrl: "https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=800",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "drill-3",
    title: "CONCENTRATION SOUS PRESSION",
    duration: "12 min",
    category: "Neuro",
    description: "Programme neuro-cognitif pour améliorer ta concentration au tir en situation de match",
    thumbnailUrl: "https://images.pexels.com/photos/1080882/pexels-photo-1080882.jpeg?auto=compress&cs=tinysrgb&w=800",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

interface DrillVideosProps {
  filter: "Tout" | "Neuro" | "Méca";
}

const DrillVideos = ({ filter }: DrillVideosProps) => {
  const [selectedVideo, setSelectedVideo] = useState<DrillVideo | null>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [hasUnlockedFull, setHasUnlockedFull] = useState(false);

  const filteredDrills = DRILL_VIDEOS.filter(
    drill => filter === "Tout" || drill.category === filter
  );

  useEffect(() => {
    if (selectedVideo) {
      setVideoTime(0);
      const timer = setInterval(() => {
        setVideoTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedVideo]);

  const handleUnlockFull = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: "price_1T347IRKXHvnBBog16QQGxBo" },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du checkout");
    }
  };

  return (
    <>
      <div className="space-y-3">
        {filteredDrills.map((drill) => (
          <button
            key={drill.id}
            onClick={() => setSelectedVideo(drill)}
            className="w-full rounded-2xl overflow-hidden border border-white/10 text-left active:scale-98 transition-all group"
            style={{ background: "rgba(10,10,10,0.9)" }}
          >
            <div className="flex gap-4 p-4">
              <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                <img
                  src={drill.thumbnailUrl}
                  alt={drill.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-body text-[9px] border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    drill.category === "Neuro"
                      ? "border-primary/50 text-primary"
                      : "border-white/20 text-muted-foreground"
                  }`}>
                    {drill.category}
                  </span>
                  <span className="font-body text-[9px] text-muted-foreground">· {drill.duration}</span>
                </div>
                <h4 className="font-sport text-base text-foreground tracking-wider mb-1 truncate">
                  {drill.title}
                </h4>
                <p className="font-body text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {drill.description}
                </p>
              </div>

              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(10,10,10,0.95)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video bg-white/5">
              <img
                src={selectedVideo.thumbnailUrl}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />

              {/* Preview timer and blur overlay after 30s */}
              {videoTime >= 30 && !hasUnlockedFull && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                  <Lock className="w-12 h-12 text-primary mb-3" />
                  <p className="font-sport text-lg text-foreground mb-2 text-center">
                    PREVIEW TERMINÉ
                  </p>
                  <p className="font-body text-xs text-muted-foreground mb-4 text-center">
                    Débloque l'accès complet pour continuer
                  </p>
                  <button
                    onClick={handleUnlockFull}
                    className="px-6 py-3 rounded-xl font-sport text-sm tracking-wider uppercase text-primary-foreground"
                    style={{
                      background: "linear-gradient(135deg, hsl(18 90% 40%), hsl(18 100% 50%))",
                      boxShadow: "0 4px 20px hsl(18 100% 50% / 0.35)",
                    }}
                  >
                    DÉVERROUILLER · 49.99€
                  </button>
                </div>
              )}

              {/* Timer badge */}
              {videoTime < 30 && !hasUnlockedFull && (
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 border border-orange-400/50">
                  <p className="font-sport text-xs text-orange-400">
                    PREVIEW {30 - videoTime}s
                  </p>
                </div>
              )}

              {videoTime < 30 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-body text-[9px] border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  selectedVideo.category === "Neuro"
                    ? "border-primary/50 text-primary"
                    : "border-white/20 text-muted-foreground"
                }`}>
                  {selectedVideo.category}
                </span>
                <span className="font-body text-[9px] text-muted-foreground">· {selectedVideo.duration}</span>
              </div>

              <h3 className="font-sport text-2xl text-foreground tracking-wider mb-2">
                {selectedVideo.title}
              </h3>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {selectedVideo.description}
              </p>

              <div className="flex gap-2">
                {videoTime < 30 || hasUnlockedFull ? (
                  <button
                    onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                    className="flex-1 btn-primary py-3"
                  >
                    REGARDER LA VIDÉO
                  </button>
                ) : (
                  <button
                    onClick={handleUnlockFull}
                    className="flex-1 py-3 rounded-xl font-sport text-sm tracking-wider uppercase text-primary-foreground flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, hsl(18 90% 40%), hsl(18 100% 50%))",
                      boxShadow: "0 4px 20px hsl(18 100% 50% / 0.35)",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    DÉVERROUILLER TOUT
                  </button>
                )}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-3 rounded-xl border border-white/20 text-muted-foreground font-body text-sm hover:border-white/40 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrillVideos;
