import { useEffect, useRef, useState } from "react";
import type { Lang } from "./i18n";
import { T } from "./i18n";
import { KP, usePoseDetection } from "./poseDetector";

interface Props {
  active: boolean;
  lang: Lang;
  /** Fired when the player lands a hit (positive) or takes a hit (negative).
   *  `magnitude` is the damage dealt; KO bonus is a larger value. */
  onKarate: (event: { kind: "hit" | "blocked" | "hurt" | "ko-win" | "ko-lose"; magnitude: number }) => void;
}

type OppState = "idle" | "telegraph" | "strike" | "recover" | "stunned" | "ko";
type AttackKind = "punch" | "kick";

const TELEGRAPH_MS = 1100;
const STRIKE_MS = 220;
const RECOVER_MS = 700;
const STUN_MS = 750;
const PLAYER_COOLDOWN_MS = 280;
// All thresholds below are expressed as multiples of the user's shoulder span
// so detection scales with how close the player stands to the camera.
const PUNCH_VEL_MULT = 1.8;       // shoulder-spans / second (lowered for responsiveness)
const PUNCH_EXT_MULT = 0.45;      // wrist must reach this far past shoulder center
const PUNCH_REARM_MULT = 0.3;     // must return inside this to re-arm
const KICK_LIFT_MULT = 0.45;      // ankle lifted vs hip, relative to torso height
const KICK_REARM_MULT = 0.2;
const BLOCK_HOLD_MS = 140;

export function KarateGame({ active, lang, onKarate }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // webcam setup (same pattern as SliceGame)
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

  /**
   * Edge-triggered player action detector.
   *
   * - `punch` / `kick` fire exactly once per stroke (the limb must "re-arm"
   *   back near rest before another event can register).
   * - `blocking` becomes true only after the guard pose is held for
   *   BLOCK_HOLD_MS, killing flicker from MoveNet noise.
   * - All distance thresholds are scaled to the player's shoulder span and
   *   torso height, so a kid standing close or far works the same.
   */
  const playerRef = useRef({
    punchEvent: false,
    kickEvent: false,
    blocking: false,
  });
  const detectorRef = useRef({
    lArmed: true,
    rArmed: true,
    lKickArmed: true,
    rKickArmed: true,
    blockStartTs: 0,
    prev: { lx: 0, ly: 0, rx: 0, ry: 0, ts: 0, hasL: false, hasR: false },
  });

  useEffect(() => {
    if (!keypoints || size.w <= 0 || size.h <= 0) return;
    const now = performance.now();
    const lW = keypoints[KP.lWrist];
    const rW = keypoints[KP.rWrist];
    const lS = keypoints[KP.lShoulder];
    const rS = keypoints[KP.rShoulder];
    const nose = keypoints[KP.nose];
    const lH = keypoints[KP.lHip];
    const rH = keypoints[KP.rHip];
    const lA = keypoints[KP.lAnkle];
    const rA = keypoints[KP.rAnkle];
    const ok = (k?: { score?: number }) => !!k && (k.score ?? 0) > 0.25;

    // Require both shoulders to have a stable scale reference
    if (!ok(lS) || !ok(rS)) return;
    const shoulderSpan = Math.max(20, Math.hypot(lS!.x - rS!.x, lS!.y - rS!.y));
    const shCenterX = (lS!.x + rS!.x) / 2;
    const shCenterY = (lS!.y + rS!.y) / 2;
    const hipY = ok(lH) && ok(rH) ? (lH!.y + rH!.y) / 2 : shCenterY + shoulderSpan * 1.4;
    const torso = Math.max(40, hipY - shCenterY);

    const d = detectorRef.current;
    const dt = d.prev.ts ? Math.max(0.001, (now - d.prev.ts) / 1000) : 0.016;

    let punchEvent = false;
    let kickEvent = false;

    // --- Punch: per-wrist edge trigger ---
    const checkPunch = (
      w: typeof lW,
      armed: "lArmed" | "rArmed",
      prevX: "lx" | "rx",
      prevY: "ly" | "ry",
      has: "hasL" | "hasR",
    ) => {
      if (!ok(w)) { d.prev[has] = false; return false; }
      const ext = Math.abs(w!.x - shCenterX) / shoulderSpan;
      const aboveBelt = w!.y < hipY - shoulderSpan * 0.2;
      let v = 0;
      if (d.prev[has]) {
        v = Math.hypot(w!.x - d.prev[prevX], w!.y - d.prev[prevY]) / dt / shoulderSpan;
      }
      d.prev[prevX] = w!.x; d.prev[prevY] = w!.y; d.prev[has] = true;
      // Re-arm when wrist returns close to body
      if (ext < PUNCH_REARM_MULT) d[armed] = true;
      // Fire when armed + extended fast + above belt
      if (d[armed] && aboveBelt && ext > PUNCH_EXT_MULT && v > PUNCH_VEL_MULT) {
        d[armed] = false;
        return true;
      }
      return false;
    };
    if (checkPunch(lW, "lArmed", "lx", "ly", "hasL")) punchEvent = true;
    if (checkPunch(rW, "rArmed", "rx", "ry", "hasR")) punchEvent = true;
    d.prev.ts = now;

    // --- Kick: per-ankle edge trigger (lift / drop) ---
    const checkKick = (a: typeof lA, armed: "lKickArmed" | "rKickArmed") => {
      if (!ok(a) || !ok(lH) || !ok(rH)) return false;
      const lift = (hipY - a!.y) / torso; // positive when ankle is above hip
      if (lift < KICK_REARM_MULT) d[armed] = true;
      if (d[armed] && lift > KICK_LIFT_MULT) {
        d[armed] = false;
        return true;
      }
      return false;
    };
    if (checkKick(lA, "lKickArmed")) kickEvent = true;
    if (checkKick(rA, "rKickArmed")) kickEvent = true;

    // --- Block: guard held for BLOCK_HOLD_MS ---
    let blocking = false;
    if (ok(lW) && ok(rW) && ok(nose)) {
      const guardTop = nose!.y - shoulderSpan * 0.3;
      const guardBot = shCenterY + shoulderSpan * 0.4;
      const inBand = (y: number) => y > guardTop && y < guardBot;
      const wristsClose = Math.abs(lW!.x - rW!.x) < shoulderSpan * 1.6;
      const inGuard = inBand(lW!.y) && inBand(rW!.y) && wristsClose;
      if (inGuard) {
        if (!d.blockStartTs) d.blockStartTs = now;
        blocking = now - d.blockStartTs >= BLOCK_HOLD_MS;
      } else {
        d.blockStartTs = 0;
      }
    } else {
      d.blockStartTs = 0;
    }

    if (punchEvent) playerRef.current.punchEvent = true;
    if (kickEvent) playerRef.current.kickEvent = true;
    playerRef.current.blocking = blocking;
  }, [keypoints, size]);


  // Opponent state machine + HP
  const [opp, setOpp] = useState<{ state: OppState; attack: AttackKind; until: number }>({
    state: "idle", attack: "punch", until: 0,
  });
  const oppRef = useRef(opp);
  oppRef.current = opp;

  const [playerHP, setPlayerHP] = useState(100);
  const [oppHP, setOppHP] = useState(100);
  const playerHPRef = useRef(100);
  const oppHPRef = useRef(100);
  playerHPRef.current = playerHP;
  oppHPRef.current = oppHP;

  const onKarateRef = useRef(onKarate);
  useEffect(() => { onKarateRef.current = onKarate; }, [onKarate]);

  // floating effects
  const [fx, setFx] = useState<{ id: number; text: string; tone: "good" | "bad" | "warn"; x: number; y: number }[]>([]);
  const fxId = useRef(1);
  function pushFx(text: string, tone: "good" | "bad" | "warn", x = 50, y = 50) {
    const id = fxId.current++;
    setFx((f) => [...f, { id, text, tone, x, y }]);
    window.setTimeout(() => setFx((f) => f.filter((e) => e.id !== id)), 900);
  }

  const lastPlayerHitTs = useRef(0);
  const lastStrikeResolvedRef = useRef(0);

  // Main game loop
  useEffect(() => {
    if (!active || !ready) return;
    let mounted = true;
    let raf = 0;

    const loop = () => {
      if (!mounted) return;
      const now = performance.now();
      const o = oppRef.current;
      const p = playerRef.current;

      // Opponent FSM transitions
      if (o.state !== "ko") {
        if (now >= o.until) {
          if (o.state === "idle") {
            const attack: AttackKind = Math.random() < 0.55 ? "punch" : "kick";
            const next = { state: "telegraph" as OppState, attack, until: now + TELEGRAPH_MS };
            setOpp(next); oppRef.current = next;
          } else if (o.state === "telegraph") {
            const next = { state: "strike" as OppState, attack: o.attack, until: now + STRIKE_MS };
            setOpp(next); oppRef.current = next;
            lastStrikeResolvedRef.current = 0;
          } else if (o.state === "strike") {
            // Strike resolved automatically if not already
            if (!lastStrikeResolvedRef.current) {
              if (p.blocking) {
                pushFx("BLOCK!", "good", 50, 55);
                onKarateRef.current({ kind: "blocked", magnitude: 0 });
              } else {
                const dmg = 12;
                setPlayerHP((hp) => Math.max(0, hp - dmg));
                pushFx("-12 HP", "bad", 30, 50);
                onKarateRef.current({ kind: "hurt", magnitude: dmg });
                lastPlayerHitTs.current = now;
              }
            }
            const next = { state: "recover" as OppState, attack: o.attack, until: now + RECOVER_MS };
            setOpp(next); oppRef.current = next;
          } else if (o.state === "recover" || o.state === "stunned") {
            const idleFor = 350 + Math.random() * 450;
            const next = { state: "idle" as OppState, attack: o.attack, until: now + idleFor };
            setOpp(next); oppRef.current = next;
          }
        } else if (o.state === "strike" && !lastStrikeResolvedRef.current && p.blocking) {
          // Early block during strike window
          lastStrikeResolvedRef.current = now;
          pushFx("BLOCK!", "good", 50, 55);
          onKarateRef.current({ kind: "blocked", magnitude: 0 });
        }
      }

      // Player attacks → land on opponent if opponent is OPEN
      // Player attacks ALWAYS land unless opponent is already KO.
      // Even during his strike window, your hit interrupts him — no more "he blocks everything".
      const canAttack = now - lastPlayerHitTs.current > PLAYER_COOLDOWN_MS;

      // Consume one-shot attack events so each gesture fires exactly once
      const attacked = p.punchEvent || p.kickEvent;
      const wasKick = p.kickEvent;
      p.punchEvent = false;
      p.kickEvent = false;

      if (canAttack && attacked && oppRef.current.state !== "ko") {
        const isKick = wasKick;
        const dmg = isKick ? 14 : 9;
        const newHP = Math.max(0, oppHPRef.current - dmg);
        setOppHP(newHP);
        oppHPRef.current = newHP;
        pushFx(isKick ? `KICK! -${dmg}` : `PUNCH! -${dmg}`, "good", 75, 45);
        onKarateRef.current({ kind: "hit", magnitude: dmg });
        lastPlayerHitTs.current = now;
        // Cancel any pending attack and stun him
        const next = { state: "stunned" as OppState, attack: oppRef.current.attack, until: now + STUN_MS };
        setOpp(next); oppRef.current = next;
        if (newHP <= 0) {
          const ko = { state: "ko" as OppState, attack: oppRef.current.attack, until: Number.POSITIVE_INFINITY };
          setOpp(ko); oppRef.current = ko;
          pushFx("K.O.!", "good", 50, 35);
          onKarateRef.current({ kind: "ko-win", magnitude: 25 });
        }
      }

      // Player KO check
      if (playerHPRef.current <= 0 && oppRef.current.state !== "ko") {
        const ko = { state: "idle" as OppState, attack: "punch" as AttackKind, until: now + 9999 };
        setOpp(ko); oppRef.current = ko;
        pushFx("DOWN!", "bad", 30, 35);
        onKarateRef.current({ kind: "ko-lose", magnitude: 25 });
        // respawn after a moment
        window.setTimeout(() => {
          setPlayerHP(50);
          playerHPRef.current = 50;
        }, 800);
      }

      // Respawn opponent after KO so the round keeps going
      if (oppRef.current.state === "ko" && oppHPRef.current <= 0) {
        window.setTimeout(() => {
          setOppHP(70);
          oppHPRef.current = 70;
          const next = { state: "idle" as OppState, attack: "punch" as AttackKind, until: performance.now() + 700 };
          setOpp(next); oppRef.current = next;
        }, 900);
        // Prevent retrigger
        oppHPRef.current = 1;
      }

      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    // Kick off first attack
    const next = { state: "idle" as OppState, attack: "punch" as AttackKind, until: performance.now() + 1200 };
    setOpp(next); oppRef.current = next;

    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
    };
  }, [active, ready]);

  // Visual: opponent pose & color cues
  const oppPose = getOpponentPose(opp.state, opp.attack);
  const ringHue = opp.state === "telegraph"
    ? "oklch(0.93 0.17 95)"
    : opp.state === "strike"
      ? "oklch(0.72 0.2 5)"
      : opp.state === "ko"
        ? "oklch(0.55 0.18 25)"
        : "oklch(0.78 0.17 165)";

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        style={{ transform: "scaleX(-1)" }}
      />
      {/* dojo overlay tint */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.2 0.05 260 / 0.45) 0%, oklch(0.2 0.05 260 / 0.05) 35%, oklch(0.2 0.05 260 / 0.55) 100%)",
        }}
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

      {ready && (
        <>
          {/* HP bars */}
          <div className="absolute left-2 right-2 top-2 grid grid-cols-2 gap-2">
            <HPBar label={T.you[lang]} hp={playerHP} tone="oklch(0.78 0.17 165)" />
            <HPBar label="SENSEI" hp={oppHP} tone="oklch(0.72 0.2 5)" rtl />
          </div>

          {/* Opponent karateka */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="oppGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ringHue} stopOpacity="0.55" />
                <stop offset="100%" stopColor={ringHue} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* glow ring under opponent */}
            <ellipse cx="80" cy="95" rx="14" ry="2" fill="url(#oppGlow)" />
            <Karateka pose={oppPose} state={opp.state} />
            {/* telegraph warning */}
            {opp.state === "telegraph" && (
              <g>
                <circle cx="80" cy="52" r="14" fill="none" stroke={ringHue} strokeWidth="0.8" strokeDasharray="2 1.5">
                  <animate attributeName="r" from="14" to="20" dur="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </svg>

          {/* Action overlay: BLOCK / ATTACK prompt */}
          {opp.state === "telegraph" && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground bg-secondary px-4 py-1.5 text-center text-xs font-bold uppercase tracking-widest animate-pop">
              {opp.attack === "punch" ? `🥊 ${T.karate_block[lang]}` : `🦵 ${T.karate_block[lang]}`}
            </div>
          )}
          {(opp.state === "stunned" || opp.state === "recover") && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest animate-pop">
              {T.karate_strike[lang]}
            </div>
          )}
          {opp.state === "ko" && (
            <div className="pointer-events-none absolute inset-x-3 top-1/3 rounded-2xl border-[3px] border-foreground bg-accent px-4 py-2 text-center text-2xl font-bold animate-pop">
              {T.karate_ko[lang]}
            </div>
          )}

          {/* Floating fx */}
          {fx.map((e) => (
            <div
              key={e.id}
              className="display pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-float-up text-2xl"
              style={{
                left: `${e.x}%`,
                top: `${e.y}%`,
                color:
                  e.tone === "good"
                    ? "oklch(0.78 0.17 165)"
                    : e.tone === "warn"
                      ? "oklch(0.93 0.17 95)"
                      : "oklch(0.72 0.2 5)",
                textShadow: "2px 2px 0 #1a1a2e",
              }}
            >
              {e.text}
            </div>
          ))}

          {/* status chip */}
          <div className="absolute left-2 bottom-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: ringHue, boxShadow: `0 0 6px ${ringHue}` }} />
            {status === "ready" ? "AI DOJO" : T.scanning[lang]}
          </div>

          {/* intro hint */}
          <div className="absolute inset-x-2 bottom-2 ml-24 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider">
            {T.karate_intro[lang]}
          </div>
        </>
      )}
    </div>
  );
}

function HPBar({ label, hp, tone, rtl }: { label: string; hp: number; tone: string; rtl?: boolean }) {
  return (
    <div className={`chunky bg-background px-2 py-1 ${rtl ? "text-right" : ""}`}>
      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
        <span>{label}</span>
        <span>{hp} HP</span>
      </div>
      <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full border-2 border-foreground bg-muted">
        <div
          className="h-full transition-[width] duration-200"
          style={{ width: `${hp}%`, background: tone, marginLeft: rtl ? `${100 - hp}%` : 0 }}
        />
      </div>
    </div>
  );
}

/* ---------- Opponent fighter (SVG karateka) ----------
 *
 * Stance is a classic karate kamae — opponent stands on the right side of the
 * canvas facing the player on the left. Joints are stored as a single pose
 * object so the same renderer handles every animation state.
 */

interface OPose {
  head: { x: number; y: number };
  body: { x: number; y: number };
  hip: { x: number; y: number };
  /** Front (lead) hand — the one closer to the player */
  fHand: { x: number; y: number };
  /** Rear (chamber) hand */
  rHand: { x: number; y: number };
  fKnee: { x: number; y: number };
  rKnee: { x: number; y: number };
  fFoot: { x: number; y: number };
  rFoot: { x: number; y: number };
}

function getOpponentPose(state: OppState, attack: AttackKind): OPose {
  // Base kamae — anchored to the right of the canvas (hipX ≈ 80)
  const base: OPose = {
    head:  { x: 80, y: 40 },
    body:  { x: 80, y: 56 },
    hip:   { x: 80, y: 70 },
    fHand: { x: 73, y: 58 }, // lead guard
    rHand: { x: 85, y: 64 }, // rear chamber
    fKnee: { x: 75, y: 81 },
    rKnee: { x: 86, y: 82 },
    fFoot: { x: 72, y: 93 },
    rFoot: { x: 90, y: 94 },
  };

  if (state === "telegraph") {
    if (attack === "punch") {
      // wind-up: rear hand cocked back high
      base.rHand = { x: 92, y: 50 };
      base.body.x = 82;
      base.head.x = 82;
    } else {
      // raise rear knee
      base.rKnee = { x: 84, y: 66 };
      base.rFoot = { x: 86, y: 74 };
      base.body.y = 54;
    }
  } else if (state === "strike") {
    if (attack === "punch") {
      // straight cross toward player
      base.rHand = { x: 55, y: 54 };
      base.fHand = { x: 78, y: 60 };
      base.body.x = 76;
      base.head.x = 78;
    } else {
      // front kick: front leg extends toward the player
      base.fFoot = { x: 48, y: 60 };
      base.fKnee = { x: 64, y: 68 };
      base.body.x = 82;
      base.body.y = 58;
      base.rHand = { x: 86, y: 56 };
      base.fHand = { x: 78, y: 64 };
    }
  } else if (state === "stunned") {
    base.head = { x: 82, y: 43 };
    base.fHand = { x: 72, y: 64 };
    base.rHand = { x: 88, y: 66 };
  } else if (state === "ko") {
    base.head  = { x: 58, y: 84 };
    base.body  = { x: 68, y: 86 };
    base.hip   = { x: 78, y: 88 };
    base.fHand = { x: 52, y: 88 };
    base.rHand = { x: 76, y: 84 };
    base.fKnee = { x: 84, y: 88 };
    base.rKnee = { x: 88, y: 87 };
    base.fFoot = { x: 92, y: 88 };
    base.rFoot = { x: 94, y: 86 };
  }
  return base;
}

function Karateka({ pose, state }: { pose: OPose; state: OppState }) {
  const giLight = "oklch(0.98 0.005 90)";
  const giShade = "oklch(0.88 0.01 80)";
  const giDeep  = "oklch(0.78 0.015 70)";
  const belt    = "oklch(0.45 0.18 28)";   // crimson black-belt energy
  const beltEdge= "oklch(0.32 0.14 28)";
  const skin    = "oklch(0.86 0.05 70)";
  const skinShade = "oklch(0.74 0.06 50)";
  const hair    = "oklch(0.22 0.04 280)";
  const outline = "oklch(0.18 0.04 270)";

  const shake = state === "stunned" ? "translate(0.5, -0.2) rotate(-1.5, 80, 70)" : undefined;
  const ko = state === "ko";

  // helpers
  const limb = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    color: string,
    w = 3.6,
  ) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );

  return (
    <g transform={shake}>
      <defs>
        <linearGradient id="giGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={giLight} />
          <stop offset="60%" stopColor={giLight} />
          <stop offset="100%" stopColor={giShade} />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        <linearGradient id="beltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={belt} />
          <stop offset="100%" stopColor={beltEdge} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      {!ko && (
        <ellipse cx={pose.hip.x + 1} cy="95" rx="11" ry="1.4" fill="oklch(0.15 0.03 270 / 0.55)" />
      )}

      {/* legs (gi pants) — drawn before torso so torso sits on top */}
      {limb(pose.hip, pose.fKnee, giShade, 5)}
      {limb(pose.fKnee, pose.fFoot, giShade, 4.6)}
      {limb(pose.hip, pose.rKnee, giDeep, 5)}
      {limb(pose.rKnee, pose.rFoot, giDeep, 4.6)}
      {/* bare feet */}
      <ellipse cx={pose.fFoot.x} cy={pose.fFoot.y} rx="2.4" ry="1.1" fill={skin} stroke={outline} strokeWidth="0.4" />
      <ellipse cx={pose.rFoot.x} cy={pose.rFoot.y} rx="2.4" ry="1.1" fill={skinShade} stroke={outline} strokeWidth="0.4" />

      {/* torso (kimono with cross-lapel) */}
      <path
        d={`M ${pose.body.x - 8.5} ${pose.body.y - 7}
            Q ${pose.body.x} ${pose.body.y - 9} ${pose.body.x + 8.5} ${pose.body.y - 7}
            L ${pose.hip.x + 7.5} ${pose.hip.y + 1}
            Q ${pose.hip.x} ${pose.hip.y + 2.5} ${pose.hip.x - 7.5} ${pose.hip.y + 1} Z`}
        fill="url(#giGrad)"
        stroke={outline}
        strokeWidth="0.5"
      />
      {/* kimono lapel V */}
      <path
        d={`M ${pose.body.x - 8} ${pose.body.y - 6.5}
            L ${pose.body.x} ${pose.hip.y - 3}
            L ${pose.body.x + 8} ${pose.body.y - 6.5}`}
        fill="none"
        stroke={giDeep}
        strokeWidth="0.7"
      />
      <path
        d={`M ${pose.body.x - 8} ${pose.body.y - 6.5}
            L ${pose.body.x + 1.5} ${pose.hip.y - 1}
            L ${pose.body.x + 8} ${pose.body.y - 6.5} Z`}
        fill={giShade}
        opacity="0.55"
      />

      {/* belt + knot + tails */}
      <rect
        x={pose.hip.x - 8.5}
        y={pose.hip.y - 1.8}
        width="17"
        height="3.2"
        fill="url(#beltGrad)"
        stroke={outline}
        strokeWidth="0.4"
        rx="0.6"
      />
      <rect
        x={pose.hip.x - 2.6}
        y={pose.hip.y - 2.6}
        width="5.2"
        height="4.8"
        fill={belt}
        stroke={outline}
        strokeWidth="0.4"
        rx="0.8"
      />
      <rect x={pose.hip.x - 2.3} y={pose.hip.y + 1.4} width="1.8" height="4.5" fill={belt} stroke={outline} strokeWidth="0.3" rx="0.4" />
      <rect x={pose.hip.x + 0.6} y={pose.hip.y + 1.4} width="1.8" height="5.2" fill={beltEdge} stroke={outline} strokeWidth="0.3" rx="0.4" />

      {/* arms (gi sleeves) — shoulder anchors derived from body */}
      {limb({ x: pose.body.x - 7, y: pose.body.y - 5 }, pose.fHand, giShade, 4.4)}
      {limb({ x: pose.body.x + 7, y: pose.body.y - 5 }, pose.rHand, giDeep, 4.4)}
      {/* wrist cuffs */}
      <circle cx={pose.fHand.x} cy={pose.fHand.y} r="2.4" fill={giLight} stroke={outline} strokeWidth="0.5" />
      <circle cx={pose.rHand.x} cy={pose.rHand.y} r="2.4" fill={giLight} stroke={outline} strokeWidth="0.5" />
      {/* fists */}
      <circle cx={pose.fHand.x} cy={pose.fHand.y} r="1.8" fill="url(#skinGrad)" stroke={outline} strokeWidth="0.4" />
      <circle cx={pose.rHand.x} cy={pose.rHand.y} r="1.8" fill="url(#skinGrad)" stroke={outline} strokeWidth="0.4" />

      {/* neck */}
      <rect x={pose.head.x - 1.6} y={pose.head.y + 3.5} width="3.2" height="2.4" fill={skinShade} />

      {/* head */}
      <circle cx={pose.head.x} cy={pose.head.y} r="5" fill="url(#skinGrad)" stroke={outline} strokeWidth="0.55" />
      {/* hair: top tuft + sideburn */}
      <path
        d={`M ${pose.head.x - 4.6} ${pose.head.y - 1.5}
            Q ${pose.head.x - 3.2} ${pose.head.y - 6} ${pose.head.x} ${pose.head.y - 5.2}
            Q ${pose.head.x + 3.8} ${pose.head.y - 5.6} ${pose.head.x + 4.7} ${pose.head.y - 0.8}
            Q ${pose.head.x + 2.8} ${pose.head.y - 2.4} ${pose.head.x - 1.2} ${pose.head.y - 2.4}
            Q ${pose.head.x - 3.8} ${pose.head.y - 1.6} ${pose.head.x - 4.6} ${pose.head.y - 1.5} Z`}
        fill={hair}
      />
      {/* hachimaki (headband) with knot */}
      <rect x={pose.head.x - 4.8} y={pose.head.y - 1} width="9.6" height="1.5" fill={belt} stroke={outline} strokeWidth="0.35" />
      <rect x={pose.head.x + 4} y={pose.head.y - 0.6} width="2.2" height="0.7" fill={beltEdge} />
      <rect x={pose.head.x + 4.4} y={pose.head.y + 0.5} width="0.6" height="2.2" fill={belt} />

      {/* eyes */}
      {!ko ? (
        <>
          <ellipse cx={pose.head.x - 1.5} cy={pose.head.y + 1.6} rx="0.55" ry="0.7" fill={outline} />
          <ellipse cx={pose.head.x + 1.5} cy={pose.head.y + 1.6} rx="0.55" ry="0.7" fill={outline} />
          {/* angry brows */}
          <line x1={pose.head.x - 2.6} y1={pose.head.y + 0.5} x2={pose.head.x - 0.7} y2={pose.head.y + 1.2} stroke={outline} strokeWidth="0.65" strokeLinecap="round" />
          <line x1={pose.head.x + 2.6} y1={pose.head.y + 0.5} x2={pose.head.x + 0.7} y2={pose.head.y + 1.2} stroke={outline} strokeWidth="0.65" strokeLinecap="round" />
          {/* mouth */}
          <line x1={pose.head.x - 1.2} y1={pose.head.y + 3.2} x2={pose.head.x + 1.2} y2={pose.head.y + 3.2} stroke={outline} strokeWidth="0.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <text x={pose.head.x - 2.4} y={pose.head.y + 2.4} fontSize="2.4" fill={outline} fontWeight="bold">×</text>
          <text x={pose.head.x + 0.4} y={pose.head.y + 2.4} fontSize="2.4" fill={outline} fontWeight="bold">×</text>
          <path d={`M ${pose.head.x - 1.2} ${pose.head.y + 3.6} Q ${pose.head.x} ${pose.head.y + 4.5} ${pose.head.x + 1.2} ${pose.head.y + 3.6}`} stroke={outline} strokeWidth="0.5" fill="none" />
        </>
      )}

      {/* state-specific spark/impact lines */}
      {state === "strike" && (
        <g opacity="0.9">
          <line x1="48" y1="55" x2="42" y2="52" stroke="oklch(0.93 0.17 95)" strokeWidth="1" strokeLinecap="round" />
          <line x1="48" y1="58" x2="44" y2="60" stroke="oklch(0.93 0.17 95)" strokeWidth="1" strokeLinecap="round" />
          <line x1="50" y1="56" x2="46" y2="56" stroke="oklch(0.99 0 0)" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

