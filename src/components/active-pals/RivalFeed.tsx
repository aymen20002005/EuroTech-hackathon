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

/** Simulated rival feed — animated skeleton matched to the current challenge. */
export function RivalFeed({
  active,
  lang,
  rivalName,
  rivalRegion,
  challengeKey,
  speed = 0.2,
}: Props) {
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

  // slight phase offset so rival looks like a separate person
  const t = tick * speed * 0.32 + 1.1;
  const { joints, bbox } = getPose(challengeKey, t);
  const jointArr = Object.values(joints);
  const skin = "oklch(0.93 0.17 95)"; // arcade yellow accent
  const bone = "oklch(0.78 0.17 165)"; // mint

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.78 0.14 230) 0%, oklch(0.78 0.14 230) 55%, oklch(0.2 0.05 260) 55%, oklch(0.2 0.05 260) 100%)",
      }}
    >
      {/* arcade grid floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 22px, oklch(0.78 0.17 165 / 0.25) 22px 24px), repeating-linear-gradient(0deg, transparent 0 22px, oklch(0.78 0.17 165 / 0.25) 22px 24px)",
        }}
      />
      {/* sun */}
      <div className="absolute right-6 top-4 h-12 w-12 rounded-full border-[3px] border-foreground bg-destructive" />

      {/* rival skeleton */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect
          x={bbox.x}
          y={bbox.y}
          width={bbox.w}
          height={bbox.h}
          fill="none"
          stroke={bone}
          strokeWidth="0.6"
          strokeDasharray="2 1.5"
          rx="2"
          style={{ filter: `drop-shadow(0 0 4px ${bone})` }}
        />
        {BONES.map(([a, b], i) => {
          const pa = joints[a];
          const pb = joints[b];
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={skin}
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.95"
            />
          );
        })}
        {jointArr.map((j, i) => (
          <circle
            key={i}
            cx={j.x}
            cy={j.y}
            r={i === 0 ? 4 : 1.8}
            fill={i === 0 ? "#FEE2C0" : skin}
            stroke="#1a1a2e"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* scanning chip */}
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        <span
          className="relative inline-flex h-2 w-2 rounded-full bg-accent"
          style={{ boxShadow: "0 0 6px oklch(0.78 0.17 165)" }}
        />
        {T.scanning[lang]}
      </div>

      {/* nameplate */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-full border-2 border-foreground bg-background px-3 py-1 text-xs font-bold">
        <span>{rivalName}</span>
        <span className="text-[10px] uppercase opacity-70">{rivalRegion}</span>
      </div>
    </div>
  );
}