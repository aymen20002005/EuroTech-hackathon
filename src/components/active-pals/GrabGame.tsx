import { useEffect, useRef, useState } from "react";
import type { Lang } from "./i18n";
import { T } from "./i18n";
import { KP, usePoseDetection } from "./poseDetector";

type ItemType = "apple" | "pizza";

interface FallingItem {
  id: number;
  type: ItemType;
  x: number; // normalized 0..1 in (unmirrored) video space
  y: number; // normalized 0..1
  vy: number;
  rot: number;
  vrot: number;
}

interface Splash {
  id: number;
  x: number;
  y: number;
  type: ItemType;
}

interface Props {
  active: boolean;
  lang: Lang;
  /** +1 when an apple is caught, -1 when a pizza is caught */
  onGrab: (delta: number) => void;
}

const APPLE_PROB = 0.68;
const HIT_RADIUS = 0.09;

/** Falling-objects mini-game: catch apples with your hands, dodge pizza. */
export function GrabGame({ active, lang, onGrab }: Props) {
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

  // ---- Hand (wrist) positions in normalized video space ----
  // Read directly from refs each frame — no React rerender delay.
  const handsRef = useRef<{ x: number; y: number }[]>([]);
  const readHands = () => {
    const kp = keypointsRef.current;
    const sz = sizeRef.current;
    if (!kp || sz.w <= 0 || sz.h <= 0) return;
    const hs: { x: number; y: number }[] = [];
    for (const idx of [KP.lWrist, KP.rWrist]) {
      const k = kp[idx];
      if (k && (k.score ?? 0) > 0.3) hs.push({ x: k.x / sz.w, y: k.y / sz.h });
    }
    handsRef.current = hs;
  };

  // ---- Game loop ----
  const itemsRef = useRef<FallingItem[]>([]);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [handDots, setHandDots] = useState<{ x: number; y: number }[]>([]);
  const idc = useRef(1);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);
  const startTs = useRef(0);

  const onGrabRef = useRef(onGrab);
  useEffect(() => {
    onGrabRef.current = onGrab;
  }, [onGrab]);

  useEffect(() => {
    if (!active || !ready) return;
    let mounted = true;
    let raf = 0;
    lastFrame.current = 0;
    lastSpawn.current = 0;
    startTs.current = 0;

    const loop = (ts: number) => {
      if (!mounted) return;
      if (!startTs.current) startTs.current = ts;
      const dt = lastFrame.current ? Math.min(0.05, (ts - lastFrame.current) / 1000) : 0;
      lastFrame.current = ts;
      readHands();

      // Difficulty ramps up: spawn faster over time.
      const elapsed = (ts - startTs.current) / 1000;
      const spawnEvery = Math.max(550, 1000 - elapsed * 14);
      if (ts - lastSpawn.current > spawnEvery) {
        lastSpawn.current = ts;
        const type: ItemType = Math.random() < APPLE_PROB ? "apple" : "pizza";
        itemsRef.current.push({
          id: idc.current++,
          type,
          x: 0.12 + Math.random() * 0.76,
          y: -0.1,
          vy: 0.16 + Math.random() * 0.13 + elapsed * 0.003,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 140,
        });
      }

      const hands = handsRef.current;
      const next: FallingItem[] = [];
      const newSplashes: Splash[] = [];
      for (const it of itemsRef.current) {
        it.y += it.vy * dt;
        it.rot += it.vrot * dt;
        let hit = false;
        for (const h of hands) {
          const dx = h.x - it.x;
          const dy = h.y - it.y;
          if (Math.hypot(dx, dy) < HIT_RADIUS) {
            hit = true;
            break;
          }
        }
        if (hit) {
          onGrabRef.current(it.type === "apple" ? 1 : -1);
          newSplashes.push({ id: idc.current++, x: it.x, y: it.y, type: it.type });
          continue;
        }
        if (it.y < 1.15) next.push(it);
      }
      itemsRef.current = next;
      setItems([...next]);
      setHandDots([...hands]);
      if (newSplashes.length) {
        setSplashes((s) => [...s, ...newSplashes]);
        for (const sp of newSplashes) {
          window.setTimeout(() => {
            setSplashes((arr) => arr.filter((x) => x.id !== sp.id));
          }, 650);
        }
      }

      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
      itemsRef.current = [];
      setItems([]);
      setSplashes([]);
      setHandDots([]);
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
          {/* hand glow markers */}
          {handDots.map((h, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
            >
              <div
                className="h-14 w-14 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.93 0.17 95 / 0.55) 0%, oklch(0.93 0.17 95 / 0) 70%)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground"
                style={{ background: "oklch(0.78 0.17 165)", boxShadow: "0 0 12px oklch(0.78 0.17 165)" }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-xs" style={{ transform: "scaleX(-1)" }}>✋</span>
              </div>
            </div>
          ))}

          {/* falling items */}
          {items.map((it) => (
            <div
              key={it.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
              style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%` }}
            >
              <span
                className="block text-4xl sm:text-5xl"
                style={{
                  transform: `scaleX(-1) rotate(${it.rot}deg)`,
                  textShadow:
                    it.type === "apple"
                      ? "0 0 10px oklch(0.78 0.17 165), 2px 3px 0 rgba(0,0,0,0.35)"
                      : "0 0 10px oklch(0.72 0.2 5), 2px 3px 0 rgba(0,0,0,0.35)",
                }}
              >
                {it.type === "apple" ? "🍎" : "🍕"}
              </span>
            </div>
          ))}

          {/* catch splashes */}
          {splashes.map((sp) => (
            <div
              key={sp.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${sp.x * 100}%`, top: `${sp.y * 100}%` }}
            >
              <div
                className="display animate-float-up text-3xl sm:text-4xl"
                style={{
                  transform: "scaleX(-1)",
                  color: sp.type === "apple" ? "oklch(0.78 0.17 165)" : "oklch(0.72 0.2 5)",
                  textShadow: "2px 2px 0 #1a1a2e",
                }}
              >
                {sp.type === "apple" ? "+1" : "-1"}
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
            style={{ background: "oklch(0.78 0.17 165)", boxShadow: "0 0 6px oklch(0.78 0.17 165)" }}
          />
          {status === "ready" ? "AI HANDS" : T.scanning[lang]}
        </div>
      )}

      {/* intro hint */}
      {ready && (
        <div className="absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider">
          {T.grab_intro[lang]}
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
