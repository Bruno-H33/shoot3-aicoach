import { useState, useRef, useCallback } from "react";
import { Share2 } from "lucide-react";
import { loadLandmarker, POSE_CONNECTIONS, MAJOR_JOINTS, STROKE_COLOR, GLOW_COLOR, LINE_WIDTH, JOINT_RADIUS } from "@/hooks/usePoseLandmarker";

interface ScoreCardProps {
  playerName: string;
  score: number;
  scoreLabel: string;
  bestFrameUrl?: string;
}

const ScoreCard = ({ playerName, score, scoreLabel, bestFrameUrl }: ScoreCardProps) => {
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "hsl(18, 100%, 50%)" : "#f87171";

  const handleShare = useCallback(async () => {
    if (!cardRef.current || generating) return;
    setGenerating(true);

    try {
      // Create canvas directly
      const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 1080;
        tempCanvas.height = 1920;
        const ctx = tempCanvas.getContext("2d")!;

        // Draw background
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, 1080, 1920);

        // Draw gradient accent
        const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
        grad.addColorStop(0, "rgba(255,77,0,0.15)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Draw logo image
        try {
          const logo = new Image();
          logo.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            logo.onload = () => resolve();
            logo.onerror = () => reject();
            logo.src = "/images/logo-s3.png";
          });
          const logoSize = 160;
          ctx.drawImage(logo, (1080 - logoSize) / 2, 40, logoSize, logoSize);
        } catch {
          // Fallback: draw text if logo fails
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 72px 'Bebas Neue', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SHOOT3", 540, 140);
        }

        // "SHOOT3" title below logo
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 64px 'Bebas Neue', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SHOOT3", 540, 260);

        // Subtitle
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "28px 'Inter', sans-serif";
        ctx.fillText("ÉVALUATION IA", 540, 310);

        // Player name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 56px 'Bebas Neue', sans-serif";
        ctx.fillText(playerName.toUpperCase(), 540, 400);

        const frameY = 460;

        // Draw frame image if available
        if (bestFrameUrl) {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = bestFrameUrl;
            });
            // Center the image, maintain aspect ratio
            const maxW = 900;
            const maxH = 1000;
            const ratio = Math.min(maxW / img.width, maxH / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            const x = (1080 - w) / 2;
            const y = frameY;

            // Rounded rect clip
            ctx.save();
            const r = 30;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();

            // Draw MediaPipe skeleton overlay on the frame
            try {
              const landmarker = await loadLandmarker();
              const result = landmarker.detect(img);
              if (result.landmarks && result.landmarks.length > 0) {
                const lms = result.landmarks[0];
                ctx.save();
                // Clip to same rounded rect for skeleton
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                ctx.clip();

                // Draw connections
                ctx.shadowColor = GLOW_COLOR;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = STROKE_COLOR;
                ctx.lineWidth = LINE_WIDTH * (w / img.width); // scale line width
                ctx.lineCap = "round";
                for (const [a, b] of POSE_CONNECTIONS) {
                  const la = lms[a];
                  const lb = lms[b];
                  if (!la || !lb) continue;
                  if ((la.visibility ?? 1) < 0.3 || (lb.visibility ?? 1) < 0.3) continue;
                  ctx.beginPath();
                  ctx.moveTo(x + la.x * w, y + la.y * h);
                  ctx.lineTo(x + lb.x * w, y + lb.y * h);
                  ctx.stroke();
                }

                // Draw joints
                ctx.shadowBlur = 6;
                ctx.fillStyle = STROKE_COLOR;
                const jr = JOINT_RADIUS * (w / img.width);
                for (const idx of MAJOR_JOINTS) {
                  const lm = lms[idx];
                  if (!lm || (lm.visibility ?? 1) < 0.3) continue;
                  ctx.beginPath();
                  ctx.arc(x + lm.x * w, y + lm.y * h, jr, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
              }
            } catch {
              // MediaPipe failed — frame stays without skeleton
            }

            // Border
            ctx.strokeStyle = "rgba(255,77,0,0.4)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.stroke();
          } catch {
            // Image load failed, skip
          }
        }

        // Score section at bottom
        const scoreY = 1550;

        // Score background glow
        const scoreGrad = ctx.createRadialGradient(540, scoreY, 0, 540, scoreY, 300);
        scoreGrad.addColorStop(0, "rgba(255,77,0,0.12)");
        scoreGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = scoreGrad;
        ctx.fillRect(0, scoreY - 200, 1080, 400);

        // "Score Global" label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "24px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SCORE GLOBAL", 540, scoreY - 60);

        // Big score
        ctx.fillStyle = scoreColor;
        ctx.font = "bold 180px 'Bebas Neue', sans-serif";
        ctx.fillText(`${score}`, 540, scoreY + 80);

        // /100
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "60px 'Bebas Neue', sans-serif";
        ctx.fillText("/100", 540, scoreY + 140);

        // Score label
        ctx.fillStyle = scoreColor;
        ctx.font = "bold 36px 'Inter', sans-serif";
        ctx.fillText(scoreLabel.toUpperCase(), 540, scoreY + 200);

        // Footer
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "22px 'Inter', sans-serif";
        ctx.fillText("shoot3-aicoach.lovable.app", 540, 1870);

        // Export canvas to blob
        const blob = await new Promise<Blob | null>(resolve =>
          tempCanvas.toBlob(resolve, "image/jpeg", 0.92)
        );

        if (blob) {
          const file = new File([blob], "score_shoot3.jpg", { type: "image/jpeg" });

          const shareData: ShareData = {
            title: `Mon Score Shoot3 - ${playerName}`,
            text: "🏀 Je viens de faire évaluer mon tir par l'IA Shoot3 ! Teste le tien 👉 https://shoot3-aicoach.lovable.app",
            files: [file],
          };

          if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else {
            // Fallback: download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "score_shoot3.jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error("Score card share error:", e);
    } finally {
      setGenerating(false);
    }
  }, [playerName, score, scoreLabel, scoreColor, bestFrameUrl, generating]);

  return (
    <>
      {/* Hidden template for canvas fallback reference (not used for capture, purely visual reference) */}
      <div
        ref={cardRef}
        className="fixed top-0 opacity-0 pointer-events-none"
        style={{ left: "-9999px", width: 1080, height: 1920 }}
        aria-hidden="true"
      />

      {/* Share button */}
      <button
        onClick={handleShare}
        disabled={generating}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2.5 rounded-xl font-body text-xs font-semibold tracking-wider active:scale-95 transition-all disabled:opacity-60"
        style={{ boxShadow: "0 0 16px rgba(168,85,247,0.3)" }}
      >
        <Share2 className="w-4 h-4" />
        {generating ? "Génération..." : "Story"}
      </button>
    </>
  );
};

export default ScoreCard;
