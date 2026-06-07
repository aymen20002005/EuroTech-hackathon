import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CameraFeed } from "./CameraFeed";
import { GrabGame } from "./GrabGame";
import { SliceGame } from "./SliceGame";
import { LiftGame } from "./LiftGame";
import { KarateGame } from "./KarateGame";
import { RivalFeed } from "./RivalFeed";
import { HUD } from "./HUD";
import { LANGS, T, type Lang } from "./i18n";
import { CHALLENGES, type ChallengeDef } from "./motions";
import type { ScoreEvent } from "./scoring";

type Screen = "home" | "matchmaking" | "countdown" | "battle" | "report";

type Challenge = ChallengeDef;

const RIVALS = [
  { name: "Kenji 🐉", region: "Hong Kong" },
  { name: "Mei Mei 🌸", region: "Shanghai" },
  { name: "Leo ⚡", region: "Toronto" },
  { name: "Aanya 🌟", region: "Mumbai" },
  { name: "Hiro 🍣", region: "Osaka" },
];

interface Toast {
  id: number;
  text: string;
  tone: "good" | "bad";
  delta?: number;
}

export function ActivePalsApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [screen, setScreen] = useState<Screen>("home");
  const [challenge, setChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [rival] = useState(RIVALS[0]);
  const [rivalIdx, setRivalIdx] = useState(0);

  // Battle state
  const [accuracy, setAccuracy] = useState(85);
  const [streak, setStreak] = useState(0);
  const [reps, setReps] = useState(0);
  const [score, setScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [grade, setGrade] = useState<"excellent" | "poor" | "idle">("idle");
  const [banner, setBanner] = useState<{ text: string; tone: "good" | "bad" } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [stats, setStats] = useState({ form: 0, rhythm: 0, speed: 0 });

  const currentRival = RIVALS[rivalIdx % RIVALS.length] || rival;

  // ---- HOME → MATCHMAKING ----
  function pickChallenge(c: Challenge) {
    setChallenge(c);
    setScreen("matchmaking");
  }

  // Matchmaking auto-advance
  useEffect(() => {
    if (screen !== "matchmaking") return;
    const rotate = window.setInterval(() => setRivalIdx((i) => i + 1), 700);
    const t = window.setTimeout(() => {
      window.clearInterval(rotate);
      setScreen("countdown");
    }, 3200);
    return () => {
      window.clearInterval(rotate);
      window.clearTimeout(t);
    };
  }, [screen]);

  // Countdown
  useEffect(() => {
    if (screen !== "countdown") return;
    setCountdown(3);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          // reset battle
          setAccuracy(85);
          setStreak(0);
          setReps(0);
          setScore(0);
          setRivalScore(0);
          setTimeLeft(challenge.key === "karate" ? 45 : 30);
          setGrade("idle");
          setBanner(null);
          setScreen("battle");
          return 0;
        }
        return c - 1;
      });
    }, 800);
    return () => window.clearInterval(id);
  }, [screen]);

  // Battle ticker
  const tickRef = useRef(0);
  useEffect(() => {
    if (screen !== "battle") return;
    tickRef.current = 0;
    // Rival is still simulated. In the grab/slice mini-games the player scores +1,
    // so the rival earns points more slowly to keep the match competitive.
    const isMiniGame = challenge.key === "grab" || challenge.key === "slice" || challenge.key === "lift" || challenge.key === "karate";
    const rivalId = window.setInterval(
      () => {
        setRivalScore((rs) => rs + (challenge.key === "karate" ? 0 : isMiniGame ? 1 : Math.floor(5 + Math.random() * 9)));
      },
      isMiniGame ? 1500 : 1200,
    );

    const tId = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(tId);
          window.clearInterval(rivalId);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(rivalId);
      window.clearInterval(tId);
    };
  }, [screen, challenge.key]);

  // Real AI score handler — called every frame the pose detector returns keypoints
  const handleScore = useCallback(
    (evt: ScoreEvent) => {
      if (screen !== "battle") return;
      setAccuracy(evt.accuracy);
      setGrade(evt.feedback === "good" ? "excellent" : evt.feedback === "bad" ? "poor" : "idle");
      if (evt.repDelta > 0) {
        const q = evt.repQuality;
        const delta = Math.max(5, Math.round(6 + q / 10));
        setReps((r) => r + evt.repDelta);
        setScore((s) => s + delta * evt.repDelta);
        if (q >= 65) {
          setStreak((s) => s + 1);
          const praise = T[challenge.goodTipKey] ?? T.excellent;
          setBanner({ text: praise[lang], tone: "good" });
          pushToast({ text: `+${delta}`, tone: "good", delta });
        } else {
          setStreak(0);
          const tip = T[challenge.badTipKey] ?? T.faster;
          setBanner({ text: tip[lang], tone: "bad" });
          pushToast({ text: `+${delta}`, tone: "good", delta });
        }
      }
    },
    [screen, challenge.goodTipKey, challenge.badTipKey, lang],
  );

  // Grab mini-game handler — apple = +1 point, pizza = -1 point
  const handleGrab = useCallback(
    (delta: number) => {
      if (screen !== "battle") return;
      if (delta > 0) {
        setScore((s) => s + 1);
        setReps((r) => r + 1);
        setStreak((s) => s + 1);
        setGrade("excellent");
        setAccuracy((a) => Math.min(100, a + 5));
        setBanner({ text: T.grab_good[lang], tone: "good" });
        pushToast({ text: "+1", tone: "good" });
      } else {
        setScore((s) => Math.max(0, s - 1));
        setStreak(0);
        setGrade("poor");
        setAccuracy((a) => Math.max(0, a - 12));
        setBanner({ text: T.grab_bad[lang], tone: "bad" });
        pushToast({ text: "-1", tone: "bad" });
      }
    },
    [screen, lang],
  );

  // Slice mini-game handler — every fruit sliced = +1 point
  const handleSlice = useCallback(
    (_delta: number) => {
      if (screen !== "battle") return;
      setScore((s) => s + 1);
      setReps((r) => r + 1);
      setStreak((s) => s + 1);
      setGrade("excellent");
      setAccuracy((a) => Math.min(100, a + 4));
      setBanner({ text: T.slice_good[lang], tone: "good" });
      pushToast({ text: "+1", tone: "good" });
    },
    [screen, lang],
  );

  // Lift mini-game handler — cleaner/fuller reps score more points
  const handleLift = useCallback(
    (quality: number) => {
      if (screen !== "battle") return;
      const delta = Math.max(1, Math.round(quality / 10));
      setReps((r) => r + 1);
      setScore((s) => s + delta);
      setAccuracy(() => Math.max(0, Math.min(100, quality)));
      if (quality >= 65) {
        setStreak((s) => s + 1);
        setGrade("excellent");
        setBanner({ text: T.lift_good[lang], tone: "good" });
      } else {
        setStreak(0);
        setGrade("poor");
        setBanner({ text: T.lift_bad[lang], tone: "bad" });
      }
      pushToast({ text: `+${delta}`, tone: "good", delta });
    },
    [screen, lang],
  );

  // Karate fight handler — player lands strikes, blocks attacks, takes damage
  const handleKarate = useCallback(
    (evt: { kind: "hit" | "blocked" | "hurt" | "ko-win" | "ko-lose"; magnitude: number }) => {
      if (screen !== "battle") return;
      if (evt.kind === "hit") {
        const delta = Math.max(2, Math.round(evt.magnitude / 3));
        setScore((s) => s + delta);
        setReps((r) => r + 1);
        setStreak((s) => s + 1);
        setGrade("excellent");
        setAccuracy((a) => Math.min(100, a + 4));
        setBanner({ text: T.karate_good[lang], tone: "good" });
        pushToast({ text: `+${delta}`, tone: "good", delta });
      } else if (evt.kind === "blocked") {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        setAccuracy((a) => Math.min(100, a + 6));
        setBanner({ text: T.karate_block[lang], tone: "good" });
        pushToast({ text: "BLOCK", tone: "good" });
      } else if (evt.kind === "hurt") {
        setRivalScore((rs) => rs + Math.max(2, Math.round(evt.magnitude / 3)));
        setStreak(0);
        setGrade("poor");
        setAccuracy((a) => Math.max(0, a - 12));
        setBanner({ text: T.karate_bad[lang], tone: "bad" });
        pushToast({ text: "HIT", tone: "bad" });
      } else if (evt.kind === "ko-win") {
        setScore((s) => s + 25);
        setBanner({ text: T.karate_ko[lang], tone: "good" });
        pushToast({ text: "+25 K.O.", tone: "good", delta: 25 });
      } else if (evt.kind === "ko-lose") {
        setRivalScore((rs) => rs + 25);
        setStreak(0);
        setBanner({ text: T.karate_bad[lang], tone: "bad" });
      }
    },
    [screen, lang],
  );

  // End battle → report
  useEffect(() => {
    if (screen === "battle" && timeLeft === 0) {
      const form = Math.min(100, 60 + Math.round(score / 8));
      const rhythm = Math.min(100, 55 + Math.round(reps * 1.6));
      const speed = Math.min(100, 50 + Math.round(reps * 1.8));
      setStats({ form, rhythm, speed });
      const t = window.setTimeout(() => setScreen("report"), 800);
      return () => window.clearTimeout(t);
    }
  }, [screen, timeLeft, score, reps]);

  function pushToast(t: Omit<Toast, "id">) {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { ...t, id }]);
    window.setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 1200);
  }

  return (
    <div className="min-h-screen px-3 pb-10 pt-4 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <TopBar lang={lang} setLang={setLang} />
        <div className="mt-4">
          {screen === "home" && (
            <HomeScreen lang={lang} onPick={pickChallenge} challenges={CHALLENGES} />
          )}
          {screen === "matchmaking" && (
            <MatchmakingScreen lang={lang} rival={RIVALS[rivalIdx % RIVALS.length]} />
          )}
          {screen === "countdown" && (
            <CountdownScreen lang={lang} value={countdown} />
          )}
          {screen === "battle" && (
            <BattleScreen
              lang={lang}
              accuracy={accuracy}
              streak={streak}
              reps={reps}
              score={score}
              rivalScore={rivalScore}
              timeLeft={timeLeft}
              grade={grade}
              banner={banner}
              toasts={toasts}
              rival={currentRival}
              challenge={challenge}
              onScore={handleScore}
              onGrab={handleGrab}
              onSlice={handleSlice}
              onLift={handleLift}
              onKarate={handleKarate}
            />
          )}
          {screen === "report" && (
            <ReportScreen
              lang={lang}
              score={score}
              rivalScore={rivalScore}
              stats={stats}
              onRematch={() => setScreen("countdown")}
              onHome={() => setScreen("home")}
            />
          )}
        </div>
        <Footer lang={lang} />
      </div>
    </div>
  );
}

/* ============== Sub-screens ============== */

function TopBar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="chunky flex h-11 w-11 items-center justify-center bg-secondary text-2xl">
          🎮
        </div>
        <div>
          <div className="display text-xl leading-none">{T.appName[lang]}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            {T.tagline[lang]}
          </div>
        </div>
      </div>
      <div className="chunky flex overflow-hidden bg-card">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
              lang === l.code ? "bg-primary" : "hover:bg-muted"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function HomeScreen({
  lang,
  challenges,
  onPick,
}: {
  lang: Lang;
  challenges: Challenge[];
  onPick: (c: Challenge) => void;
}) {
  return (
    <div className="space-y-5 animate-pop">
      <div className="chunky relative overflow-hidden bg-primary p-5 sm:p-6">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-secondary opacity-70" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent opacity-70" />
        <div className="relative">
          <div className="inline-block rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            {T.level[lang]} 7 · 1,240 {T.xp[lang]}
          </div>
          <h1 className="display mt-2 text-3xl leading-none sm:text-4xl">
            {T.tagline[lang]}
          </h1>
          <p className="mt-2 max-w-md text-sm font-semibold opacity-90">
            Move. Battle. Level up with real-time AI motion tracking.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="display text-lg">{T.pickChallenge[lang]}</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            {challenges.length} of {challenges.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {challenges.map((c, i) => {
            const colors = ["bg-secondary", "bg-accent", "bg-primary", "bg-destructive text-destructive-foreground"];
            return (
              <button
                key={c.key}
                onClick={() => onPick(c)}
                className={`bubble ${colors[i % colors.length]} p-3 text-left`}
              >
                <div className="text-3xl">{c.emoji}</div>
                <div className="display mt-1.5 text-sm leading-tight">
                  {T[c.labelKey][lang]}
                </div>
                <div className="text-[10px] font-semibold opacity-80">{c.tip}</div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[9px] font-bold uppercase text-foreground">
                  ▶ {T.startChallenge[lang]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="chunky bg-card p-4">
        <div className="display mb-2 text-sm uppercase">Daily Streak 🔥</div>
        <div className="flex gap-2">
          {[1,2,3,4,5,6,7].map((d) => (
            <div key={d} className={`flex h-10 flex-1 items-center justify-center rounded-xl border-2 border-foreground text-xs font-bold ${d <= 4 ? "bg-secondary" : "bg-muted"}`}>
              {d <= 4 ? "✓" : d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchmakingScreen({ lang, rival }: { lang: Lang; rival: { name: string; region: string } }) {
  return (
    <div className="chunky relative overflow-hidden bg-card p-8 text-center animate-pop">
      <div className="absolute inset-x-0 top-0 h-1 animate-scanline bg-primary" />
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-foreground bg-primary animate-wobble">
        <div className="text-5xl">🌏</div>
      </div>
      <h2 className="display mt-5 text-2xl">{T.searching[lang]}</h2>
      <p className="mt-1 text-xs font-semibold opacity-70">
        {T.matchmakingRegion[lang]}
      </p>
      <div className="mx-auto mt-5 flex max-w-xs items-center justify-between gap-2">
        <Avatar emoji="🧒" label={T.you[lang]} tone="primary" />
        <div className="display text-xl">{T.vs[lang]}</div>
        <Avatar emoji="❓" label={rival.name} tone="destructive" sub={rival.region} />
      </div>
      <div className="mt-5 flex justify-center gap-1.5">
        {[0,1,2].map((i) => (
          <span key={i} className="inline-block h-3 w-3 rounded-full bg-foreground" style={{ animation: `pop 0.8s ${i * 0.15}s infinite alternate` }} />
        ))}
      </div>
    </div>
  );
}

function Avatar({ emoji, label, tone, sub }: { emoji: string; label: string; tone: "primary" | "destructive"; sub?: string }) {
  const bg = tone === "primary" ? "bg-primary" : "bg-destructive text-destructive-foreground";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`chunky flex h-16 w-16 items-center justify-center text-3xl ${bg}`}>{emoji}</div>
      <div className="text-xs font-bold">{label}</div>
      {sub && <div className="text-[10px] uppercase tracking-wider opacity-60">{sub}</div>}
    </div>
  );
}

function CountdownScreen({ lang, value }: { lang: Lang; value: number }) {
  return (
    <div className="chunky flex aspect-[4/3] items-center justify-center bg-secondary p-6 text-center">
      <div>
        <div className="display text-sm uppercase tracking-widest">{T.ready[lang]}</div>
        <div key={value} className="display animate-pop text-[120px] leading-none">
          {value > 0 ? value : T.go[lang]}
        </div>
      </div>
    </div>
  );
}

function BattleScreen({
  lang, accuracy, streak, reps, score, rivalScore, timeLeft, grade, banner, toasts, rival, challenge, onScore, onGrab, onSlice, onLift, onKarate,
}: {
  lang: Lang;
  accuracy: number; streak: number; reps: number; score: number; rivalScore: number; timeLeft: number;
  grade: "excellent" | "poor" | "idle";
  banner: { text: string; tone: "good" | "bad" } | null;
  toasts: Toast[];
  rival: { name: string; region: string };
  challenge: Challenge;
  onScore: (e: ScoreEvent) => void;
  onGrab: (delta: number) => void;
  onSlice: (delta: number) => void;
  onLift: (quality: number) => void;
  onKarate: (e: { kind: "hit" | "blocked" | "hurt" | "ko-win" | "ko-lose"; magnitude: number }) => void;
}) {
  const isGrab = challenge.key === "grab";
  const isSlice = challenge.key === "slice";
  const isLift = challenge.key === "lift";
  const isKarate = challenge.key === "karate";
  const leadingYou = score >= rivalScore;
  return (
    <div className="space-y-3 animate-pop">
      <div className="chunky flex items-center justify-between bg-card px-3 py-2 text-xs font-bold">
        <span>{challenge.emoji} {T[challenge.labelKey][lang]}</span>
        <span className={`rounded-full border-2 border-foreground px-2 py-0.5 ${timeLeft <= 5 ? "bg-destructive text-destructive-foreground" : "bg-secondary"}`}>
          ⏱ {timeLeft}s
        </span>
      </div>

      <div className={`grid gap-3 ${isKarate ? "" : "md:grid-cols-2"}`}>
        {/* You */}
        <div className="space-y-2">
          <div className="relative">
            {isGrab ? (
              <GrabGame active lang={lang} onGrab={onGrab} />
            ) : isSlice ? (
              <SliceGame active lang={lang} onSlice={onSlice} />
            ) : isLift ? (
              <LiftGame active lang={lang} onLift={onLift} />
            ) : isKarate ? (
              <KarateGame active lang={lang} onKarate={onKarate} />
            ) : (
              <CameraFeed active lang={lang} challengeKey={challenge.key} onScore={onScore} />
            )}
            {/* floating +N toasts */}
            {toasts.map((t) => (
              <div
                key={t.id}
                className="display pointer-events-none absolute left-1/2 top-1/2 z-10 text-3xl animate-float-up"
                style={{ color: t.tone === "good" ? "oklch(0.78 0.17 165)" : "oklch(0.72 0.2 5)", textShadow: "2px 2px 0 #1a1a2e" }}
              >
                {t.text}
              </div>
            ))}
            {/* banner */}
            {banner && (
              <div
                key={banner.text + score}
                className={`absolute bottom-2 left-2 right-2 rounded-full border-[3px] border-foreground px-3 py-1.5 text-center text-xs font-bold animate-pop ${
                  banner.tone === "good" ? "bg-accent" : "bg-destructive text-destructive-foreground"
                }`}
              >
                {banner.text}
              </div>
            )}
            {leadingYou && (
              <div className="absolute right-2 top-2 rounded-full border-2 border-foreground bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">👑 LEAD</div>
            )}
          </div>
          <HUD lang={lang} accuracy={accuracy} streak={streak} reps={reps} score={score} label={T.you[lang]} />
        </div>

        {/* Rival (skeleton feed hidden for karate — opponent lives inside the dojo canvas) */}
        <div className="space-y-2">
          {!isKarate && (
            <div className="relative">
              <RivalFeed active lang={lang} rivalName={rival.name} rivalRegion={rival.region} challengeKey={challenge.key} speed={challenge.speed} />
              {!leadingYou && (
                <div className="absolute right-2 top-2 rounded-full border-2 border-foreground bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">👑 LEAD</div>
              )}
            </div>
          )}
          <HUD
            lang={lang}
            accuracy={Math.min(100, 60 + (rivalScore % 35))}
            streak={Math.floor(rivalScore / 30)}
            reps={Math.floor(rivalScore / 12)}
            score={rivalScore}
            label={isKarate ? rival.name : T.rival[lang]}
            timeLeft={timeLeft}
          />
        </div>
      </div>
    </div>
  );
}

function ReportScreen({
  lang, score, rivalScore, stats, onRematch, onHome,
}: {
  lang: Lang; score: number; rivalScore: number;
  stats: { form: number; rhythm: number; speed: number };
  onRematch: () => void; onHome: () => void;
}) {
  const youWon = score > rivalScore;
  const draw = score === rivalScore;
  const rank = useMemo(() => {
    const avg = (stats.form + stats.rhythm + stats.speed) / 3;
    if (avg >= 85) return { letter: "S", label: "Mastery", bg: "bg-accent" };
    if (avg >= 70) return { letter: "A", label: "Great", bg: "bg-secondary" };
    if (avg >= 55) return { letter: "B", label: "Solid", bg: "bg-primary" };
    return { letter: "C", label: "Keep going", bg: "bg-destructive text-destructive-foreground" };
  }, [stats]);

  return (
    <div className="space-y-4 animate-pop">
      <div className={`chunky flex items-center justify-between bg-secondary p-4`}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{T.verdict[lang]}</div>
          <div className="display text-3xl leading-none">
            {draw ? T.draw[lang] : youWon ? T.win[lang] : T.lose[lang]}
          </div>
          <div className="text-xs font-bold">
            {T.you[lang]} {score} · {T.rival[lang]} {rivalScore}
          </div>
        </div>
        <div className={`chunky flex h-20 w-20 items-center justify-center ${rank.bg}`}>
          <div className="text-center">
            <div className="display text-3xl leading-none">{rank.letter}</div>
            <div className="text-[9px] font-bold uppercase">{rank.label}</div>
          </div>
        </div>
      </div>

      <div className="chunky space-y-3 bg-card p-4">
        <Bar label={T.formAccuracy[lang]} value={stats.form} tone="oklch(0.78 0.17 165)" />
        <Bar label={T.rhythm[lang]} value={stats.rhythm} tone="oklch(0.78 0.14 230)" />
        <Bar label={T.speed[lang]} value={stats.speed} tone="oklch(0.93 0.17 95)" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={onRematch} className="bubble bg-accent p-4 text-left">
          <div className="text-3xl">🔁</div>
          <div className="display mt-1 text-lg">{T.rematch[lang]}</div>
          <div className="text-[11px] font-semibold opacity-70">Same rival, new round.</div>
        </button>
        <button onClick={onHome} className="bubble bg-primary p-4 text-left">
          <div className="text-3xl">🏠</div>
          <div className="display mt-1 text-lg">{T.home[lang]}</div>
          <div className="text-[11px] font-semibold opacity-70">Pick a new challenge.</div>
        </button>
      </div>
    </div>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full border-[2px] border-foreground bg-background">
        <div className="h-full transition-all" style={{ width: `${value}%`, background: tone }} />
      </div>
    </div>
  );
}

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest opacity-50">
      © ActivePals AI · {lang.toUpperCase()} · Built for active kids 🌟
    </footer>
  );
}