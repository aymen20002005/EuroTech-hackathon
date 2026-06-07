import { Crown, Flame } from "lucide-react";
import type { Lang } from "./i18n";

interface Player {
  rank: number;
  name: string;
  score: number;
  streak: number;
  avatar: string;
  isMe?: boolean;
}

const BOARD: Player[] = [
  { rank: 1,  name: "Wing Lam",    score: 9840, streak: 42, avatar: "🏆" },
  { rank: 2,  name: "Ka Man",      score: 8920, streak: 35, avatar: "🥈" },
  { rank: 3,  name: "Tsz Ying",    score: 8340, streak: 28, avatar: "🥉" },
  { rank: 4,  name: "Siu Ming",    score: 7880, streak: 21, avatar: "🦅" },
  { rank: 5,  name: "Wai Kei",     score: 7450, streak: 19, avatar: "🐯" },
  { rank: 6,  name: "Mei Yee",     score: 7120, streak: 17, avatar: "🌸" },
  { rank: 7,  name: "Ho Fung",     score: 6890, streak: 15, avatar: "🦁" },
  { rank: 8,  name: "Ka Ling",     score: 6540, streak: 14, avatar: "🐉" },
  { rank: 9,  name: "Chun Ho",     score: 6210, streak: 12, avatar: "⚡" },
  { rank: 10, name: "Nga Ting",    score: 5980, streak: 11, avatar: "🌺" },
  { rank: 11, name: "Lok Yi",      score: 5720, streak: 10, avatar: "🔥" },
  { rank: 12, name: "Pak Hei",     score: 5480, streak: 9,  avatar: "💫" },
  { rank: 13, name: "Ching Man",   score: 5240, streak: 8,  avatar: "🌊" },
  { rank: 14, name: "Sum Yi",      score: 5010, streak: 8,  avatar: "🦋" },
  { rank: 15, name: "Hiu Tung",    score: 4780, streak: 7,  avatar: "⭐" },
  { rank: 16, name: "Yat Long",    score: 4560, streak: 7,  avatar: "🎯" },
  { rank: 17, name: "Sze Man",     score: 4340, streak: 6,  avatar: "🎪" },
  { rank: 18, name: "Ka Wai",      score: 4120, streak: 6,  avatar: "🌙" },
  { rank: 19, name: "Pui Ling",    score: 3910, streak: 5,  avatar: "🍀" },
  { rank: 20, name: "Bik Ha",      score: 3700, streak: 5,  avatar: "🦊" },
  { rank: 21, name: "Chi Wai",     score: 3490, streak: 4,  avatar: "🎭" },
  { rank: 22, name: "Fong Yi",     score: 3280, streak: 4,  avatar: "🎨" },
  { rank: 23, name: "Man Kei",     score: 3080, streak: 4,  avatar: "🌼" },
  { rank: 24, name: "Ho Yee",      score: 2880, streak: 3,  avatar: "🦜" },
  { rank: 25, name: "Shun Hei",    score: 2690, streak: 3,  avatar: "🐧" },
  { rank: 26, name: "Yi Ting",     score: 2500, streak: 3,  avatar: "🌻" },
  { rank: 27, name: "Kin Fung",    score: 2320, streak: 2,  avatar: "🎸" },
  { rank: 28, name: "Hoi Yan",     score: 2140, streak: 2,  avatar: "🐠" },
  { rank: 29, name: "Tsun Ming",   score: 1960, streak: 2,  avatar: "🎮" },
  { rank: 30, name: "You",         score: 1200, streak: 3,  avatar: "🐬", isMe: true },
];

export function LeaderboardScreen({ lang }: { lang: Lang }) {
  const top3 = BOARD.slice(0, 3);
  const rest  = BOARD.slice(3);

  return (
    <div className="pb-6 animate-pop">
      <div className="text-center mb-5">
        <h2 className="display text-2xl">{lang === "en" ? "Top 30 Players" : "前30名玩家"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "en" ? "Move more to climb the ranks!" : "多動才能提高排名！"}
        </p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-6">
        {/* 2nd */}
        <div className="flex flex-col items-center">
          <div className="text-2xl mb-1">{top3[1].avatar}</div>
          <div className="text-[11px] font-semibold text-center leading-tight mb-1 max-w-[72px]">{top3[1].name}</div>
          <div className="w-20 h-16 rounded-t-2xl bg-secondary flex flex-col items-center justify-center shadow-sm">
            <span className="text-lg">🥈</span>
            <span className="text-xs font-bold">{(top3[1].score / 1000).toFixed(1)}k</span>
          </div>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center">
          <Crown size={16} className="text-primary mb-0.5"/>
          <div className="text-2xl mb-1">{top3[0].avatar}</div>
          <div className="text-[11px] font-semibold text-center leading-tight mb-1 max-w-[72px]">{top3[0].name}</div>
          <div className="w-20 h-24 rounded-t-2xl bg-primary flex flex-col items-center justify-center shadow-md">
            <span className="text-lg">🏆</span>
            <span className="text-xs font-bold text-primary-foreground">{(top3[0].score / 1000).toFixed(1)}k</span>
          </div>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center">
          <div className="text-2xl mb-1">{top3[2].avatar}</div>
          <div className="text-[11px] font-semibold text-center leading-tight mb-1 max-w-[72px]">{top3[2].name}</div>
          <div className="w-20 h-12 rounded-t-2xl bg-accent flex flex-col items-center justify-center shadow-sm">
            <span className="text-lg">🥉</span>
            <span className="text-xs font-bold">{(top3[2].score / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>

      {/* List 4–30 */}
      <div className="flex flex-col gap-2">
        {rest.map((p) => (
          <div
            key={p.rank}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${
              p.isMe
                ? "border-primary bg-primary/[0.07] shadow-md"
                : "border-border bg-card"
            }`}
          >
            <span className="w-7 text-center text-sm font-bold text-muted-foreground shrink-0">
              #{p.rank}
            </span>
            <span className="text-2xl shrink-0">{p.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${p.isMe ? "text-primary" : ""}`}>
                {p.name}{p.isMe ? ` (${lang === "en" ? "You" : "你"})` : ""}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame size={10} className="text-primary shrink-0"/>
                {p.streak}{lang === "en" ? "d streak" : "天連勝"}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold">{p.score.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
