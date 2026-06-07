import { useEffect, useRef, useState } from "react";
import type { Lang } from "./i18n";
import { T } from "./i18n";
import { BONES, getPose, type ChallengeKey } from "./motions";

interface Props {
  active: boolean;
  lang: Lang;
  rivalName: string;
  rivalRegion: string;
  challengeKey: ChallengeKey;
  speed?: number;
}

export function RivalFeed({ active, lang, rivalName, rivalRegion, challengeKey, speed = 0.2 }: Props) {
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      setTick((t) => t + 1);
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  const t = tick * speed * 0.32 + 1.1;
  const { joints, bbox } = getPose(challengeKey, t);
  const jointArr = Object.values(joints);

  const boneColor  = "oklch(0.48 0.23 22)";
  const jointColor = "oklch(0.75 0.12 350)";
  const glowColor  = "oklch(0.48 0.23 22)";

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
      style={{
        border: "1.5px solid oklch(0.90 0.03 40)",
        boxShadow: "0 2px 12px oklch(0 0 0 / 0.06)",
        background: "linear-gradient(180deg, oklch(0.92 0.06 355) 0%, oklch(0.88 0.04 30) 52%, oklch(0.68 0.14 148) 52%, oklch(0.58 0.18 148) 100%)",
      }}
    >
      {/* Clouds */}
      <div className="absolute left-5 top-5 h-6 w-20 rounded-full bg-white/75" style={{ filter: "blur(4px)" }} />
      <div className="absolute right-10 top-7 h-4 w-14 rounded-full bg-white/55" style={{ filter: "blur(3px)" }} />

      {/* Sun */}
      <div className="absolute right-5 top-4 h-9 w-9 rounded-full" style={{
        background: "oklch(0.88 0.12 90)",
        boxShadow: "0 0 16px oklch(0.88 0.12 90 / 0.4)",
      }} />

      {/* Ground texture */}
      <div className="absolute inset-x-0 bottom-0 h-[47%]" style={{
        backgroundImage: "radial-gradient(circle, oklch(0.75 0.14 148 / 0.4) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }} />

      {/* Rival skeleton */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect
          x={bbox.x} y={bbox.y} width={bbox.w} height={bbox.h}
          fill="none" stroke={glowColor} strokeWidth="0.5"
          strokeDasharray="2 2" rx="2" opacity="0.5"
          style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
        />
        {BONES.map(([a, b], i) => {
          const pa = joints[a]; const pb = joints[b];
          return (
            <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={boneColor} strokeWidth="2.6" strokeLinecap="round" opacity="0.95"
              style={{ filter: `drop-shadow(0 0 2px ${boneColor})` }}
            />
          );
        })}
        {jointArr.map((j, i) => (
          <circle key={i} cx={j.x} cy={j.y} r={i === 0 ? 4.5 : 2}
            fill={i === 0 ? "oklch(0.98 0.01 30)" : jointColor}
            stroke={boneColor} strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Scanning chip */}
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm" style={{ border: "1px solid oklch(0.90 0.03 40)" }}>
        <span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.48 0.23 22)", boxShadow: "0 0 6px oklch(0.48 0.23 22)" }} />
        {T.scanning[lang]}
      </div>

      {/* Nameplate */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-full bg-white/85 px-3 py-1 text-xs font-semibold backdrop-blur-sm" style={{ border: "1px solid oklch(0.90 0.03 40)" }}>
        <span>{rivalName}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{rivalRegion}</span>
      </div>
    </div>
  );
}
