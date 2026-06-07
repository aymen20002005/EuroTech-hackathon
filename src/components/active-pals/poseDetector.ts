import { useEffect, useRef, useState } from "react";

export interface Keypoint {
  name?: string;
  x: number;
  y: number;
  score?: number;
}

export type Status = "loading" | "ready" | "error";

/**
 * Real-time pose detection using TensorFlow.js MoveNet (SinglePose Lightning).
 * Runs entirely in the browser on the user's webcam — no API key needed.
 * Returns the latest keypoints (COCO 17-point format) every animation frame.
 */
export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  const keypointsRef = useRef<Keypoint[] | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, force] = useState(0);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 1, h: 1 });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let lastPush = 0;
    let lastInfer = 0;
    let timer: number | null = null;
    // Run inference as fast as possible but yield to the event loop between
    // frames so the game's rAF loop isn't starved. 0ms = next macrotask.
    const INFER_INTERVAL_MS = 0;

    (async () => {
      try {
        const tf = await import("@tensorflow/tfjs-core");
        await import("@tensorflow/tfjs-converter");
        await import("@tensorflow/tfjs-backend-webgl");
        const poseDetection = await import("@tensorflow-models/pose-detection");

        await tf.setBackend("webgl");
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType:
              poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          },
        );
        if (cancelled) {
          detector.dispose();
          return;
        }
        detectorRef.current = detector;
        setStatus("ready");

        const tick = async () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.readyState >= 2 && v.videoWidth > 0) {
            sizeRef.current = { w: v.videoWidth, h: v.videoHeight };
            try {
              const poses = await detector.estimatePoses(v, {
                flipHorizontal: false,
              });
              if (poses[0]) {
                keypointsRef.current = poses[0].keypoints as Keypoint[];
                const now = performance.now();
                if (now - lastPush > 16) {
                  lastPush = now;
                  force((n) => (n + 1) % 1000);
                }
              }
            } catch {
              /* swallow per-frame errors */
            }
          }
          if (cancelled) return;
          const elapsed = performance.now() - lastInfer;
          const wait = Math.max(0, INFER_INTERVAL_MS - elapsed);
          lastInfer = performance.now();
          timer = window.setTimeout(tick, wait);
        };
        lastInfer = performance.now();
        timer = window.setTimeout(tick, 0);
      } catch (e) {
        console.error("Pose detection init failed", e);
        setErrorMsg((e as Error).message);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (timer != null) clearTimeout(timer);
      timer = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        detectorRef.current?.dispose?.();
      } catch {
        /* noop */
      }
      detectorRef.current = null;
    };
  }, [active, videoRef]);

  return {
    keypoints: keypointsRef.current,
    keypointsRef,
    sizeRef,
    status,
    errorMsg,
    size: sizeRef.current,
  };
}

// MoveNet/COCO 17-point indices
export const KP = {
  nose: 0,
  lEye: 1,
  rEye: 2,
  lEar: 3,
  rEar: 4,
  lShoulder: 5,
  rShoulder: 6,
  lElbow: 7,
  rElbow: 8,
  lWrist: 9,
  rWrist: 10,
  lHip: 11,
  rHip: 12,
  lKnee: 13,
  rKnee: 14,
  lAnkle: 15,
  rAnkle: 16,
} as const;

// Bone pairs for rendering
export const MOVENET_BONES: [number, number][] = [
  [KP.lShoulder, KP.rShoulder],
  [KP.lShoulder, KP.lElbow],
  [KP.lElbow, KP.lWrist],
  [KP.rShoulder, KP.rElbow],
  [KP.rElbow, KP.rWrist],
  [KP.lShoulder, KP.lHip],
  [KP.rShoulder, KP.rHip],
  [KP.lHip, KP.rHip],
  [KP.lHip, KP.lKnee],
  [KP.lKnee, KP.lAnkle],
  [KP.rHip, KP.rKnee],
  [KP.rKnee, KP.rAnkle],
  [KP.nose, KP.lShoulder],
  [KP.nose, KP.rShoulder],
];
