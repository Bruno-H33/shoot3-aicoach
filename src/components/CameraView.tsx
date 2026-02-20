import { useState, useEffect, useRef } from "react";
import { X, SwitchCamera, Play, Square } from "lucide-react";

interface CameraViewProps {
  onComplete: () => void;
  onClose: () => void;
}

type Phase = "idle" | "countdown" | "recording" | "processing";

const COUNTDOWN = 3;
const RECORDING_TIME = 30;

const apiKey = "AIzaSyBNTW9Najj6o0O7ldyUiP4rpBF8r6mfqpI";

const pcmToWav = (pcmData: ArrayBuffer, sampleRate: number): Blob => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (v: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) v.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcmData.byteLength, true);
  return new Blob([header, pcmData], { type: "audio/wav" });
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
};

const playGeminiVoice = async (text: string): Promise<void> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } } },
    },
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const audioData = data.candidates[0].content.parts[0].inlineData.data;
      const arrayBuffer = base64ToArrayBuffer(audioData);
      const wavBlob = pcmToWav(arrayBuffer, 24000);
      const audioUrl = URL.createObjectURL(wavBlob);
      const audio = new Audio(audioUrl);
      return new Promise((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
        audio.onerror = () => resolve();
        audio.play();
      });
    }
  } catch (e) {
    console.error("Gemini TTS Error", e);
  }
};

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

  // Countdown logic — timer-driven, Gemini TTS fires once at the end
  useEffect(() => {
    if (phase !== "countdown") return;

    const runCountdown = async (n: number) => {
      if (n <= 0) {
        setCountdown(0);
        await playGeminiVoice("C'est parti !");
        setPhase("recording");
        setTimeLeft(RECORDING_TIME);
        return;
      }
      setCountdown(n);
      // Short visual delay between numbers, no TTS for each digit
      await new Promise((res) => setTimeout(res, 950));
      runCountdown(n - 1);
    };

    runCountdown(COUNTDOWN);
  }, [phase]);

  // Recording logic
  useEffect(() => {
    if (phase !== "recording") return;
    if (timeLeft === 15) {
      setShowFeedback(true);
      playGeminiVoice("Attention ! Ton coude s'ouvre trop vers l'extérieur.");
    }
    if (timeLeft <= 0) {
      playGeminiVoice("Terminé, analyse en cours.");
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
