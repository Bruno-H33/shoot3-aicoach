import { useState, useEffect, useRef } from "react";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker";

interface AnnotatedFrameProps {
  imageUrl: string;
  className?: string;
}

const AnnotatedFrame = ({ imageUrl, className = "" }: AnnotatedFrameProps) => {
  const [skeletonUrl, setSkeletonUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { detectPose } = usePoseLandmarker();

  useEffect(() => {
    setSkeletonUrl(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      imgRef.current = img;
      try {
        const result = await detectPose(img);
        if (result.detected && result.dataUrl) {
          setSkeletonUrl(result.dataUrl);
        }
      } catch {
        // MediaPipe failed — original image stays visible
      }
    };
    img.onerror = () => {
      // Image load failed — nothing to do
    };
    img.src = imageUrl;
  }, [imageUrl, detectPose]);

  return (
    <img
      src={skeletonUrl || imageUrl}
      alt="Analyse annotée"
      className={className}
      loading="lazy"
    />
  );
};

export default AnnotatedFrame;
