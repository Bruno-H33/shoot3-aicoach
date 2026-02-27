import { useRef, useEffect, useState } from "react";

interface FocusPoint {
  focus_x: number; // 0.0 - 1.0
  focus_y: number; // 0.0 - 1.0
}

interface AnnotatedFrameProps {
  imageUrl: string;
  annotations: FocusPoint[];
  className?: string;
}

const STROKE_COLOR = "#FF4D00";
const GLOW_COLOR = "rgba(255, 77, 0, 0.5)";
const LINE_WIDTH = 3;


const AnnotatedFrame = ({ imageUrl, annotations, className = "" }: AnnotatedFrameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!annotations || annotations.length === 0) {
      setDataUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        annotations.forEach((ann) => {
          try {
            const fx = Number(ann.focus_x);
            const fy = Number(ann.focus_y);
            if (!isFinite(fx) || !isFinite(fy) || fx < 0 || fx > 1 || fy < 0 || fy > 1) return;

            const centerX = fx * canvas.width;
            const centerY = fy * canvas.height;
            const radius = Math.min(canvas.width, canvas.height) * 0.04;

            // Glow effect
            ctx.save();
            ctx.shadowColor = GLOW_COLOR;
            ctx.shadowBlur = 20;

            // Outer circle
            ctx.strokeStyle = STROKE_COLOR;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Second glow ring
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;

            ctx.restore();

            // Crosshair lines (no glow for crispness)
            const crossLen = radius * 0.6;
            ctx.strokeStyle = STROKE_COLOR;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;

            ctx.beginPath();
            ctx.moveTo(centerX - crossLen, centerY);
            ctx.lineTo(centerX + crossLen, centerY);
            ctx.moveTo(centerX, centerY - crossLen);
            ctx.lineTo(centerX, centerY + crossLen);
            ctx.stroke();

            ctx.globalAlpha = 1;

            // Center dot
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fillStyle = STROKE_COLOR;
            ctx.fill();
          } catch {
            // Skip invalid annotation silently
          }
        });

        setDataUrl(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        // Canvas drawing failed — keep original image
        setDataUrl(null);
      }
    };
    img.onerror = () => setDataUrl(null);
    img.src = imageUrl;
  }, [imageUrl, annotations]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <img
        src={dataUrl || imageUrl}
        alt="Analyse annotée"
        className={className}
        loading="lazy"
      />
    </>
  );
};

export default AnnotatedFrame;
