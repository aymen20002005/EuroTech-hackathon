import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Trophy, Flame, Crown, RotateCcw, Home, Bell, X,
  User, HelpCircle, Check, Timer, Globe, ChevronRight, Swords,
  Gem, ShoppingBag, Gamepad2,
} from "lucide-react";
import { FaDumbbell, FaRunning, FaStar, FaFire, FaMountain, FaWalking, FaShieldAlt, FaSkating, FaHandPaper } from "react-icons/fa";
import { GiBoxingGlove, GiMuscleUp, GiCartwheel, GiWeightLiftingUp, GiKatana, GiFruitBowl, GiSwordClash } from "react-icons/gi";
import type { IconType } from "react-icons";
import { CameraFeed } from "./CameraFeed";
import { GrabGame } from "./GrabGame";
import { KarateGame } from "./KarateGame";
import { LiftGame } from "./LiftGame";
import { SliceGame } from "./SliceGame";
import { RivalFeed } from "./RivalFeed";
import { HUD } from "./HUD";
import { DolphinMascot, getDolphinMood } from "./DolphinMascot";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { ShopScreen } from "./ShopScreen";
import type { ShopItem } from "./ShopScreen";
import { LANGS, T, type Lang } from "./i18n";
import { CHALLENGES, type ChallengeDef } from "./motions";
import type { ScoreEvent } from "./scoring";

type Screen    = "home" | "matchmaking" | "countdown" | "battle" | "report";
type MainTab   = "dolphin" | "games" | "leaderboard" | "shop";
type Challenge = ChallengeDef;

const HK_GRAD = "linear-gradient(135deg, oklch(0.40 0.24 22) 0%, oklch(0.55 0.18 355) 100%)";

const RIVALS = [
  { name: "Kenji",  region: "Hong Kong" },
  { name: "Mei Mei",region: "Shanghai"  },
  { name: "Leo",    region: "Toronto"   },
  { name: "Aanya",  region: "Mumbai"    },
  { name: "Hiro",   region: "Osaka"     },
];

interface Toast { id: number; text: string; tone: "good" | "bad"; delta?: number }

/* ══════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════ */

export function ActivePalsApp() {
  const [lang, setLang]       = useState<Lang>("en");
  const [screen, setScreen]   = useState<Screen>("home");
  const [mainTab, setMainTab] = useState<MainTab>("dolphin");
  const [challenge, setChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [rivalIdx, setRivalIdx]   = useState(0);

  /* battle state */
  const [accuracy,   setAccuracy]   = useState(85);
  const [streak,     setStreak]     = useState(0);
  const [reps,       setReps]       = useState(0);
  const [score,      setScore]      = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(30);
  const [grade,      setGrade]      = useState<"excellent" | "poor" | "idle">("idle");
  const [banner,     setBanner]     = useState<{ text: string; tone: "good" | "bad" } | null>(null);
  const [toasts,     setToasts]     = useState<Toast[]>([]);
  const [countdown,  setCountdown]  = useState(3);
  const [stats,      setStats]      = useState({ form: 0, rhythm: 0, speed: 0 });

  /* global player state */
  const [totalScore,        setTotalScore]        = useState(0);
  const [diamonds,          setDiamonds]          = useState(340);
  const dayStreak                                  = 3; // demo value
  const myRank                                     = 30;
  const [equippedAccessory, setEquippedAccessory] = useState<string | null>(null);
  const [ownedAccessories,  setOwnedAccessories]  = useState<string[]>([]);

  /* notifications */
  const [showNotif,    setShowNotif]    = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime,    setNotifTime]    = useState("09:00");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window) setNotifEnabled(Notification.permission === "granted");
    const saved = localStorage.getItem("zw_notify_time");
    if (saved) setNotifTime(saved);
  }, []);

  useEffect(() => {
    if (!notifEnabled) return;
    const id = setInterval(() => {
      const now = new Date();
      const cur = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      if (cur !== notifTime) return;
      const today = now.toDateString();
      const last  = localStorage.getItem("zw_last_notif");
      if (last === today) return;
      localStorage.setItem("zw_last_notif", today);
      new Notification("ZaoWay — Time to Move! 🐬", {
        body: "Your dolphin is waiting! Roll out of bed and start playing.",
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [notifEnabled, notifTime]);

  /* ── matchmaking / countdown / battle timers ── */
  const currentRival = RIVALS[rivalIdx % RIVALS.length];
  function pickChallenge(c: Challenge) { setChallenge(c); setScreen("matchmaking"); }

  useEffect(() => {
    if (screen !== "matchmaking") return;
    const rot = window.setInterval(() => setRivalIdx((i) => i + 1), 700);
    const t   = window.setTimeout(() => { window.clearInterval(rot); setScreen("countdown"); }, 3200);
    return () => { window.clearInterval(rot); window.clearTimeout(t); };
  }, [screen]);

  useEffect(() => {
    if (screen !== "countdown") return;
    setCountdown(3);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          setAccuracy(85); setStreak(0); setReps(0); setScore(0);
          setRivalScore(0); setTimeLeft(30); setGrade("idle"); setBanner(null);
          setScreen("battle"); return 0;
        }
        return c - 1;
      });
    }, 800);
    return () => window.clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== "battle") return;
    const rivalId = window.setInterval(() => setRivalScore((rs) => rs + Math.floor(5 + Math.random() * 9)), 1200);
    const tId     = window.setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { window.clearInterval(tId); window.clearInterval(rivalId); return 0; } return t - 1; });
    }, 1000);
    return () => { window.clearInterval(rivalId); window.clearInterval(tId); };
  }, [screen]);

  const handleScore = useCallback((evt: ScoreEvent) => {
    if (screen !== "battle") return;
    setAccuracy(evt.accuracy);
    setGrade(evt.feedback === "good" ? "excellent" : evt.feedback === "bad" ? "poor" : "idle");
    if (evt.repDelta > 0) {
      const q     = evt.repQuality;
      const delta = Math.max(5, Math.round(6 + q / 10));
      setReps((r)  => r + evt.repDelta);
      setScore((s) => s + delta * evt.repDelta);
      setTotalScore((ts) => Math.min(ts + Math.round(q * 0.5), 200));
      if (q >= 65) {
        setStreak((s) => s + 1);
        setBanner({ text: (T[challenge.goodTipKey] ?? T.excellent)[lang], tone: "good" });
        pushToast({ text: `+${delta}`, tone: "good", delta });
      } else {
        setStreak(0);
        setBanner({ text: (T[challenge.badTipKey] ?? T.faster)[lang], tone: "bad" });
        pushToast({ text: `+${delta}`, tone: "good", delta });
      }
    }
  }, [screen, challenge.goodTipKey, challenge.badTipKey, lang]);

  const tickRef = useRef(0); void tickRef;
  useEffect(() => {
    if (screen === "battle" && timeLeft === 0) {
      const form   = Math.min(100, 60 + Math.round(score / 8));
      const rhythm = Math.min(100, 55 + Math.round(reps * 1.6));
      const speed  = Math.min(100, 50 + Math.round(reps * 1.8));
      setStats({ form, rhythm, speed });
      setDiamonds((d) => d + Math.max(5, Math.floor(score / 10)));
      const t = window.setTimeout(() => setScreen("report"), 800);
      return () => window.clearTimeout(t);
    }
  }, [screen, timeLeft, score, reps]);

  function pushToast(t: Omit<Toast, "id">) {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { ...t, id }]);
    window.setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 1200);
  }

  const inBattle = screen !== "home";

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto w-full max-w-3xl px-3 sm:px-6">
        <TopBar lang={lang} setLang={setLang} diamonds={diamonds} onBell={() => setShowNotif(true)}/>

        <div className="mt-5">
          {inBattle ? (
            <>
              {screen === "matchmaking" && <MatchmakingScreen lang={lang} rival={currentRival}/>}
              {screen === "countdown"   && <CountdownScreen lang={lang} value={countdown}/>}
              {screen === "battle" && (
                <BattleScreen
                  lang={lang} accuracy={accuracy} streak={streak} reps={reps}
                  score={score} rivalScore={rivalScore} timeLeft={timeLeft}
                  grade={grade} banner={banner} toasts={toasts}
                  rival={currentRival} challenge={challenge} onScore={handleScore}
                />
              )}
              {screen === "report" && (
                <ReportScreen
                  lang={lang} score={score} rivalScore={rivalScore} stats={stats}
                  onRematch={() => setScreen("countdown")}
                  onHome={() => { setScreen("home"); setMainTab("games"); }}
                />
              )}
            </>
          ) : (
            <>
              {mainTab === "dolphin" && (
                <DolphinHome
                  lang={lang} totalScore={totalScore} dayStreak={dayStreak}
                  diamonds={diamonds} myRank={myRank} equippedAccessory={equippedAccessory}
                  onPlay={() => setMainTab("games")}
                />
              )}
              {mainTab === "games" && (
                <GamesScreen lang={lang} challenges={CHALLENGES} dayStreak={dayStreak} onPick={pickChallenge}/>
              )}
              {mainTab === "leaderboard" && <LeaderboardScreen lang={lang}/>}
              {mainTab === "shop" && (
                <ShopScreen
                  lang={lang} diamonds={diamonds}
                  ownedItems={ownedAccessories} equippedItem={equippedAccessory}
                  onBuy={(item: ShopItem) => {
                    setDiamonds((d) => d - item.price);
                    setOwnedAccessories((prev) => [...prev, item.id]);
                    setEquippedAccessory(item.id);
                  }}
                  onEquip={(id) => setEquippedAccessory(id)}
                />
              )}
            </>
          )}
        </div>
        <Footer lang={lang}/>
      </div>

      {/* Fixed bottom nav (home screens only) */}
      {!inBattle && <BottomNav tab={mainTab} setTab={setMainTab} lang={lang}/>}

      {/* Notification modal */}
      {showNotif && (
        <NotifModal
          lang={lang} notifTime={notifTime} notifEnabled={notifEnabled}
          onSave={async (time, want) => {
            if (want && "Notification" in window) {
              const perm    = await Notification.requestPermission();
              const granted = perm === "granted";
              setNotifEnabled(granted);
              if (granted) { localStorage.setItem("zw_notify_time", time); setNotifTime(time); }
            } else {
              setNotifEnabled(false);
            }
            setShowNotif(false);
          }}
          onClose={() => setShowNotif(false)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DOLPHIN HOME
══════════════════════════════════════════════ */

const MOOD_LABEL: Record<string, Record<Lang, string>> = {
  sleeping: { en: "Zzz… wake me up!",       "zh-HK": "你還沒動過！",     "zh-CN": "你还没动过！"   },
  sad:      { en: "Come on, let's move !",    "zh-HK": "加油！動一動吧",   "zh-CN": "加油！动一动吧" },
  neutral:  { en: "Not bad, keep going !",    "zh-HK": "還不錯，繼續！",   "zh-CN": "还不错，继续！" },
  happy:    { en: "Looking great today !",    "zh-HK": "今日好棒！",       "zh-CN": "今天很棒！"     },
  excited:  { en: "ON FIRE ! INCREDIBLE !", "zh-HK": "超厲害！繼續燃燒！","zh-CN": "超厉害！继续燃烧！" },
};

function DolphinHome({
  lang, totalScore, dayStreak, diamonds, myRank, equippedAccessory, onPlay,
}: {
  lang: Lang; totalScore: number; dayStreak: number; diamonds: number; myRank: number;
  equippedAccessory: string | null; onPlay: () => void;
}) {
  const mood   = getDolphinMood(totalScore);

  return (
    <div className="flex flex-col items-center pb-4 animate-pop">
      <div className="w-full text-center mb-2">
        <h2 className="display text-2xl">{T.bodyToday[lang]}</h2>
      </div>

      {/* Pink dolphin mascot */}
      <DolphinMascot mood={mood} accessory={equippedAccessory} size={220}/>

      {/* Mood chip */}
      <div className={`mt-2 mb-5 px-5 py-2 rounded-full text-sm font-bold ${
        mood === "excited" ? "bg-primary text-primary-foreground"
        : mood === "happy" ? "bg-accent text-accent-foreground"
        : mood === "sleeping" || mood === "sad" ? "bg-muted text-muted-foreground"
        : "bg-secondary text-secondary-foreground"
      }`}>
        {MOOD_LABEL[mood]?.[lang] ?? ""}
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 mb-5 w-full">
        {([
          { Icon: Flame,  value: `${dayStreak}d`, label: lang === "en" ? "Streak"   : "連勝" },
          { Icon: Gem,    value: diamonds,         label: lang === "en" ? "Diamonds" : "鑽石" },
          { Icon: Trophy, value: `#${myRank}`,     label: lang === "en" ? "Rank"     : "排名" },
        ] as const).map(({ Icon, value, label }) => (
          <div key={label} className="flex-1 chunky bg-card flex flex-col items-center py-3 gap-0.5">
            <Icon size={18} className="text-primary" strokeWidth={2}/>
            <span className="text-xl font-bold">{value}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Activity + streak week */}
      <div className="w-full chunky bg-card p-4 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">{lang === "en" ? "Today's Activity" : "今日活動"}</span>
          <span className="text-xs text-muted-foreground">{Math.min(totalScore, 100)} / 100 pts</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, totalScore)}%`,
              background: totalScore >= 80 ? "oklch(0.48 0.23 22)"
                : totalScore >= 50 ? "oklch(0.87 0.10 350)"
                : "oklch(0.75 0.08 40)",
            }}
          />
        </div>
        <div className="flex gap-1.5">
          {[1,2,3,4,5,6,7].map((d) => (
            <div key={d} className={`flex-1 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
              d <= dayStreak ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"
            }`}>
              {d <= dayStreak ? <Check size={12} strokeWidth={3}/> : d}
            </div>
          ))}
        </div>
      </div>

      {/* Play CTA */}
      <button
        onClick={onPlay}
        className="w-full py-4 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        style={{ background: HK_GRAD }}
      >
        {lang === "en" ? "Start Moving" : "開始活動"}
        <ChevronRight size={22} strokeWidth={3}/>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   BOTTOM NAV
══════════════════════════════════════════════ */

function BottomNav({ tab, setTab, lang }: { tab: MainTab; setTab: (t: MainTab) => void; lang: Lang }) {
  const tabs = [
    { id: "dolphin"     as MainTab, Icon: Home,        label: lang === "en" ? "Home"  : "主頁" },
    { id: "games"       as MainTab, Icon: Gamepad2,    label: lang === "en" ? "Games" : "遊戲" },
    { id: "leaderboard" as MainTab, Icon: Trophy,      label: lang === "en" ? "Ranks" : "排名" },
    { id: "shop"        as MainTab, Icon: ShoppingBag, label: lang === "en" ? "Shop"  : "商店" },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border flex z-40">
      {tabs.map(({ id, Icon, label }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
            tab === id ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Icon size={22} strokeWidth={tab === id ? 2.5 : 1.8}/>
          <span className="text-[10px] font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ══════════════════════════════════════════════
   NOTIFICATION MODAL
══════════════════════════════════════════════ */

function NotifModal({ lang, notifTime, notifEnabled, onSave, onClose }: {
  lang: Lang; notifTime: string; notifEnabled: boolean;
  onSave: (time: string, enabled: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const [time, setTime] = useState(notifTime);
  const [want, setWant] = useState(notifEnabled);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="display text-xl flex items-center gap-2">
            <Bell size={20} className="text-primary"/>
            {lang === "en" ? "Daily Reminder" : "每日提醒"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary">
            <span className="text-sm font-semibold">
              {lang === "en" ? "Enable reminders" : "開啟提醒"}
            </span>
            <button
              onClick={() => setWant(!want)}
              className={`w-12 h-6 rounded-full transition-colors ${want ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${want ? "translate-x-6" : "translate-x-0"}`}/>
            </button>
          </div>

          {/* Time picker */}
          {want && (
            <div className="p-3 rounded-2xl bg-secondary">
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold block mb-1.5">
                {lang === "en" ? "Reminder time" : "提醒時間"}
              </label>
              <input
                type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full bg-card rounded-xl px-3 py-2 text-lg font-bold border border-border text-center"
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {lang === "en"
              ? "Works when ZaoWay is open in your browser."
              : "在瀏覽器開啟時生效。"}
          </p>

          <button
            onClick={() => onSave(time, want)}
            className="w-full py-3 rounded-2xl text-white font-bold shadow"
            style={{ background: HK_GRAD }}
          >
            {lang === "en" ? "Save" : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TOP BAR
══════════════════════════════════════════════ */

function TopBar({ lang, setLang, diamonds, onBell }: {
  lang: Lang; setLang: (l: Lang) => void; diamonds: number; onBell: () => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-md"
          style={{ background: HK_GRAD }}
        >
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
            {/*
              ∞ sign: 4 cubic bezier arcs, G1-smooth at every joint.
              Right loop: (20,20)→(34,20) upper, (34,20)→(20,20) lower.
              Left loop:  (20,20)→(6,20)  upper, (6,20)→(20,20)  lower.
              All tip tangents are vertical (0,±7); center tangents are (±2,∓7).
            */}
            <path
              d="M 20 20 C 22 13 34 13 34 20 C 34 27 22 27 20 20 C 18 13 6 13 6 20 C 6 27 18 27 20 20 Z"
              fill="none"
              stroke="white"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="display text-xl leading-none">{T.appName[lang]}</div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{T.tagline[lang]}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold shadow-sm">
          <Gem size={12} className="text-primary" strokeWidth={2.5}/>
          <span>{diamonds}</span>
        </div>
        <button
          onClick={onBell}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card shadow-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Bell size={16} strokeWidth={2}/>
        </button>
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
          {LANGS.map((l) => (
            <button
              key={l.code} onClick={() => setLang(l.code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                lang === l.code ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════
   GAMES SCREEN
══════════════════════════════════════════════ */

const CARD_COLORS = ["bg-moss","bg-fern","bg-lime","bg-aqua"];

const CHALLENGE_ICONS: Record<string, IconType> = {
  jacks: GiCartwheel, squat: FaDumbbell, punch: GiBoxingGlove,
  highKnees: FaRunning, pushup: GiMuscleUp, star: FaStar,
  plank: FaShieldAlt, burpee: FaFire, lunge: FaWalking,
  climbers: FaMountain, toeTouch: FaHandPaper, skater: FaSkating,
  karate: GiKatana, grab: GiFruitBowl, slice: GiSwordClash, lift: GiWeightLiftingUp,
};

function ChallengeIcon({ challengeKey, size = 36, className = "text-primary" }: { challengeKey: string; size?: number; className?: string }) {
  const Icon = CHALLENGE_ICONS[challengeKey];
  if (!Icon) return null;
  return <Icon size={size} className={className}/>;
}

function GamesScreen({ lang, challenges, dayStreak, onPick }: { lang: Lang; challenges: Challenge[]; dayStreak: number; onPick: (c: Challenge) => void }) {
  const streakBadge = T.dayStreakBadge[lang].replace("{n}", String(dayStreak));
  const heroLines   = T.rollOutOfBed[lang].split("\n");

  return (
    <div className="space-y-5 animate-pop">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg sm:p-8" style={{ background: HK_GRAD }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}/>
        <div className="relative text-white">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Gem size={11} strokeWidth={2.5}/> {T.diamonds[lang]} · {T.level[lang]} 7
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Trophy size={11} strokeWidth={2.5}/> {streakBadge}
            </div>
          </div>
          <h1 className="display mt-3 text-3xl leading-tight sm:text-4xl">
            {heroLines.map((line, i) => (
              <span key={i}>{line}{i < heroLines.length - 1 && <br/>}</span>
            ))}
          </h1>
          <p className="mt-2 max-w-sm text-sm font-medium opacity-75">
            {T.gameSubtitle[lang]}
          </p>
        </div>
      </div>

      {/* Games grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="display text-base">{T.pickChallenge[lang]}</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {challenges.length} games
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {challenges.map((c, i) => {
            const dur = /\d+/.exec(c.tip)?.[0] ?? "30";
            return (
              <button key={c.key} onClick={() => onPick(c)} className={`bubble ${CARD_COLORS[i % CARD_COLORS.length]} p-4 text-left`}>
                <div className="flex h-10 items-center">
                  <ChallengeIcon challengeKey={c.key} size={34}/>
                </div>
                <div className="display mt-2 text-sm leading-tight">{T[c.labelKey][lang]}</div>
                <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  {T[c.labelKey][lang]} · {dur}{T.sec[lang]}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-primary">
                  <ChevronRight size={11} strokeWidth={3}/> {T.startChallenge[lang]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly streak */}
      <div className="chunky bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Flame size={16} className="text-primary"/> {T.dailyActivity[lang]}
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5,6,7].map((d) => (
            <div key={d} className={`flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all ${
              d <= dayStreak ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"
            }`}>
              {d <= dayStreak ? <Check size={14} strokeWidth={3}/> : d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MATCHMAKING
══════════════════════════════════════════════ */

function MatchmakingScreen({ lang, rival }: { lang: Lang; rival: { name: string; region: string } }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 text-center shadow-xl animate-pop" style={{ background: HK_GRAD }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }}/>
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm animate-wobble"
        style={{ boxShadow: "0 0 0 8px oklch(1 0 0 / 0.06)" }}>
        <Globe size={42} className="text-white" strokeWidth={1.5}/>
      </div>
      <h2 className="display mt-6 text-2xl text-white">{T.searching[lang]}</h2>
      <p className="mt-1 text-xs font-medium text-white/60">{T.matchmakingRegion[lang]}</p>
      <div className="mx-auto mt-6 flex max-w-xs items-center justify-between gap-4">
        <PlayerChip label={T.you[lang]} icon={User}/>
        <div className="flex flex-col items-center gap-2">
          <Swords size={18} className="text-white/50" strokeWidth={1.5}/>
          <div className="flex gap-1.5">
            {[0,1,2].map((i) => (
              <span key={i} className="inline-block h-2 w-2 rounded-full bg-white/40"
                style={{ animation: `pop 0.8s ${i * 0.15}s infinite alternate` }}/>
            ))}
          </div>
        </div>
        <PlayerChip label={rival.name} sub={rival.region} icon={HelpCircle}/>
      </div>
    </div>
  );
}

function PlayerChip({ icon: Icon, label, sub }: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string; sub?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
        style={{ border: "1.5px solid oklch(1 0 0 / 0.2)" }}>
        <Icon size={26} className="text-white" strokeWidth={1.5}/>
      </div>
      <div className="text-xs font-semibold text-white">{label}</div>
      {sub && <div className="text-[10px] text-white/50 uppercase tracking-wider">{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════════════ */

function CountdownScreen({ lang, value }: { lang: Lang; value: number }) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl" style={{ background: HK_GRAD }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}/>
      <div className="relative text-center text-white">
        <div className="text-sm font-semibold uppercase tracking-widest opacity-60">{T.ready[lang]}</div>
        <div key={value} className="display animate-bounce-in text-[120px] leading-none">
          {value > 0 ? value : T.go[lang]}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   BATTLE SCREEN
══════════════════════════════════════════════ */

function BattleScreen({
  lang, accuracy, streak, reps, score, rivalScore, timeLeft,
  grade: _grade, banner, toasts, rival, challenge, onScore,
}: {
  lang: Lang; accuracy: number; streak: number; reps: number; score: number;
  rivalScore: number; timeLeft: number; grade: "excellent" | "poor" | "idle";
  banner: { text: string; tone: "good" | "bad" } | null;
  toasts: Toast[]; rival: { name: string; region: string };
  challenge: Challenge; onScore: (e: ScoreEvent) => void;
}) {
  const leadingYou = score >= rivalScore;
  return (
    <div className="space-y-3 animate-pop">
      <div className="chunky flex items-center justify-between bg-card px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-bold">
          <ChallengeIcon challengeKey={challenge.key} size={15} className="text-primary"/>
          {T[challenge.labelKey][lang]}
        </span>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          timeLeft <= 5 ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
        }`}>
          <Timer size={11} strokeWidth={2.5}/> {timeLeft}s
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Player side */}
        <div className="space-y-2">
          <div className="relative">
            {challenge.key === "slice" ? (
              <SliceGame active lang={lang}
                onSlice={(d) => onScore({ repDelta: d, repQuality: 80, accuracy: 80, feedback: "good" })}/>
            ) : challenge.key === "grab" ? (
              <GrabGame active lang={lang}
                onGrab={(d) => onScore({ repDelta: d > 0 ? 1 : 0, repQuality: d > 0 ? 85 : 0, accuracy: d > 0 ? 85 : 30, feedback: d > 0 ? "good" : "bad" })}/>
            ) : challenge.key === "lift" ? (
              <LiftGame active lang={lang}
                onLift={(q) => onScore({ repDelta: 1, repQuality: q, accuracy: q, feedback: q > 60 ? "good" : "bad" })}/>
            ) : challenge.key === "karate" ? (
              <KarateGame active lang={lang}
                onKarate={(evt) => {
                  if (evt.kind === "hit" || evt.kind === "ko-win")
                    onScore({ repDelta: 1, repQuality: Math.min(100, evt.magnitude * 5), accuracy: 85, feedback: "good" });
                  else if (evt.kind === "hurt")
                    onScore({ repDelta: 0, repQuality: 0, accuracy: 30, feedback: "bad" });
                  else if (evt.kind === "blocked")
                    onScore({ repDelta: 0, repQuality: 0, accuracy: 75, feedback: "good" });
                }}/>
            ) : (
              <CameraFeed active lang={lang} challengeKey={challenge.key} onScore={onScore}/>
            )}

            {toasts.map((t) => (
              <div key={t.id}
                className="display pointer-events-none absolute left-1/2 top-1/2 z-10 text-3xl font-black animate-float-up"
                style={{ color: t.tone === "good" ? "oklch(0.48 0.23 22)" : "oklch(0.65 0.18 50)", textShadow: "0 2px 8px oklch(0 0 0 / 0.2)" }}>
                {t.text}
              </div>
            ))}
            {banner && (
              <div key={banner.text + score}
                className={`absolute bottom-2 left-2 right-2 rounded-full border border-white/30 px-3 py-1.5 text-center text-xs font-bold backdrop-blur-sm animate-pop ${
                  banner.tone === "good" ? "bg-primary/90 text-white" : "bg-destructive text-destructive-foreground"
                }`}>
                {banner.text}
              </div>
            )}
            {leadingYou && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm">
                <Crown size={10} strokeWidth={2.5}/> LEAD
              </div>
            )}
          </div>
          <HUD lang={lang} accuracy={accuracy} streak={streak} reps={reps} score={score} label={T.you[lang]}/>
        </div>

        {/* Rival side */}
        <div className="space-y-2">
          <div className="relative">
            <RivalFeed active lang={lang} rivalName={rival.name} rivalRegion={rival.region}
              challengeKey={challenge.key} speed={challenge.speed}/>
            {!leadingYou && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm">
                <Crown size={10} strokeWidth={2.5}/> LEAD
              </div>
            )}
          </div>
          <HUD lang={lang} accuracy={Math.min(100, 60 + (rivalScore % 35))}
            streak={Math.floor(rivalScore / 30)} reps={Math.floor(rivalScore / 12)}
            score={rivalScore} label={T.rival[lang]} timeLeft={timeLeft}/>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORT SCREEN
══════════════════════════════════════════════ */

function ReportScreen({ lang, score, rivalScore, stats, onRematch, onHome }: {
  lang: Lang; score: number; rivalScore: number;
  stats: { form: number; rhythm: number; speed: number };
  onRematch: () => void; onHome: () => void;
}) {
  const youWon = score > rivalScore;
  const draw   = score === rivalScore;

  const rank = useMemo(() => {
    const avg = (stats.form + stats.rhythm + stats.speed) / 3;
    if (avg >= 85) return { letter: "S", labelKey: "rankMastery",   bg: "bg-primary text-primary-foreground" };
    if (avg >= 70) return { letter: "A", labelKey: "rankGreat",     bg: "bg-fern"      };
    if (avg >= 55) return { letter: "B", labelKey: "rankSolid",     bg: "bg-moss"      };
    return              { letter: "C", labelKey: "rankKeepGoing", bg: "bg-secondary" };
  }, [stats]);

  const resultBg = draw
    ? "linear-gradient(135deg, oklch(0.55 0.18 355) 0%, oklch(0.65 0.12 340) 100%)"
    : youWon
      ? HK_GRAD
      : "linear-gradient(135deg, oklch(0.42 0.14 30) 0%, oklch(0.55 0.10 40) 100%)";

  return (
    <div className="space-y-4 animate-pop">
      <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg" style={{ background: resultBg }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}/>
        <div className="relative">
          <div className="text-[10px] font-semibold uppercase tracking-widest opacity-60">{T.verdict[lang]}</div>
          <div className="display mt-1 text-4xl leading-none">
            {draw ? T.draw[lang] : youWon ? T.win[lang] : T.lose[lang]}
          </div>
          <div className="mt-2 text-sm font-medium opacity-75">
            {T.you[lang]} {score} · {T.rival[lang]} {rivalScore}
          </div>
        </div>
      </div>

      <div className="chunky bg-card p-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ${rank.bg}`}>
            <div className="display text-3xl leading-none">{rank.letter}</div>
            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wide opacity-80">{T[rank.labelKey][lang]}</div>
          </div>
          <div className="flex-1 space-y-2.5">
            <Bar label={T.formAccuracy[lang]} value={stats.form}   color="oklch(0.48 0.23 22)"/>
            <Bar label={T.rhythm[lang]}        value={stats.rhythm} color="oklch(0.80 0.12 350)"/>
            <Bar label={T.speed[lang]}         value={stats.speed}  color="oklch(0.65 0.14 350)"/>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={onRematch} className="bubble bg-secondary p-5 text-left">
          <RotateCcw size={28} className="text-primary" strokeWidth={2}/>
          <div className="display mt-2 text-lg">{T.rematch[lang]}</div>
          <div className="mt-0.5 text-xs font-medium text-muted-foreground">{T.sameRivalNew[lang]}</div>
        </button>
        <button onClick={onHome} className="bubble bg-moss p-5 text-left">
          <Home size={28} className="text-primary" strokeWidth={2}/>
          <div className="display mt-2 text-lg">{T.home[lang]}</div>
          <div className="mt-0.5 text-xs font-medium text-muted-foreground">{T.pickNewChallenge[lang]}</div>
        </button>
      </div>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }}/>
      </div>
    </div>
  );
}

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      ZaoWay · {lang.toUpperCase()} · Roll out of bed. Start playing.
    </footer>
  );
}
