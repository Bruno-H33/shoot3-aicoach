import { useRef, useEffect, useState } from "react";

interface Point {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

interface Annotation {
  type: "angle";
  points: Point[]; // 3 points: [start, vertex, end]
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
        if (ann.type === "angle" && ann.points?.length === 3) {
          const pts = ann.points.map((p) => ({
            x: (p.x / 100) * canvas.width,
            y: (p.y / 100) * canvas.height,
          }));

          // Draw lines from vertex
          ctx.strokeStyle = STROKE_COLOR;
          ctx.lineWidth = LINE_WIDTH;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          ctx.lineTo(pts[1].x, pts[1].y);
          ctx.lineTo(pts[2].x, pts[2].y);
          ctx.stroke();

          // Draw small circles at joints
          pts.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = STROKE_COLOR;
            ctx.fill();
          });

          // Draw angle arc at vertex
          if (ann.angle_value) {
            const vertex = pts[1];
            const angle1 = Math.atan2(pts[0].y - vertex.y, pts[0].x - vertex.x);
            const angle2 = Math.atan2(pts[2].y - vertex.y, pts[2].x - vertex.x);
            const arcRadius = Math.min(canvas.width, canvas.height) * 0.04;

            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, arcRadius, Math.min(angle1, angle2), Math.max(angle1, angle2));
            ctx.strokeStyle = STROKE_COLOR;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw angle text
            const textOffset = arcRadius + 15;
            const midAngle = (angle1 + angle2) / 2;
            const textX = vertex.x + Math.cos(midAngle) * textOffset;
            const textY = vertex.y + Math.sin(midAngle) * textOffset;

            const fontSize = Math.max(14, Math.round(canvas.width * 0.03));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Text shadow
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(`${ann.angle_value}°`, textX, textY);

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
