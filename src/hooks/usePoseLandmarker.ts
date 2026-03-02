import { useRef, useCallback, useEffect } from "react";

let cachedLandmarker: any = null;
let loadingPromise: Promise<any> | null = null;

export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12], // shoulders
  [11, 23], [12, 24], // shoulders to hips
  [23, 24], // hips
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Left leg
  [23, 25], [25, 27],
  // Right leg
  [24, 26], [26, 28],
];

// Major joint indices (shoulders, elbows, wrists, hips, knees, ankles)
export const MAJOR_JOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

export const STROKE_COLOR = "#FF4D00";
export const GLOW_COLOR = "#FF4D00";
export const LINE_WIDTH = 3;
export const JOINT_RADIUS = 4;

export async function loadLandmarker() {
  if (cachedLandmarker) return cachedLandmarker;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const { PoseLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 1,
    });

    cachedLandmarker = landmarker;
    return landmarker;
  })();

  return loadingPromise;
}

export interface PoseDrawResult {
  dataUrl: string | null;
  detected: boolean;
}

/**
 * Draws the sport skeleton on a canvas over the given image.
 * Returns a base64 data URL of the composited result.
 */
export function drawSkeletonOnImage(
  img: HTMLImageElement,
  landmarks: Array<{ x: number; y: number; visibility?: number }>
): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // Draw original image
  ctx.drawImage(img, 0, 0);

  const w = canvas.width;
  const h = canvas.height;

  // Glow settings
  ctx.shadowColor = GLOW_COLOR;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";

  // Draw connections
  for (const [a, b] of POSE_CONNECTIONS) {
    const la = landmarks[a];
    const lb = landmarks[b];
    if (!la || !lb) continue;
    if ((la.visibility ?? 1) < 0.3 || (lb.visibility ?? 1) < 0.3) continue;

    ctx.beginPath();
    ctx.moveTo(la.x * w, la.y * h);
    ctx.lineTo(lb.x * w, lb.y * h);
    ctx.stroke();
  }

  // Draw joints
  ctx.shadowBlur = 6;
  ctx.fillStyle = STROKE_COLOR;
  for (const idx of MAJOR_JOINTS) {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 1) < 0.3) continue;

    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, JOINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  // Reset shadow
  ctx.shadowBlur = 0;

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function usePoseLandmarker() {
  const landmarkerRef = useRef<any>(null);

  useEffect(() => {
    loadLandmarker().then((lm) => {
      landmarkerRef.current = lm;
    }).catch(console.error);
  }, []);

  const detectPose = useCallback(async (imageElement: HTMLImageElement): Promise<PoseDrawResult> => {
    try {
      const landmarker = await loadLandmarker();
      const result = landmarker.detect(imageElement);

      if (!result.landmarks || result.landmarks.length === 0) {
        return { dataUrl: null, detected: false };
      }

      const dataUrl = drawSkeletonOnImage(imageElement, result.landmarks[0]);
      return { dataUrl, detected: true };
    } catch (err) {
      console.warn("MediaPipe pose detection failed:", err);
      return { dataUrl: null, detected: false };
    }
  }, []);

  return { detectPose };
}
