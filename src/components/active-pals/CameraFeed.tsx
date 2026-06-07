import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "./i18n";
import { T } from "./i18n";
import { type ChallengeKey } from "./motions";
import { MOVENET_BONES, usePoseDetection } from "./poseDetector";
import { ExerciseScorer, type ScoreEvent } from "./scoring";

interface Props {
  active: boolean;
  lang: Lang;
  mirrored?: boolean;
  challengeKey: ChallengeKey;
  onScore?: (e: ScoreEvent) => void;
}

/** Live webcam feed + exercise-specific AI skeleton overlay. */
export function CameraFeed({
  active,
  lang,
  mirrored = true,
  challengeKey,
  onScore,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (e) {
        setError((e as Error).message || "denied");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [active]);

  // Real pose detection
  const { keypoints, status, size } = usePoseDetection(videoRef, active && ready);

  // Scorer (persisted across frames, reset on challenge change)
  const scorerRef = useRef<ExerciseScorer>(new ExerciseScorer(challengeKey));
  useEffect(() => {
    scorerRef.current.reset(challengeKey);
  }, [challengeKey]);

  // Run scorer whenever keypoints update
  const lastFeedback = useRef<"good" | "bad" | "idle">("idle");
  const lastAccuracy = useRef(0);
  useEffect(() => {
    if (!keypoints) return;
    const evt = scorerRef.current.update(keypoints, performance.now());
    lastFeedback.current = evt.feedback;
    lastAccuracy.current = evt.accuracy;
    onScore?.(evt);
  }, [keypoints, onScore]);

  const feedback = lastFeedback.current;
  const color =
    feedback === "good"
      ? "oklch(0.48 0.23 22)"
      : feedback === "bad"
        ? "oklch(0.65 0.18 50)"
        : "oklch(0.80 0.08 30)";

  // Compute bounding box around detected keypoints
  const bbox = useMemo(() => {
    if (!keypoints) return null;
    const visible = keypoints.filter((k) => (k.score ?? 0) > 0.3);
    if (visible.length < 4) return null;
    const xs = visible.map((k) => k.x);
    const ys = visible.map((k) => k.y);
    const pad = 14;
    return {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2,
    };
  }, [keypoints]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      />

      {(!ready || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/90 text-background">
          {error ? (
            <>
              <div className="text-3xl">📷</div>
              <div className="px-4 text-center text-sm font-semibold">{T.cameraDenied[lang]}</div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-background/30 border-t-background" />
              <div className="text-xs font-bold uppercase tracking-widest">{T.cameraNeeded[lang]}</div>
            </>
          )}
        </div>
      )}

      {ready && keypoints && size.w > 0 && (
        <svg
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
        >
          {bbox && (
            <rect
              x={bbox.x}
              y={bbox.y}
              width={bbox.w}
              height={bbox.h}
              fill="none"
              stroke={color}
              strokeWidth={Math.max(2, size.w / 200)}
              strokeDasharray={`${size.w / 50} ${size.w / 80}`}
              rx={size.w / 80}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          )}
          {MOVENET_BONES.map(([a, b], i) => {
            const pa = keypoints[a];
            const pb = keypoints[b];
            if (!pa || !pb || (pa.score ?? 0) < 0.3 || (pb.score ?? 0) < 0.3) return null;
            return (
              <line
                key={i}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={color}
                strokeWidth={Math.max(3, size.w / 130)}
                strokeLinecap="round"
                opacity="0.95"
              />
            );
          })}
          {keypoints.map((k, i) => {
            if ((k.score ?? 0) < 0.3) return null;
            return (
              <circle
                key={i}
                cx={k.x}
                cy={k.y}
                r={i === 0 ? Math.max(5, size.w / 80) : Math.max(3, size.w / 140)}
                fill={color}
                stroke="white"
                strokeWidth={Math.max(1, size.w / 400)}
              />
            );
          })}
        </svg>
      )}

      {ready && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
          <div
            className="animate-scanline h-[3px] w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          />
        </div>
      )}

      {ready && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          />
          {status === "ready" ? `AI · ${Math.round(lastAccuracy.current)}%` : T.scanning[lang]}
        </div>
      )}

      {ready && status === "loading" && (
        <div className="absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider">
          Loading AI model…
        </div>
      )}
    </div>
  );
}