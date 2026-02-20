import { useState, useEffect, useRef } from "react";
import { X, SwitchCamera, Play, Square } from "lucide-react";

interface CameraViewProps {
  onComplete: () => void;
  onClose: () => void;
}

type Phase = "idle" | "countdown" | "recording" | "processing";

const COUNTDOWN = 5;
const RECORDING_TIME = 30;

const terminalLines = [
  "IMPORTATION DES FRAMES...",
  "DÉCOUPE TEMPORELLE EN COURS...",
  "DÉTECTION DES POINTS CLÉS...",
  "ANALYSE BIOMÉCANIQUE...",
  "CALCUL DES ANGLES ARTICULAIRES...",
  "RAPPORT IA EN COURS DE GÉNÉRATION...",
];

const CameraView = ({ onComplete, onClose }: CameraViewProps) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [timeLeft, setTimeLeft] = useState(RECORDING_TIME);
  const [showFeedback, setShowFeedback] = useState(false);
  const [terminalProgress, setTerminalProgress] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Try to start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(false);
      } catch {
        setCameraError(true);
      }
    };
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  // Voice synthesis helper — no cancel() to avoid startup delay
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    utter.rate = 0.95;
    utter.pitch = 1.1;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  };

  // Countdown logic
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      // Cancel previous (the last number) then say go
      window.speechSynthesis.cancel();
      speak("C'est parti !");
      setPhase("recording");
      setTimeLeft(RECORDING_TIME);
      return;
    }
    speak(String(countdown));
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Recording logic
  useEffect(() => {
    if (phase !== "recording") return;
    if (timeLeft === 15) {
      setShowFeedback(true);
      speak("Ton coude part un peu trop à l'extérieur !");
    }
    if (timeLeft <= 0) {
      speak("Analyse terminée. Traitement en cours.");
      setPhase("processing");
      setTerminalProgress(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Terminal animation
  useEffect(() => {
    if (phase !== "processing") return;
    const interval = setInterval(() => {
      setTerminalProgress((p) => {
        if (p >= terminalLines.length) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return p;
        }
        return p + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  const handleRecord = () => {
    if (phase === "idle") {
      // Speak immediately on tap — before any state update to avoid delay
      speak("Mise en place !");
      setCountdown(COUNTDOWN);
      setPhase("countdown");
      setShowFeedback(false);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="mobile-container flex flex-col bg-black relative overflow-hidden h-[100dvh]">
      {/* Camera feed or dark fallback */}
      {!cameraError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top badge */}
        <div className="flex justify-center pt-14">
          <div className="glass px-6 py-2 rounded-full border border-white/15">
            <span className="font-body text-xs tracking-[0.3em] text-foreground uppercase">
              Test de Niveau Gratuit
            </span>
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-28 left-8 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl" />
        <div className="absolute top-28 right-8 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr" />
        <div className="absolute bottom-36 left-8 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl" />
        <div className="absolute bottom-36 right-8 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br" />

        {/* Scanner line */}
        {phase === "recording" && <div className="scanner-line absolute left-0 right-0" />}

        {/* Countdown overlay */}
        {phase === "countdown" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-sport text-2xl text-foreground/60 tracking-widest mb-4">MISE EN PLACE</p>
            <div
              className="font-sport text-[140px] leading-none animate-countdown"
              style={{ color: "hsl(var(--primary))", textShadow: "0 0 60px hsl(18 100% 50% / 0.8)" }}
            >
              {countdown}
            </div>
          </div>
        )}

        {/* Recording timer */}
        {phase === "recording" && (
          <div className="absolute top-32 left-0 right-0 flex justify-center">
            <div className="glass px-6 py-3 rounded-2xl border border-primary/30">
              <span className="font-sport text-5xl text-primary">{String(timeLeft).padStart(2, "0")}s</span>
            </div>
          </div>
        )}

        {/* Live AI Feedback */}
        {showFeedback && phase === "recording" && (
          <div
            className="absolute top-52 left-6 right-6 rounded-2xl p-4 animate-fade-in-up border border-destructive/40"
            style={{ background: "rgba(220, 38, 38, 0.15)", backdropFilter: "blur(16px)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse flex-shrink-0" />
              <div>
                <p className="font-body text-xs text-destructive font-bold tracking-widest uppercase">⚡ Feedback Live IA</p>
                <p className="font-body text-sm text-foreground mt-1">Attention : <span className="text-destructive font-bold">Coude Ouvert !</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Terminal processing */}
        {phase === "processing" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass rounded-3xl p-8 mx-6 w-full border border-white/10">
              <p className="font-sport text-2xl text-foreground mb-6 text-center">ANALYSE EN COURS</p>
              <div className="space-y-2">
                {terminalLines.slice(0, terminalProgress).map((line, i) => (
                  <p key={i} className="terminal-text animate-terminal">
                    {">"} {line}
                  </p>
                ))}
                {terminalProgress < terminalLines.length && (
                  <span className="terminal-text animate-pulse">█</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        {phase !== "processing" && (
          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-10">
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-full glass flex items-center justify-center border border-white/15"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Main record button */}
            <button
              onClick={handleRecord}
              disabled={phase === "countdown" || phase === "recording"}
              className="w-20 h-20 rounded-full border-4 border-foreground flex items-center justify-center transition-all active:scale-95 disabled:opacity-70"
              style={{ background: "hsl(var(--primary))" }}
            >
              {phase === "idle" ? (
                <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
              ) : (
                <Square className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
              )}
            </button>

            <button
              onClick={handleFlipCamera}
              className="w-14 h-14 rounded-full glass flex items-center justify-center border border-white/15"
            >
              <SwitchCamera className="w-6 h-6 text-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;
