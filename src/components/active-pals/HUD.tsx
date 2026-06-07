import { Zap, Flame, Dumbbell, Timer, Target, User, Bot } from "lucide-react";
import type { Lang } from "./i18n";
import { T } from "./i18n";

interface HUDProps {
  lang: Lang;
  accuracy: number;
  streak: number;
  reps: number;
  score: number;
  rivalScore?: number;
  timeLeft?: number;
  label?: string;
}

export function HUD({ lang, accuracy, streak, reps, score, rivalScore, timeLeft, label }: HUDProps) {
  return (
    <div className="chunky space-y-2.5 bg-card p-3">
      {label && (
        <div className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      )}
      <div className="flex gap-2">
        <Stat value={score} label={T.xp[lang]} icon={Zap} color="bg-moss" />
        <Stat value={`×${streak}`} label={T.streak[lang]} icon={Flame} color="bg-lime" />
        <Stat value={reps} label={T.reps[lang]} icon={Dumbbell} color="bg-fern" />
        {typeof timeLeft === "number" && (
          <Stat value={`${timeLeft}s`} label={T.timeLeft[lang]} icon={Timer} color="bg-aqua" />
        )}
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-muted-foreground uppercase tracking-wider">
            <Target size={10} strokeWidth={2.5} /> {T.accuracy[lang]}
          </span>
          <span className="font-bold">{Math.round(accuracy)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${accuracy}%`,
              background: accuracy > 75
                ? "oklch(0.48 0.23 22)"
                : accuracy > 50
                  ? "oklch(0.80 0.12 350)"
                  : "oklch(0.65 0.18 50)",
            }}
          />
        </div>
      </div>
      {typeof rivalScore === "number" && (
        <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <User size={11} strokeWidth={2} /> {T.you[lang]}: {score}
          </span>
          <span className="flex items-center gap-1.5" style={{ color: "oklch(0.50 0.16 22)" }}>
            <Bot size={11} strokeWidth={2} /> {T.rival[lang]}: {rivalScore}
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({
  value, label, icon: Icon, color,
}: {
  value: string | number;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 ${color}`}>
      <Icon size={13} strokeWidth={2.5} className="opacity-60" />
      <span className="display text-lg leading-none">{value}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
