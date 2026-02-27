import { useRef, useEffect } from "react";

interface FocusPoint {
  focus_x: number | null;
  focus_y: number | null;
}

interface AnnotatedFrameProps {
  imageUrl: string;
  annotations: FocusPoint[];
  className?: string;
}

const STROKE_COLOR = "#FF4D00";
const GLOW_COLOR = "rgba(255, 77, 0, 0.5)";
const LINE_WIDTH = 3;
const FOCUS_RADIUS_RATIO = 0.06;

const AnnotatedFrame = ({ imageUrl, annotations, className = "" }: AnnotatedFrameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Filter valid annotations
    const valid = (annotations || []).filter((a) => {
      const fx = Number(a.focus_x);
      const fy = Number(a.focus_y);
      return isFinite(fx) && isFinite(fy) && fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1;
    });

    if (valid.length === 0) {
      // Nothing to draw — hide canvas
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        valid.forEach((ann) => {
          try {
            const centerX = Number(ann.focus_x) * canvas.width;
            const centerY = Number(ann.focus_y) * canvas.height;
            const radius = Math.min(canvas.width, canvas.height) * FOCUS_RADIUS_RATIO;

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

            // Crosshair
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
            // Skip invalid annotation
          }
        });
      } catch {
        // Canvas drawing failed — canvas stays empty, image still visible beneath
        canvas.width = 0;
        canvas.height = 0;
      }
    };
    img.onerror = () => {
      canvas.width = 0;
      canvas.height = 0;
    };
    img.src = imageUrl;
  }, [imageUrl, annotations]);

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Analyse annotée"
        className={className}
        loading="lazy"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default AnnotatedFrame;
