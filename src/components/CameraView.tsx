import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, SwitchCamera, Play, Square, Smartphone, Sun, MapPin, Timer, ChevronRight } from "lucide-react";

interface CameraViewProps {
  onComplete: (issues?: ShotIssue[], frames?: string[]) => void;
  onClose: () => void;
}

type Phase = "idle" | "countdown" | "recording" | "processing";

interface ShotIssue {
  key: string;
  label: string;
  severity: "low" | "medium" | "high";
  confidence?: number;
  feedback_fr: string;
}

const COUNTDOWN = 3;
const RECORDING_TIME = 30;
const ANALYSIS_INTERVAL = 3000; // analyse toutes les 3 secondes

// --- Buzzer sound (real MP3) ---
const playBuzzer = (): Promise<void> =>
  new Promise((resolve) => {
    const audio = new Audio("/sounds/buzzer.mp3");
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// --- Audio helpers (unchanged) ---
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

const fetchTtsAudio = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const audioData = data.candidates[0].content.parts[0].inlineData.data;
      const arrayBuffer = base64ToArrayBuffer(audioData);
      const wavBlob = pcmToWav(arrayBuffer, 24000);
      return URL.createObjectURL(wavBlob);
    }
  } catch (e) {
    console.error("Gemini TTS error", e);
  }
  return null;
};

const playAudioUrl = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });

// --- Frame capture helper ---
// For live analysis: lower res for speed. For key frames (report): full HD.
const captureFrame = (video: HTMLVideoElement, quality = 0.8, forReport = false): string | null => {
  const canvas = document.createElement("canvas");
  if (forReport) {
    // Full HD capped at 1920px height, maintain aspect ratio
    const ratio = video.videoWidth / video.videoHeight;
    const maxH = 1920;
    const h = Math.min(video.videoHeight, maxH);
    const w = Math.round(h * ratio);
    canvas.width = w;
    canvas.height = h;
  } else {
    // Low-res for live analysis speed
    canvas.width = 480;
    canvas.height = 640;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
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
  const [liveIssues, setLiveIssues] = useState<ShotIssue[]>([]);
  const [terminalProgress, setTerminalProgress] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [showInstructions, setShowInstructions] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const isSpeakingRef = useRef(false);
  const ttsUrlsRef = useRef<string[]>([]);
  const keyFramesRef = useRef<string[]>([]);
  const liveCorrectionsCountRef = useRef(0);
  const guaranteedFiredRef = useRef(false);
  const timeLeftRef = useRef(RECORDING_TIME);

  // Pre-fetch static voice lines (go + done)
  const goCacheRef = useRef<string | null>(null);
  const doneCacheRef = useRef<string | null>(null);

  useEffect(() => {
    fetchTtsAudio("C'est parti !").then((u) => { goCacheRef.current = u; });
    fetchTtsAudio("Terminé, analyse en cours.").then((u) => { doneCacheRef.current = u; });
    return () => {
      if (goCacheRef.current) URL.revokeObjectURL(goCacheRef.current);
      if (doneCacheRef.current) URL.revokeObjectURL(doneCacheRef.current);
      ttsUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // Request fullscreen on mount for true immersive experience
  useEffect(() => {
    const el = document.documentElement;
    const requestFs = el.requestFullscreen
      ?? (el as any).webkitRequestFullscreen
      ?? (el as any).msRequestFullscreen;
    if (requestFs) {
      requestFs.call(el).catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Camera start
  useEffect(() => {
    const startCamera = async () => {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(false);
      } catch {
        setCameraError(true);
      }
    };
    startCamera();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [facingMode]);

  // --- Speak feedback (TTS), non-blocking queue ---
  const speakFeedback = useCallback(async (text: string) => {
    if (isSpeakingRef.current) return; // skip if already speaking
    isSpeakingRef.current = true;
    const url = await fetchTtsAudio(text);
    if (url) {
      ttsUrlsRef.current.push(url);
      await playAudioUrl(url);
    }
    isSpeakingRef.current = false;
  }, []);

  // --- Periodic AI analysis during recording (with time control) ---
  useEffect(() => {
    if (phase !== "recording") return;

    // Reset counters at start of recording
    liveCorrectionsCountRef.current = 0;
    guaranteedFiredRef.current = false;

    const analyze = async () => {
      if (!videoRef.current) return;

      // Save key frames in full HD for the report (max 10) regardless of time window
      if (keyFramesRef.current.length < 10) {
        const hdFrame = captureFrame(videoRef.current, 0.8, true);
        if (hdFrame) keyFramesRef.current.push(hdFrame);
      }

      // RULE: Max 2 live corrections per session
      if (liveCorrectionsCountRef.current >= 2) return;

      const frame = captureFrame(videoRef.current, 0.6, false);
      if (!frame) return;

      try {
        const controller = new AbortController();
        analysisAbortRef.current = controller;

        const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-shot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frames: [frame],
            context: "live",
            user_position: localStorage.getItem("s3_user_position") || "",
            user_goal: localStorage.getItem("s3_user_goal") || "",
          }),
          signal: controller.signal,
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.issues && data.issues.length > 0) {
          // RULE: Block audio playback if timeLeft <= 5
          if (liveCorrectionsCountRef.current >= 2) return;

          setLiveIssues(data.issues);
          const sorted = [...data.issues].sort((a, b) => {
            const sev = { high: 3, medium: 2, low: 1 };
            return sev[b.severity] - sev[a.severity];
          });

          // Only speak if within the 29s-5s window
          const currentTimeLeft = timeLeftRef.current;
          if (currentTimeLeft > 5 && currentTimeLeft <= 29) {
            speakFeedback(sorted[0].feedback_fr);
            liveCorrectionsCountRef.current += 1;
          }
        } else if (data.overall_score >= 0) {
          setLiveIssues([]);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error("Analysis error", e);
      }
    };

    // First analysis after 3s, then every ANALYSIS_INTERVAL
    const initial = setTimeout(analyze, 3000);
    const interval = setInterval(analyze, ANALYSIS_INTERVAL);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      analysisAbortRef.current?.abort();
    };
  }, [phase, speakFeedback]);

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    const runCountdown = async (n: number) => {
      if (n <= 0) {
        setCountdown(0);
        if (goCacheRef.current) await playAudioUrl(goCacheRef.current);
        setPhase("recording");
        setTimeLeft(RECORDING_TIME);
        return;
      }
      setCountdown(n);
      await new Promise((res) => setTimeout(res, 950));
      runCountdown(n - 1);
    };
    runCountdown(COUNTDOWN);
  }, [phase]);

  // Recording timer
  useEffect(() => {
    if (phase !== "recording") return;
    timeLeftRef.current = timeLeft;

    if (timeLeft <= 0) {
      // Play buzzer first, then TTS "Terminé"
      playBuzzer().then(() => {
        if (doneCacheRef.current) playAudioUrl(doneCacheRef.current);
      });
      setPhase("processing");
      setTerminalProgress(0);
      return;
    }

    // GUARANTEED MINIMUM: If at 10s remaining and 0 corrections, fire a fallback
    if (timeLeft === 10 && liveCorrectionsCountRef.current === 0 && !guaranteedFiredRef.current) {
      guaranteedFiredRef.current = true;
      const fallbackPhrase = "Plie plus tes genoux !";
      setLiveIssues([{ key: "stiff_legs", label: "Jambes raides", severity: "medium", feedback_fr: fallbackPhrase }]);
      speakFeedback(fallbackPhrase);
      liveCorrectionsCountRef.current += 1;
    }

    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, speakFeedback]);

  // Terminal animation + final diagnostic analysis
  useEffect(() => {
    if (phase !== "processing") return;
    let cancelled = false;
    const finalResultRef = { current: null as any[] | null };

    // Launch final diagnostic analysis with all key frames in parallel
    const runFinalAnalysis = async () => {
      const frames = keyFramesRef.current;
      if (frames.length === 0) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-shot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frames,
            context: "diagnostic",
            user_position: localStorage.getItem("s3_user_position") || "",
            user_goal: localStorage.getItem("s3_user_goal") || "",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.issues && !cancelled) {
            finalResultRef.current = data.issues;
          }
        }
      } catch (e) {
        console.error("Final diagnostic analysis error", e);
      }
    };
    runFinalAnalysis();

    const interval = setInterval(() => {
      setTerminalProgress((p) => {
        if (p >= terminalLines.length) {
          clearInterval(interval);
          const frames = keyFramesRef.current.length > 0 ? [...keyFramesRef.current] : undefined;
          // Use final diagnostic result if available, otherwise fall back to live issues
          const issues = finalResultRef.current || (liveIssues.length > 0 ? liveIssues : undefined);
          setTimeout(() => onComplete(issues && issues.length > 0 ? issues : undefined, frames), 500);
          return p;
        }
        return p + 1;
      });
    }, 280);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase, onComplete]);

  const handleRecord = () => {
    if (phase === "idle") {
      keyFramesRef.current = [];
      setPhase("countdown");
      setLiveIssues([]);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const severityColor = (s: string) => {
    if (s === "high") return "bg-destructive";
    if (s === "medium") return "bg-orange-500";
    return "bg-yellow-500";
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', margin: 0, padding: 0 }}>
      {!cameraError ? (
        <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${showInstructions ? 'blur-sm scale-105' : ''}`} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      )}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top badge */}
        <div className="flex justify-center pt-[max(0.75rem,env(safe-area-inset-top))] landscape:pt-2">
          <div className="glass px-6 py-2 rounded-full border border-white/15">
            <span className="font-body text-xs tracking-[0.3em] text-foreground uppercase">
              {phase === "recording" ? "Analyse IA en direct" : "Test de Niveau Gratuit"}
            </span>
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-20 landscape:top-10 left-8 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl" />
        <div className="absolute top-20 landscape:top-10 right-8 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr" />
        <div className="absolute bottom-28 landscape:bottom-14 left-8 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl" />
        <div className="absolute bottom-28 landscape:bottom-14 right-8 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br" />

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
          <div className="absolute top-24 landscape:top-12 left-0 right-0 flex justify-center">
            <div className="glass px-6 py-2 landscape:py-1 rounded-2xl border border-primary/30">
              <span className="font-sport text-5xl landscape:text-3xl text-primary">{String(timeLeft).padStart(2, "0")}s</span>
            </div>
          </div>
        )}

        {/* Live AI Feedback — dynamic from real analysis */}
        {phase === "recording" && liveIssues.length > 0 && (
          <div className="absolute top-44 landscape:top-20 left-6 right-6 landscape:left-[20%] landscape:right-[20%] space-y-2 max-h-[40vh] overflow-y-auto">
            {liveIssues.map((issue) => (
              <div
                key={issue.key}
                className="rounded-2xl p-3 landscape:p-2 animate-fade-in-up border border-destructive/40"
                style={{ background: "rgba(220, 38, 38, 0.15)", backdropFilter: "blur(16px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${severityColor(issue.severity)} animate-pulse flex-shrink-0`} />
                  <div>
                    <p className="font-body text-xs text-destructive font-bold tracking-widest uppercase">
                      ⚡ Feedback Live IA
                    </p>
                    <p className="font-body text-sm landscape:text-xs text-foreground mt-1">
                      {issue.feedback_fr}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Bottom controls — hidden during instructions */}
        {phase !== "processing" && !showInstructions && (
          <div className="absolute bottom-6 landscape:bottom-2 left-0 right-0 flex items-center justify-center gap-10 animate-fade-in">
            <button onClick={onClose} className="w-14 h-14 rounded-full glass flex items-center justify-center border border-white/15">
              <X className="w-6 h-6 text-foreground" />
            </button>
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
            <button onClick={handleFlipCamera} className="w-14 h-14 rounded-full glass flex items-center justify-center border border-white/15">
              <SwitchCamera className="w-6 h-6 text-foreground" />
            </button>
          </div>
        )}

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass rounded-3xl border border-primary/40 mx-5 max-w-md w-full p-6 space-y-6" style={{ boxShadow: '0 0 40px hsl(var(--primary) / 0.15)' }}>
              {/* Title */}
              <div className="text-center space-y-1">
                <p className="font-sport text-3xl tracking-wider text-foreground">PRÉPARATION DU TEST</p>
                <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">Les 4 règles d'or</p>
              </div>

              {/* Rules */}
              <div className="space-y-4">
                {[
                  { icon: <Smartphone className="w-5 h-5 text-primary" />, title: "Le Cadre", desc: "Pose ton téléphone de façon à voir le joueur de la tête aux pieds ET le panier." },
                  { icon: <Sun className="w-5 h-5 text-primary" />, title: "La Lumière", desc: "Évite le contre-jour. Ne filme pas face au soleil." },
                  { icon: <MapPin className="w-5 h-5 text-primary" />, title: "Le Repère", desc: "Prends une position de tir fixe devant le panier." },
                  { icon: <Timer className="w-5 h-5 text-primary" />, title: "L'Action", desc: "Appuie sur Play et va te placer (tu auras 5 sec de mise en place)." },
                ].map((rule) => (
                  <div key={rule.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl glass border border-primary/30 flex items-center justify-center flex-shrink-0">
                      {rule.icon}
                    </div>
                    <div>
                      <p className="font-body text-sm font-bold text-foreground">{rule.title}</p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowInstructions(false)}
                className="btn-primary w-full py-4 rounded-2xl font-sport text-lg tracking-widest uppercase flex items-center justify-center gap-2"
              >
                J'AI COMPRIS
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default CameraView;
