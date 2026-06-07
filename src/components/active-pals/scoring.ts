import type { ChallengeKey } from "./motions";
import { KP, type Keypoint } from "./poseDetector";

export interface ScoreEvent {
  /** 1 if a rep was completed on this frame */
  repDelta: number;
  /** quality of the completed rep, 0..100 (only meaningful when repDelta>0) */
  repQuality: number;
  /** smoothed instantaneous accuracy 0..100 */
  accuracy: number;
  /** "good" | "bad" | "idle" feedback hint for the HUD */
  feedback: "good" | "bad" | "idle";
}

const MIN_SCORE = 0.3;

function g(kps: Keypoint[], i: number): Keypoint | null {
  const p = kps[i];
  if (!p || (p.score ?? 0) < MIN_SCORE) return null;
  return p;
}

function mid(a: Keypoint, b: Keypoint): Keypoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a: Keypoint, b: Keypoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Per-exercise real movement scorer driven by MoveNet keypoints.
 * Maintains a tiny state machine to detect rep transitions with debounce.
 */
export class ExerciseScorer {
  key: ChallengeKey;
  phase: string = "neutral";
  lastRepTs = 0;
  accuracy = 0;
  // burpee multi-phase tracking
  burpeeSeen = { stand: false, squat: false, plank: false };
  // plank hold accumulator (in ms)
  holdMs = 0;
  lastTs = 0;

  constructor(key: ChallengeKey) {
    this.key = key;
  }

  reset(key?: ChallengeKey) {
    if (key) this.key = key;
    this.phase = "neutral";
    this.lastRepTs = 0;
    this.accuracy = 0;
    this.burpeeSeen = { stand: false, squat: false, plank: false };
    this.holdMs = 0;
    this.lastTs = 0;
  }

  private smooth(target: number) {
    this.accuracy = this.accuracy * 0.7 + target * 0.3;
    return Math.round(this.accuracy);
  }

  private canRep(now: number, minMs = 350) {
    return now - this.lastRepTs >= minMs;
  }

  update(kps: Keypoint[] | null, now: number): ScoreEvent {
    const dt = this.lastTs ? now - this.lastTs : 0;
    this.lastTs = now;
    if (!kps) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(0), feedback: "idle" };
    }
    switch (this.key) {
      case "jacks":
      case "star":
        return this.jacks(kps, now, this.key === "star");
      case "squat":
        return this.squat(kps, now);
      case "punch":
        return this.punch(kps, now);
      case "highKnees":
        return this.highKnees(kps, now);
      case "pushup":
        return this.pushup(kps, now);
      case "plank":
        return this.plank(kps, dt);
      case "burpee":
        return this.burpee(kps, now);
      case "lunge":
        return this.lunge(kps, now);
      case "climbers":
        return this.climbers(kps, now);
      case "toeTouch":
        return this.toeTouch(kps, now);
      case "skater":
        return this.skater(kps, now);
      case "grab":
        // Grab is a falling-objects mini-game handled by GrabGame, not rep-based.
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
      case "slice":
        // Slice is a Fruit-Ninja mini-game handled by SliceGame, not rep-based.
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
      case "lift":
        // Lift is a barbell mini-game handled by LiftGame, not rep-based here.
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
      case "karate":
        // Karate is a fighting mini-game handled by KarateGame, not rep-based here.
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
    }
  }

  // ---- Exercise detectors ----

  private jacks(kps: Keypoint[], now: number, isStar: boolean): ScoreEvent {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    if (!lS || !rS || !lW || !rW || !lA || !rA) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const shoulderWidth = Math.abs(lS.x - rS.x) || 1;
    const ankleSpread = Math.abs(lA.x - rA.x);
    // arms above shoulder (smaller y = higher on screen)
    const armsUp = lW.y < lS.y - shoulderWidth * 0.3 && rW.y < rS.y - shoulderWidth * 0.3;
    const legsOpen = ankleSpread > shoulderWidth * (isStar ? 1.5 : 1.2);
    const open = armsUp && legsOpen;

    const ideal = (armsUp ? 50 : 0) + (legsOpen ? 50 : 0);
    const acc = this.smooth(ideal);

    let repDelta = 0;
    let quality = 0;
    if (open && this.phase !== "open" && this.canRep(now)) {
      this.phase = "open";
    } else if (!open && this.phase === "open" && this.canRep(now)) {
      this.phase = "closed";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 70 ? "good" : "bad" };
  }

  private squat(kps: Keypoint[], now: number): ScoreEvent {
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    if (!lH || !rH || !lK || !rK || !lS || !rS) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const hipY = (lH.y + rH.y) / 2;
    const kneeY = (lK.y + rK.y) / 2;
    const shY = (lS.y + rS.y) / 2;
    const torso = Math.max(1, kneeY - shY);
    // ratio of (knee->hip) over torso. 0 = squatting deep, 1 = standing tall
    const ratio = clamp(((kneeY - hipY) / torso) * 100, 0, 100);
    const down = ratio < 35;
    const up = ratio > 60;
    const ideal = down ? 95 : up ? 40 : 60;
    const acc = this.smooth(ideal);

    let repDelta = 0;
    let quality = 0;
    if (down && this.phase !== "down") this.phase = "down";
    else if (up && this.phase === "down" && this.canRep(now, 400)) {
      this.phase = "up";
      this.lastRepTs = now;
      repDelta = 1;
      quality = 95;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: down ? "good" : "bad" };
  }

  private punch(kps: Keypoint[], now: number): ScoreEvent {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lE = g(kps, KP.lElbow), rE = g(kps, KP.rElbow);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    if (!lS || !rS || !lE || !rE || !lW || !rW) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const lUpper = dist(lS, lE);
    const rUpper = dist(rS, rE);
    const lExt = dist(lS, lW) / Math.max(1, lUpper); // straight ~2
    const rExt = dist(rS, rW) / Math.max(1, rUpper);
    const leftPunch = lExt > 1.75;
    const rightPunch = rExt > 1.75;
    const ideal = Math.min(100, Math.max(lExt, rExt) * 50);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (leftPunch && this.phase !== "leftExt" && this.canRep(now, 250)) {
      this.phase = "leftExt"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (rightPunch && this.phase !== "rightExt" && this.canRep(now, 250)) {
      this.phase = "rightExt"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (!leftPunch && !rightPunch) {
      this.phase = "rest";
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 70 ? "good" : "bad" };
  }

  private highKnees(kps: Keypoint[], now: number): ScoreEvent {
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    if (!lH || !rH || !lK || !rK) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const hipY = (lH.y + rH.y) / 2;
    const shY = lS && rS ? (lS.y + rS.y) / 2 : hipY - 80;
    const torso = Math.max(30, hipY - shY);
    const leftUp = lK.y < hipY - torso * 0.2;
    const rightUp = rK.y < hipY - torso * 0.2;
    const lift = Math.max(hipY - lK.y, hipY - rK.y);
    const ideal = clamp((lift / Math.max(20, torso * 0.6)) * 100, 0, 100);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (leftUp && this.phase !== "L" && this.canRep(now, 200)) {
      this.phase = "L"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (rightUp && this.phase !== "R" && this.canRep(now, 200)) {
      this.phase = "R"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }

  private pushup(kps: Keypoint[], now: number): ScoreEvent {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lE = g(kps, KP.lElbow), rE = g(kps, KP.rElbow);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    if (!lS || !rS || !lE || !rE || !lW || !rW) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    // arm bend ratio: smaller when arm is bent at elbow
    const lRatio = dist(lS, lW) / Math.max(1, dist(lS, lE) + dist(lE, lW));
    const rRatio = dist(rS, rW) / Math.max(1, dist(rS, rE) + dist(rE, rW));
    const bent = (lRatio + rRatio) / 2;
    const down = bent < 0.65;
    const up = bent > 0.9;
    const ideal = down ? 95 : up ? 60 : 75;
    const acc = this.smooth(ideal);
    let repDelta = 0; let quality = 0;
    if (down && this.phase !== "down") this.phase = "down";
    else if (up && this.phase === "down" && this.canRep(now, 500)) {
      this.phase = "up"; this.lastRepTs = now; repDelta = 1; quality = 95;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: down ? "good" : "bad" };
  }

  private plank(kps: Keypoint[], dt: number): ScoreEvent {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    if (!lS || !rS || !lH || !rH || !lA || !rA) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const sh = mid(lS, rS), hp = mid(lH, rH), an = mid(lA, rA);
    // alignment: hip y should sit on the line between shoulder and ankle
    const t = (hp.x - sh.x) / Math.max(0.01, an.x - sh.x);
    const lineY = sh.y + t * (an.y - sh.y);
    const span = Math.max(20, dist(sh, an));
    const drift = Math.abs(hp.y - lineY) / span;
    const ideal = clamp(100 - drift * 300, 0, 100);
    const acc = this.smooth(ideal);
    // count "rep" once per second held with good form
    let repDelta = 0; let quality = 0;
    if (ideal > 60) {
      this.holdMs += dt;
      while (this.holdMs >= 1000) {
        this.holdMs -= 1000;
        repDelta += 1;
        quality = ideal;
      }
    } else {
      this.holdMs = 0;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal > 60 ? "good" : "bad" };
  }

  private burpee(kps: Keypoint[], now: number): ScoreEvent {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    if (!lS || !rS || !lH || !rH || !lK || !rK || !lW || !rW) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const sh = mid(lS, rS), hp = mid(lH, rH), kn = mid(lK, rK), wr = mid(lW, rW);
    const horizontal = Math.abs(sh.y - hp.y) / Math.max(20, Math.abs(sh.x - hp.x)) < 0.5;
    const standing = !horizontal && hp.y > kn.y - 20;
    const squatLow = !horizontal && Math.abs(hp.y - kn.y) < 50;
    const handsUp = wr.y < sh.y - 30;

    if (squatLow) this.burpeeSeen.squat = true;
    if (horizontal) this.burpeeSeen.plank = true;
    if (standing && handsUp) this.burpeeSeen.stand = true;

    const completed =
      this.burpeeSeen.squat && this.burpeeSeen.plank && this.burpeeSeen.stand;
    const visited =
      (this.burpeeSeen.squat ? 1 : 0) +
      (this.burpeeSeen.plank ? 1 : 0) +
      (this.burpeeSeen.stand ? 1 : 0);
    const ideal = (visited / 3) * 100;
    const acc = this.smooth(ideal);
    let repDelta = 0; let quality = 0;
    if (completed && this.canRep(now, 1200)) {
      this.lastRepTs = now;
      repDelta = 1; quality = 95;
      this.burpeeSeen = { stand: false, squat: false, plank: false };
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }

  private lunge(kps: Keypoint[], now: number): ScoreEvent {
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    if (!lH || !rH || !lK || !rK || !lA || !rA) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const hipMid = mid(lH, rH);
    const kneeY = (lK.y + rK.y) / 2;
    const stance = Math.abs(lA.x - rA.x);
    const drop = (kneeY - hipMid.y) < 70; // hips dropped close to knee level
    const wide = stance > Math.abs(lH.x - rH.x) * 1.8;
    const left = lA.x < rA.x - 20;
    const phase = wide && drop ? (left ? "L" : "R") : "neutral";
    const ideal = (wide ? 50 : 0) + (drop ? 50 : 0);
    const acc = this.smooth(ideal);
    let repDelta = 0; let quality = 0;
    if (phase !== "neutral" && phase !== this.phase && this.canRep(now, 500)) {
      this.phase = phase; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (phase === "neutral") {
      this.phase = "neutral";
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 70 ? "good" : "bad" };
  }

  private climbers(kps: Keypoint[], now: number): ScoreEvent {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    if (!lS || !rS || !lH || !rH || !lK || !rK) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const sh = mid(lS, rS), hp = mid(lH, rH);
    const horizontal = Math.abs(sh.y - hp.y) / Math.max(20, Math.abs(sh.x - hp.x)) < 0.5;
    const lAdv = (lK.x - lH.x);
    const rAdv = (rK.x - rH.x);
    const leftIn = Math.abs(lAdv) > Math.abs(rAdv) + 15;
    const rightIn = Math.abs(rAdv) > Math.abs(lAdv) + 15;
    const ideal = (horizontal ? 60 : 0) + ((leftIn || rightIn) ? 40 : 0);
    const acc = this.smooth(ideal);
    let repDelta = 0; let quality = 0;
    if (horizontal && leftIn && this.phase !== "L" && this.canRep(now, 180)) {
      this.phase = "L"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (horizontal && rightIn && this.phase !== "R" && this.canRep(now, 180)) {
      this.phase = "R"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }

  private toeTouch(kps: Keypoint[], now: number): ScoreEvent {
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    if (!lW || !rW || !lA || !rA || !lS || !rS) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const torso = Math.max(20, Math.abs(lS.y - lA.y));
    const leftToRight = dist(lW, rA) / torso;
    const rightToLeft = dist(rW, lA) / torso;
    const left = leftToRight < 0.35;
    const right = rightToLeft < 0.35;
    const ideal = clamp(100 - Math.min(leftToRight, rightToLeft) * 200, 0, 100);
    const acc = this.smooth(ideal);
    let repDelta = 0; let quality = 0;
    if (left && this.phase !== "L" && this.canRep(now, 400)) {
      this.phase = "L"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (right && this.phase !== "R" && this.canRep(now, 400)) {
      this.phase = "R"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }

  private skater(kps: Keypoint[], now: number): ScoreEvent {
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    const nose = g(kps, KP.nose);
    if (!lH || !rH || !lA || !rA || !nose) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const hipMid = mid(lH, rH);
    const ankleMid = mid(lA, rA);
    const drift = hipMid.x - ankleMid.x; // weight shift
    const span = Math.max(20, Math.abs(lH.x - rH.x));
    const ratio = drift / span;
    const right = ratio > 0.4;
    const left = ratio < -0.4;
    const ideal = clamp(Math.abs(ratio) * 120, 0, 100);
    const acc = this.smooth(ideal);
    let repDelta = 0; let quality = 0;
    if (right && this.phase !== "R" && this.canRep(now, 350)) {
      this.phase = "R"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    } else if (left && this.phase !== "L" && this.canRep(now, 350)) {
      this.phase = "L"; this.lastRepTs = now; repDelta = 1; quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }
}
