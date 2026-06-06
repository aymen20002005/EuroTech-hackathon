export type ChallengeKey =
  | "jacks"
  | "squat"
  | "punch"
  | "highKnees"
  | "pushup"
  | "star"
  | "plank"
  | "burpee"
  | "lunge"
  | "climbers"
  | "toeTouch"
  | "skater";

export interface Pt { x: number; y: number }
export interface JointSet {
  head: Pt; sL: Pt; sR: Pt;
  hL: Pt; hR: Pt; hip: Pt;
  kL: Pt; kR: Pt; fL: Pt; fR: Pt;
}
export interface Pose {
  joints: JointSet;
  bbox: { x: number; y: number; w: number; h: number };
}

/**
 * Deterministic 2D pose generator. Each challenge produces an exercise-accurate
 * skeleton animation cycle as a function of `time` (radians) so it can be reused
 * for both the live camera overlay and the rival's simulated feed.
 */
export function getPose(key: ChallengeKey, time: number): Pose {
  const t = time;
  const s = Math.sin(t);

  // Neutral standing pose
  let head: Pt = { x: 50, y: 20 };
  let sL: Pt = { x: 40, y: 34 };
  let sR: Pt = { x: 60, y: 34 };
  let hL: Pt = { x: 32, y: 52 };
  let hR: Pt = { x: 68, y: 52 };
  let hip: Pt = { x: 50, y: 58 };
  let kL: Pt = { x: 46, y: 74 };
  let kR: Pt = { x: 54, y: 74 };
  let fL: Pt = { x: 45, y: 90 };
  let fR: Pt = { x: 55, y: 90 };

  switch (key) {
    case "jacks": {
      const up = (s + 1) / 2; // 0..1
      hL = { x: 26 - up * 8, y: 52 - up * 40 };
      hR = { x: 74 + up * 8, y: 52 - up * 40 };
      const spread = up * 10;
      fL = { x: 44 - spread, y: 90 };
      fR = { x: 56 + spread, y: 90 };
      kL = { x: 46 - spread * 0.6, y: 74 };
      kR = { x: 54 + spread * 0.6, y: 74 };
      head = { x: 50, y: 20 - up * 4 };
      hip = { x: 50, y: 58 - up * 4 };
      break;
    }
    case "star": {
      const up = (s + 1) / 2;
      hL = { x: 16 - up * 4, y: 50 - up * 42 };
      hR = { x: 84 + up * 4, y: 50 - up * 42 };
      fL = { x: 38 - up * 14, y: 90 };
      fR = { x: 62 + up * 14, y: 90 };
      kL = { x: 44 - up * 9, y: 74 };
      kR = { x: 56 + up * 9, y: 74 };
      head = { x: 50, y: 18 - up * 8 };
      hip = { x: 50, y: 56 - up * 8 };
      break;
    }
    case "squat": {
      const down = (s + 1) / 2;
      const drop = down * 14;
      head = { x: 50, y: 20 + drop };
      sL = { x: 40, y: 34 + drop };
      sR = { x: 60, y: 34 + drop };
      hip = { x: 50, y: 58 + drop };
      kL = { x: 42, y: 74 };
      kR = { x: 58, y: 74 };
      hL = { x: 38, y: 50 + drop * 0.7 };
      hR = { x: 62, y: 50 + drop * 0.7 };
      break;
    }
    case "punch": {
      const right = s > 0;
      hL = right ? { x: 36, y: 44 } : { x: 18, y: 38 };
      hR = right ? { x: 82, y: 38 } : { x: 64, y: 44 };
      head = { x: 50 + (right ? 2 : -2), y: 22 };
      hip = { x: 50 + (right ? -2 : 2), y: 58 };
      break;
    }
    case "highKnees": {
      const leftUp = s > 0;
      if (leftUp) {
        kL = { x: 48, y: 54 };
        fL = { x: 49, y: 66 };
      } else {
        kR = { x: 52, y: 54 };
        fR = { x: 51, y: 66 };
      }
      hL = leftUp ? { x: 36, y: 32 } : { x: 28, y: 56 };
      hR = leftUp ? { x: 72, y: 56 } : { x: 64, y: 32 };
      head = { x: 50, y: 20 - Math.abs(s) * 2 };
      break;
    }
    case "pushup": {
      const down = (s + 1) / 2;
      const y = 56 + down * 10;
      head = { x: 16, y: y - 4 };
      sL = { x: 28, y };
      sR = { x: 30, y: y + 2 };
      hip = { x: 58, y: y + 2 };
      kL = { x: 72, y: y + 4 };
      kR = { x: 74, y: y + 6 };
      fL = { x: 88, y: y + 6 };
      fR = { x: 90, y: y + 8 };
      hL = { x: 26, y: 82 };
      hR = { x: 34, y: 82 };
      break;
    }
    case "plank": {
      const sway = s * 0.6;
      const y = 62 + sway;
      head = { x: 16, y: y - 4 };
      sL = { x: 28, y };
      sR = { x: 30, y: y + 2 };
      hip = { x: 58, y: y + 2 };
      kL = { x: 72, y: y + 4 };
      kR = { x: 74, y: y + 6 };
      fL = { x: 88, y: y + 6 };
      fR = { x: 90, y: y + 8 };
      hL = { x: 26, y: 82 };
      hR = { x: 34, y: 82 };
      break;
    }
    case "burpee": {
      const phase = Math.floor(((((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 4);
      if (phase === 0) {
        // standing — defaults
      } else if (phase === 1) {
        const drop = 14;
        head = { x: 50, y: 20 + drop };
        sL = { x: 40, y: 34 + drop };
        sR = { x: 60, y: 34 + drop };
        hip = { x: 50, y: 58 + drop };
        hL = { x: 40, y: 66 };
        hR = { x: 60, y: 66 };
        kL = { x: 42, y: 74 }; kR = { x: 58, y: 74 };
      } else if (phase === 2) {
        const y = 68;
        head = { x: 16, y: y - 4 };
        sL = { x: 28, y }; sR = { x: 30, y: y + 2 };
        hip = { x: 58, y: y + 2 };
        kL = { x: 72, y: y + 4 }; kR = { x: 74, y: y + 6 };
        fL = { x: 88, y: y + 6 }; fR = { x: 90, y: y + 8 };
        hL = { x: 26, y: 82 }; hR = { x: 34, y: 82 };
      } else {
        head = { x: 50, y: 12 };
        sL = { x: 40, y: 26 }; sR = { x: 60, y: 26 };
        hip = { x: 50, y: 50 };
        hL = { x: 30, y: 10 }; hR = { x: 70, y: 10 };
        kL = { x: 46, y: 68 }; kR = { x: 54, y: 68 };
        fL = { x: 45, y: 84 }; fR = { x: 55, y: 84 };
      }
      break;
    }
    case "lunge": {
      const left = s > 0;
      if (left) {
        fL = { x: 30, y: 90 }; kL = { x: 36, y: 70 };
        fR = { x: 64, y: 90 }; kR = { x: 60, y: 78 };
        hip = { x: 48, y: 64 };
      } else {
        fR = { x: 70, y: 90 }; kR = { x: 64, y: 70 };
        fL = { x: 36, y: 90 }; kL = { x: 40, y: 78 };
        hip = { x: 52, y: 64 };
      }
      head = { x: hip.x, y: 26 };
      sL = { x: hip.x - 10, y: 40 }; sR = { x: hip.x + 10, y: 40 };
      hL = { x: hip.x - 12, y: 58 }; hR = { x: hip.x + 12, y: 58 };
      break;
    }
    case "climbers": {
      const y = 64;
      head = { x: 16, y: y - 4 };
      sL = { x: 28, y }; sR = { x: 30, y: y + 2 };
      hip = { x: 58, y: y + 2 };
      hL = { x: 26, y: 82 }; hR = { x: 34, y: 82 };
      if (s > 0) {
        kL = { x: 48, y: 64 }; fL = { x: 46, y: 74 };
        kR = { x: 74, y: y + 6 }; fR = { x: 90, y: y + 8 };
      } else {
        kR = { x: 50, y: 64 }; fR = { x: 48, y: 74 };
        kL = { x: 74, y: y + 6 }; fL = { x: 90, y: y + 8 };
      }
      break;
    }
    case "toeTouch": {
      const left = s > 0;
      head = { x: 50, y: 44 };
      sL = { x: 42, y: 50 }; sR = { x: 58, y: 50 };
      hip = { x: 50, y: 60 };
      if (left) {
        hL = { x: 30, y: 34 };
        hR = { x: 46, y: 86 };
      } else {
        hR = { x: 70, y: 34 };
        hL = { x: 54, y: 86 };
      }
      kL = { x: 46, y: 74 }; kR = { x: 54, y: 74 };
      fL = { x: 44, y: 90 }; fR = { x: 56, y: 90 };
      break;
    }
    case "skater": {
      const right = s > 0;
      const shift = right ? 10 : -10;
      head = { x: 50 + shift, y: 22 };
      sL = { x: 40 + shift, y: 36 };
      sR = { x: 60 + shift, y: 36 };
      hip = { x: 50 + shift, y: 60 };
      if (right) {
        kR = { x: 60, y: 74 }; fR = { x: 62, y: 90 };
        kL = { x: 42, y: 72 }; fL = { x: 28, y: 86 };
      } else {
        kL = { x: 40, y: 74 }; fL = { x: 38, y: 90 };
        kR = { x: 58, y: 72 }; fR = { x: 72, y: 86 };
      }
      hL = { x: hip.x - 14, y: 50 };
      hR = { x: hip.x + 14, y: 50 };
      break;
    }
  }

  const xs = [head.x, sL.x, sR.x, hL.x, hR.x, hip.x, kL.x, kR.x, fL.x, fR.x];
  const ys = [head.y, sL.y, sR.y, hL.y, hR.y, hip.y, kL.y, kR.y, fL.y, fR.y];
  const minX = Math.min(...xs) - 4;
  const minY = Math.min(...ys) - 4;
  const maxX = Math.max(...xs) + 4;
  const maxY = Math.max(...ys) + 4;
  return {
    joints: { head, sL, sR, hL, hR, hip, kL, kR, fL, fR },
    bbox: {
      x: Math.max(0, minX),
      y: Math.max(0, minY),
      w: Math.min(100, maxX) - Math.max(0, minX),
      h: Math.min(100, maxY) - Math.max(0, minY),
    },
  };
}

export const BONES: [keyof JointSet, keyof JointSet][] = [
  ["head", "sL"], ["head", "sR"], ["sL", "sR"],
  ["sL", "hL"], ["sR", "hR"],
  ["sL", "hip"], ["sR", "hip"],
  ["hip", "kL"], ["hip", "kR"],
  ["kL", "fL"], ["kR", "fR"],
];

export interface ChallengeDef {
  key: ChallengeKey;
  emoji: string;
  /** i18n key for display label */
  labelKey: string;
  /** short instructional caption (English) */
  tip: string;
  /** radians per tick — controls cycle speed */
  speed: number;
  /** i18n key for a tailored correction tip */
  badTipKey: string;
  /** i18n key for a tailored praise message */
  goodTipKey: string;
}

export const CHALLENGES: ChallengeDef[] = [
  { key: "jacks",     emoji: "🤸", labelKey: "ex_jacks",     tip: "Jumping Jacks · 30s",     speed: 0.22, badTipKey: "tip_jacks",     goodTipKey: "praise_jumps" },
  { key: "squat",     emoji: "🦵", labelKey: "ex_squat",     tip: "Air Squats · 30s",        speed: 0.16, badTipKey: "tip_squat",     goodTipKey: "praise_form" },
  { key: "punch",     emoji: "🥊", labelKey: "ex_punch",     tip: "Boxing Combo · 30s",      speed: 0.34, badTipKey: "tip_punch",     goodTipKey: "praise_power" },
  { key: "highKnees", emoji: "🏃", labelKey: "ex_highKnees", tip: "High Knees · 30s",        speed: 0.36, badTipKey: "tip_highKnees", goodTipKey: "praise_speed" },
  { key: "pushup",    emoji: "💪", labelKey: "ex_pushup",    tip: "Push-Ups · 30s",          speed: 0.14, badTipKey: "tip_pushup",    goodTipKey: "praise_form" },
  { key: "star",      emoji: "⭐", labelKey: "ex_star",      tip: "Star Jumps · 30s",        speed: 0.20, badTipKey: "tip_star",      goodTipKey: "praise_jumps" },
  { key: "plank",     emoji: "🛡️", labelKey: "ex_plank",    tip: "Plank Hold · 30s",        speed: 0.06, badTipKey: "tip_plank",     goodTipKey: "praise_hold" },
  { key: "burpee",    emoji: "🔥", labelKey: "ex_burpee",    tip: "Burpees · 30s",           speed: 0.18, badTipKey: "tip_burpee",    goodTipKey: "praise_power" },
  { key: "lunge",     emoji: "🦶", labelKey: "ex_lunge",     tip: "Side Lunges · 30s",       speed: 0.18, badTipKey: "tip_lunge",     goodTipKey: "praise_form" },
  { key: "climbers",  emoji: "⛰️", labelKey: "ex_climbers", tip: "Mountain Climbers · 30s", speed: 0.40, badTipKey: "tip_climbers",  goodTipKey: "praise_speed" },
  { key: "toeTouch",  emoji: "🤾", labelKey: "ex_toeTouch", tip: "Cross Toe-Touch · 30s",   speed: 0.22, badTipKey: "tip_toeTouch",  goodTipKey: "praise_form" },
  { key: "skater",    emoji: "⛸️", labelKey: "ex_skater",   tip: "Skater Hops · 30s",       speed: 0.26, badTipKey: "tip_skater",    goodTipKey: "praise_jumps" },
];