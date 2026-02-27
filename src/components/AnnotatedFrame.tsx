import { useRef, useEffect, useState } from "react";

interface BoundingBox {
  box_y_min: number; // 0-1000 Gemini spatial grounding
  box_x_min: number;
  box_y_max: number;
  box_x_max: number;
}

interface Annotation extends BoundingBox {
  type: "angle";
  angle_value: number;
}

interface AnnotatedFrameProps {
  imageUrl: string;
  annotations: Annotation[];
  className?: string;
}

const STROKE_COLOR = "#FF4D00";
const TEXT_COLOR = "#FFFFFF";
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
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw each annotation
      annotations.forEach((ann) => {
        if (ann.type === "angle" && ann.box_x_min !== undefined) {
          // Compute center from bounding box (Gemini 0-1000 coords)
          const centerX = ((ann.box_x_min + ann.box_x_max) / 2000) * canvas.width;
          const centerY = ((ann.box_y_min + ann.box_y_max) / 2000) * canvas.height;

          // Draw crosshair / target indicator at the joint
          const radius = Math.min(canvas.width, canvas.height) * 0.035;

          // Outer circle
          ctx.strokeStyle = STROKE_COLOR;
          ctx.lineWidth = LINE_WIDTH;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner dot
          ctx.beginPath();
          ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
          ctx.fillStyle = STROKE_COLOR;
          ctx.fill();

          // Cross lines through center
          const crossLen = radius * 1.4;
          ctx.beginPath();
          ctx.moveTo(centerX - crossLen, centerY);
          ctx.lineTo(centerX + crossLen, centerY);
          ctx.moveTo(centerX, centerY - crossLen);
          ctx.lineTo(centerX, centerY + crossLen);
          ctx.strokeStyle = STROKE_COLOR;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw angle text
          if (ann.angle_value) {
            const fontSize = Math.max(16, Math.round(canvas.width * 0.035));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const textX = centerX;
            const textY = centerY - radius - fontSize * 0.8;

            // Background pill
            const text = `${ann.angle_value}°`;
            const metrics = ctx.measureText(text);
            const padX = 8;
            const padY = 4;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.beginPath();
            ctx.roundRect(
              textX - metrics.width / 2 - padX,
              textY - fontSize / 2 - padY,
              metrics.width + padX * 2,
              fontSize + padY * 2,
              6
            );
            ctx.fill();

            // Text
            ctx.fillStyle = TEXT_COLOR;
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(text, textX, textY);

            // Reset shadow
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }
      });

      setDataUrl(canvas.toDataURL("image/jpeg", 0.9));
    };
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
