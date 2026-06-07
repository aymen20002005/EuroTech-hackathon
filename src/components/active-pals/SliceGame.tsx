import { useEffect, useRef, useState } from "react";
import type { Lang } from "./i18n";
import { T } from "./i18n";
import { KP, usePoseDetection } from "./poseDetector";

const FRUITS = ["🍉", "🍓", "🍊", "🍋", "🍇", "🍑", "🍍", "🥝", "🍎", "🍒", "🥭"];

interface FallingFruit {
  id: number;
  emoji: string;
  x: number; // normalized 0..1 in (unmirrored) video space
  y: number; // normalized 0..1
  vy: number;
  rot: number;
  vrot: number;
}

interface Slice {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number; // slash direction in degrees
}

interface Props {
  active: boolean;
  lang: Lang;
  /** +1 each time a fruit is sliced */
  onSlice: (delta: number) => void;
}

const HIT_RADIUS = 0.1;
const SLICE_SPEED = 0.45; // min hand speed (normalized units / s) to count as a slash
const TRAIL_LEN = 8;

/** Fruit-Ninja style mini-game: swipe your hand through falling fruit to slice it. */
export function SliceGame({ active, lang, onSlice }: Props) {
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

  const { keypoints, status, size } = usePoseDetection(videoRef, active && ready);

  // ---- Track hand (wrist) positions + velocity in normalized video space ----
  const handsRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const prevHandsRef = useRef<{ lWrist?: { x: number; y: number }; rWrist?: { x: number; y: number }; ts: number }>({ ts: 0 });
  useEffect(() => {
    if (!keypoints || size.w <= 0 || size.h <= 0) return;
    const now = performance.now();
    const dt = prevHandsRef.current.ts ? Math.max(0.001, (now - prevHandsRef.current.ts) / 1000) : 0.016;
    const hs: { x: number; y: number; vx: number; vy: number }[] = [];
    const prev = prevHandsRef.current;
    const nextPrev: typeof prevHandsRef.current = { ts: now };
    for (const [idx, name] of [[KP.lWrist, "lWrist"], [KP.rWrist, "rWrist"]] as const) {
      const k = keypoints[idx];
      if (k && (k.score ?? 0) > 0.3) {
        const x = k.x / size.w;
        const y = k.y / size.h;
        const p = prev[name];
        const vx = p ? (x - p.x) / dt : 0;
        const vy = p ? (y - p.y) / dt : 0;
        hs.push({ x, y, vx, vy });
        nextPrev[name] = { x, y };
      }
    }
    prevHandsRef.current = nextPrev;
    handsRef.current = hs;
  }, [keypoints, size]);

  // ---- Game loop ----
  const fruitsRef = useRef<FallingFruit[]>([]);
  const [fruits, setFruits] = useState<FallingFruit[]>([]);
  const [slices, setSlices] = useState<Slice[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number }[][]>([]);
  const trailRef = useRef<{ x: number; y: number }[][]>([[], []]);
  const idc = useRef(1);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);
  const startTs = useRef(0);

  const onSliceRef = useRef(onSlice);
  useEffect(() => {
    onSliceRef.current = onSlice;
  }, [onSlice]);

  useEffect(() => {
    if (!active || !ready) return;
    let mounted = true;
    let raf = 0;
    lastFrame.current = 0;
    lastSpawn.current = 0;
    startTs.current = 0;
    trailRef.current = [[], []];

    const loop = (ts: number) => {
      if (!mounted) return;
      if (!startTs.current) startTs.current = ts;
      const dt = lastFrame.current ? Math.min(0.05, (ts - lastFrame.current) / 1000) : 0;
      lastFrame.current = ts;

      const elapsed = (ts - startTs.current) / 1000;
      const spawnEvery = Math.max(500, 950 - elapsed * 12);
      if (ts - lastSpawn.current > spawnEvery) {
        lastSpawn.current = ts;
        fruitsRef.current.push({
          id: idc.current++,
          emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)],
          x: 0.12 + Math.random() * 0.76,
          y: -0.1,
          vy: 0.15 + Math.random() * 0.12 + elapsed * 0.003,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 160,
        });
      }

      const hands = handsRef.current;
      // Update blade trails (one per hand)
      for (let i = 0; i < 2; i++) {
        const h = hands[i];
        const arr = trailRef.current[i] ?? (trailRef.current[i] = []);
        if (h) {
          arr.push({ x: h.x, y: h.y });
          while (arr.length > TRAIL_LEN) arr.shift();
        } else if (arr.length) {
          arr.shift();
        }
      }

      const next: FallingFruit[] = [];
      const newSlices: Slice[] = [];
      for (const fr of fruitsRef.current) {
        fr.y += fr.vy * dt;
        fr.rot += fr.vrot * dt;
        let sliced = false;
        for (const h of hands) {
          const dx = h.x - fr.x;
          const dy = h.y - fr.y;
          const speed = Math.hypot(h.vx, h.vy);
          if (Math.hypot(dx, dy) < HIT_RADIUS && speed > SLICE_SPEED) {
            sliced = true;
            const angle = (Math.atan2(h.vy, h.vx) * 180) / Math.PI;
            newSlices.push({ id: idc.current++, x: fr.x, y: fr.y, emoji: fr.emoji, angle });
            break;
          }
        }
        if (sliced) {
          onSliceRef.current(1);
          continue;
        }
        if (fr.y < 1.15) next.push(fr);
      }
      fruitsRef.current = next;
      setFruits([...next]);
      setTrail(trailRef.current.map((a) => [...a]));
      if (newSlices.length) {
        setSlices((s) => [...s, ...newSlices]);
        for (const sp of newSlices) {
          window.setTimeout(() => {
            setSlices((arr) => arr.filter((x) => x.id !== sp.id));
          }, 700);
        }
      }

      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
      fruitsRef.current = [];
      setFruits([]);
      setSlices([]);
      setTrail([]);
    };
  }, [active, ready]);

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

      {/* Mirrored play layer — matches the mirrored video so hands line up */}
      {ready && (
        <div className="pointer-events-none absolute inset-0" style={{ transform: "scaleX(-1)" }}>
          {/* glowing blade trails */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="blade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.93 0.17 95 / 0)" />
                <stop offset="100%" stopColor="oklch(0.93 0.17 95)" />
              </linearGradient>
            </defs>
            {trail.map((arr, i) =>
              arr.length > 1 ? (
                <polyline
                  key={i}
                  points={arr.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
                  fill="none"
                  stroke="url(#blade)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 3px oklch(0.93 0.17 95))" }}
                />
              ) : null,
            )}
          </svg>

          {/* hand blade tips */}
          {trail.map((arr, i) => {
            const tip = arr[arr.length - 1];
            if (!tip) return null;
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${tip.x * 100}%`, top: `${tip.y * 100}%` }}
              >
                <div
                  className="h-7 w-7 rounded-full border-[3px] border-foreground"
                  style={{ background: "oklch(0.93 0.17 95)", boxShadow: "0 0 14px oklch(0.93 0.17 95)" }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-sm" style={{ transform: "scaleX(-1)" }}>🗡️</span>
                </div>
              </div>
            );
          })}

          {/* falling fruit */}
          {fruits.map((fr) => (
            <div
              key={fr.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
              style={{ left: `${fr.x * 100}%`, top: `${fr.y * 100}%` }}
            >
              <span
                className="block text-4xl sm:text-5xl"
                style={{
                  transform: `scaleX(-1) rotate(${fr.rot}deg)`,
                  filter: "drop-shadow(0 0 9px oklch(0.78 0.17 165 / 0.6)) drop-shadow(2px 3px 0 rgba(0,0,0,0.35))",
                }}
              >
                {fr.emoji}
              </span>
            </div>
          ))}

          {/* slice bursts: two halves fly apart + score */}
          {slices.map((sp) => (
            <div
              key={sp.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${sp.x * 100}%`, top: `${sp.y * 100}%` }}
            >
              {/* slash flash */}
              <div
                className="absolute left-1/2 top-1/2 h-1 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full animate-fade-out"
                style={{
                  transform: `translate(-50%,-50%) rotate(${sp.angle}deg)`,
                  background: "linear-gradient(90deg, transparent, oklch(0.99 0 0), transparent)",
                  boxShadow: "0 0 12px oklch(0.93 0.17 95)",
                }}
              />
              <span
                className="absolute block text-4xl sm:text-5xl animate-slice-left"
                style={{ transform: "scaleX(-1)", clipPath: "inset(0 50% 0 0)" }}
              >
                {sp.emoji}
              </span>
              <span
                className="absolute block text-4xl sm:text-5xl animate-slice-right"
                style={{ transform: "scaleX(-1)", clipPath: "inset(0 0 0 50%)" }}
              >
                {sp.emoji}
              </span>
              <div
                className="display absolute left-1/2 top-1/2 -translate-x-1/2 animate-float-up text-3xl sm:text-4xl"
                style={{ transform: "scaleX(-1)", color: "oklch(0.93 0.17 95)", textShadow: "2px 2px 0 #1a1a2e" }}
              >
                +1
              </div>
            </div>
          ))}
        </div>
      )}

      {/* status chip */}
      {ready && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: "oklch(0.93 0.17 95)", boxShadow: "0 0 6px oklch(0.93 0.17 95)" }}
          />
          {status === "ready" ? "AI BLADES" : T.scanning[lang]}
        </div>
      )}

      {/* intro hint */}
      {ready && (
        <div className="absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider">
          {T.slice_intro[lang]}
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
