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
    <div className="chunky space-y-2 bg-card p-3">
      {label && (
        <div className="text-center text-xs font-bold uppercase tracking-widest">
          {label}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <Stat value={score} label={T.xp[lang]} tone="primary" />
        <Stat value={`x${streak}`} label={T.streak[lang]} tone="secondary" />
        <Stat value={reps} label={T.reps[lang]} tone="accent" />
        {typeof timeLeft === "number" && (
          <Stat value={`${timeLeft}s`} label={T.timeLeft[lang]} tone="destructive" />
        )}
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span>{T.accuracy[lang]}</span>
          <span>{Math.round(accuracy)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full border-[2px] border-foreground bg-background">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${accuracy}%`,
              background:
                accuracy > 75
                  ? "oklch(0.78 0.17 165)"
                  : accuracy > 50
                    ? "oklch(0.93 0.17 95)"
                    : "oklch(0.72 0.2 5)",
            }}
          />
        </div>
      </div>
      {typeof rivalScore === "number" && (
        <div className="flex items-center justify-between rounded-full border-2 border-foreground bg-background px-3 py-1 text-xs font-bold">
          <span>{T.you[lang]}: {score}</span>
          <span className="text-destructive">{T.rival[lang]}: {rivalScore}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label, tone }: { value: string | number; label: string; tone: "primary" | "secondary" | "accent" | "destructive" }) {
  const bg = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    destructive: "bg-destructive text-destructive-foreground",
  }[tone];
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center rounded-2xl border-[2px] border-foreground ${bg} px-2 py-1`}>
      <span className="display text-lg leading-none">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
}