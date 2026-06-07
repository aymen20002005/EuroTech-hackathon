import { useEffect, useRef, useState } from "react";
import type { Lang } from "./i18n";
import { T } from "./i18n";
import { KP, usePoseDetection } from "./poseDetector";

interface Props {
  active: boolean;
  lang: Lang;
  /** Fired on each completed lift rep. quality is 0..100 form score. */
  onLift: (quality: number) => void;
}

interface RepFlash {
  id: number;
  x: number;
  y: number;
  quality: number;
}

interface Hand {
  x: number;
  y: number;
}

interface BarState {
  l: Hand;
  r: Hand;
  /** 0..1 grip quality (how level + shoulder-width the grip is) */
  grip: number;
  /** -0.5..1.5 lift height relative to shoulders (1 ~ overhead) */
  lift: number;
  gripping: boolean;
}

const UP_THRESH = 0.95; // wrists ~1 torso above shoulders = overhead
const DOWN_THRESH = 0.2; // wrists back near shoulders/chest

/**
 * Lifting mini-game: a glowing barbell follows the player's hands. Grab it,
 * then press it overhead and back down. Cleaner, fuller reps score higher.
 */
export function LiftGame({ active, lang, onLift }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // ---- Webcam setup ----
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 60 } },
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

  const { status, keypointsRef, sizeRef } = usePoseDetection(videoRef, active && ready);

  const [bar, setBar] = useState<BarState | null>(null);
  const [flashes, setFlashes] = useState<RepFlash[]>([]);

  // rep state machine
  const phaseRef = useRef<"down" | "up">("down");
  const peakLiftRef = useRef(0);
  const worstLevelRef = useRef(0);
  const idc = useRef(1);

  // Smoothed last-known wrist positions so a single low-confidence frame
  // doesn't make the bar disappear or snap to one hand.
  const lHandRef = useRef<Hand | null>(null);
  const rHandRef = useRef<Hand | null>(null);
  const lLastSeenRef = useRef(0);
  const rLastSeenRef = useRef(0);

  const onLiftRef = useRef(onLift);
  useEffect(() => {
    onLiftRef.current = onLift;
  }, [onLift]);

  // ---- Fast ref-based loop: reads keypoints every frame, no React delay ----
  useEffect(() => {
    if (!active || !ready) return;
    let raf = 0;
    const SMOOTH = 0.45; // EMA factor — higher = snappier, lower = smoother
    const STALE_MS = 250; // keep last wrist for this long if confidence drops

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const kps = keypointsRef.current;
      const size = sizeRef.current;
      if (!kps || size.w <= 0 || size.h <= 0) return;

      const lW = kps[KP.lWrist];
      const rW = kps[KP.rWrist];
      const lS = kps[KP.lShoulder];
      const rS = kps[KP.rShoulder];
      const lH = kps[KP.lHip];
      const rH = kps[KP.rHip];

      const ok = (k?: { score?: number }) => k && (k.score ?? 0) > 0.25;
      if (!ok(lS) || !ok(rS)) return;

      const nx = (k: { x: number }) => k.x / size.w;
      const ny = (k: { y: number }) => k.y / size.h;
      const now = performance.now();

      // Update each wrist independently with EMA smoothing.
      if (ok(lW)) {
        const next: Hand = { x: nx(lW!), y: ny(lW!) };
        const prev = lHandRef.current;
        lHandRef.current = prev
          ? { x: prev.x + (next.x - prev.x) * SMOOTH, y: prev.y + (next.y - prev.y) * SMOOTH }
          : next;
        lLastSeenRef.current = now;
      }
      if (ok(rW)) {
        const next: Hand = { x: nx(rW!), y: ny(rW!) };
        const prev = rHandRef.current;
        rHandRef.current = prev
          ? { x: prev.x + (next.x - prev.x) * SMOOTH, y: prev.y + (next.y - prev.y) * SMOOTH }
          : next;
        rLastSeenRef.current = now;
      }

      const lStale = now - lLastSeenRef.current > STALE_MS;
      const rStale = now - rLastSeenRef.current > STALE_MS;
      const l = lHandRef.current;
      const r = rHandRef.current;
      if (!l || !r || lStale || rStale) {
        setBar((b) => (b === null ? b : null));
        return;
      }

      const shoulderY = (ny(lS!) + ny(rS!)) / 2;
      const shoulderW = Math.abs(nx(lS!) - nx(rS!)) || 0.18;
      const hipY = ok(lH) && ok(rH) ? (ny(lH!) + ny(rH!)) / 2 : shoulderY + 0.28;
      const torso = Math.max(0.12, hipY - shoulderY);

      const avgWristY = (l.y + r.y) / 2;
      const lift = (shoulderY - avgWristY) / torso;
      const levelErr = Math.abs(l.y - r.y) / torso;
      const widthErr = Math.abs(Math.abs(l.x - r.x) - shoulderW * 1.4) / shoulderW;
      const grip = Math.max(0, 1 - levelErr * 1.6 - widthErr * 0.4);

      setBar({ l: { ...l }, r: { ...r }, grip, lift, gripping: true });

      // ---- rep detection ----
      if (phaseRef.current === "down") {
        if (lift > UP_THRESH) {
          phaseRef.current = "up";
          peakLiftRef.current = lift;
          worstLevelRef.current = levelErr;
        }
      } else {
        peakLiftRef.current = Math.max(peakLiftRef.current, lift);
        worstLevelRef.current = Math.max(worstLevelRef.current, levelErr);
        if (lift < DOWN_THRESH) {
          phaseRef.current = "down";
          const rom = Math.min(1, peakLiftRef.current / 1.25);
          const levelScore = Math.max(0, 1 - worstLevelRef.current * 2.2);
          const quality = Math.round(Math.min(100, rom * 55 + levelScore * 45));
          onLiftRef.current(quality);
          setFlashes((f) => {
            const id = idc.current++;
            const flash = { id, x: (l.x + r.x) / 2, y: avgWristY, quality };
            window.setTimeout(() => setFlashes((arr) => arr.filter((x) => x.id !== id)), 900);
            return [...f, flash];
          });
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ready, keypointsRef, sizeRef]);

  // reset state machine when (de)activated
  useEffect(() => {
    if (!active) {
      phaseRef.current = "down";
      peakLiftRef.current = 0;
      worstLevelRef.current = 0;
      lHandRef.current = null;
      rHandRef.current = null;
      setBar(null);
      setFlashes([]);
    }
  }, [active]);

  const dx = bar ? bar.r.x - bar.l.x : 0;
  const dy = bar ? bar.r.y - bar.l.y : 0;
  const barAngle = bar ? (Math.atan2(dy, dx) * 180) / Math.PI : 0;
  const barLen = bar ? Math.hypot(dx, dy) * 100 : 0;
  const liftPct = bar ? Math.max(0, Math.min(1, bar.lift / 1.25)) : 0;
  const gripGood = bar ? bar.grip > 0.55 : false;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
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

      {/* Mirrored play layer — matches the mirrored video so the bar lines up */}
      {ready && (
        <div className="pointer-events-none absolute inset-0" style={{ transform: "scaleX(-1)" }}>
          {/* the barbell */}
          {bar && (
            <div
              className="absolute origin-left"
              style={{
                left: `${bar.l.x * 100}%`,
                top: `${bar.l.y * 100}%`,
                width: `${barLen}%`,
                transform: `translateY(-50%) rotate(${barAngle}deg)`,
              }}
            >
              {/* steel bar */}
              <div
                className="relative h-2.5 w-full rounded-full border-2 border-foreground"
                style={{
                  background: gripGood
                    ? "linear-gradient(90deg, oklch(0.78 0.17 165), oklch(0.93 0.17 95), oklch(0.78 0.17 165))"
                    : "linear-gradient(90deg, oklch(0.7 0.02 250), oklch(0.85 0.02 250), oklch(0.7 0.02 250))",
                  boxShadow: gripGood ? "0 0 16px oklch(0.85 0.17 130)" : "0 0 6px oklch(0 0 0 / 0.4)",
                }}
              >
                {/* weight plates */}
                <span className="absolute -left-1.5 top-1/2 h-8 w-3 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" />
                <span className="absolute -right-1.5 top-1/2 h-8 w-3 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" />
                <span className="absolute left-0.5 top-1/2 h-6 w-2 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" />
                <span className="absolute right-0.5 top-1/2 h-6 w-2 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" />
              </div>
            </div>
          )}

          {/* hand grip markers */}
          {bar &&
            [bar.l, bar.r].map((h, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
              >
                <div
                  className="h-6 w-6 rounded-full border-[3px] border-foreground"
                  style={{
                    background: gripGood ? "oklch(0.78 0.17 165)" : "oklch(0.99 0 0)",
                    boxShadow: gripGood ? "0 0 12px oklch(0.78 0.17 165)" : "none",
                  }}
                />
              </div>
            ))}

          {/* rep flashes */}
          {flashes.map((f) => (
            <div
              key={f.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }}
            >
              <div
                className="display animate-float-up text-3xl sm:text-4xl"
                style={{
                  transform: "scaleX(-1)",
                  color: f.quality >= 70 ? "oklch(0.78 0.17 165)" : "oklch(0.93 0.17 95)",
                  textShadow: "2px 2px 0 #1a1a2e",
                }}
              >
                +{Math.max(1, Math.round(f.quality / 10))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROM power meter (not mirrored — stays on the right) */}
      {ready && (
        <div className="absolute right-2 top-9 bottom-9 flex w-3 flex-col-reverse overflow-hidden rounded-full border-2 border-foreground bg-background/70">
          <div
            className="w-full rounded-full transition-[height] duration-100"
            style={{
              height: `${liftPct * 100}%`,
              background: "linear-gradient(0deg, oklch(0.78 0.17 165), oklch(0.93 0.17 95))",
            }}
          />
        </div>
      )}

      {/* status chip */}
      {ready && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: "oklch(0.78 0.17 165)", boxShadow: "0 0 6px oklch(0.78 0.17 165)" }}
          />
          {status === "ready" ? "AI BARBELL" : T.scanning[lang]}
        </div>
      )}

      {/* intro / grip hint */}
      {ready && (
        <div className="absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider">
          {!bar ? T.lift_grip[lang] : T.lift_intro[lang]}
        </div>
      )}

      {ready && status === "loading" && (
        <div className="absolute inset-x-2 top-9 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider">
          Loading AI model…
        </div>
      )}
    </div>
  );
}
