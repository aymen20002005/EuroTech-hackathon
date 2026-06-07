import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Zap, Flame, Dumbbell, Timer, Target, User, Bot, Crown, Gem, Check, Bell, Globe, Swords, HelpCircle, RotateCcw, Home, Trophy, ChevronRight, Gamepad2, ShoppingBag, X } from "lucide-react";
import { FaSkating, FaHandPaper, FaMountain, FaWalking, FaFire, FaShieldAlt, FaStar, FaRunning, FaDumbbell } from "react-icons/fa";
import { GiWeightLiftingUp, GiSwordClash, GiFruitBowl, GiKatana, GiMuscleUp, GiBoxingGlove, GiCartwheel } from "react-icons/gi";
const LANGS = [
  { code: "en", label: "EN" },
  { code: "zh-HK", label: "繁" },
  { code: "zh-CN", label: "简" }
];
const T = {
  appName: { en: "ZaoWay", "zh-HK": "ZaoWay", "zh-CN": "ZaoWay" },
  tagline: {
    en: "Your Daily Movement Game",
    "zh-HK": "你的每日動感遊戲",
    "zh-CN": "你的每日动感游戏"
  },
  pickChallenge: { en: "Games Library", "zh-HK": "遊戲庫", "zh-CN": "游戏库" },
  diamonds: { en: "Diamonds", "zh-HK": "鑽石", "zh-CN": "钻石" },
  shop: { en: "Shop", "zh-HK": "商店", "zh-CN": "商店" },
  homeSpace: { en: "Home Space", "zh-HK": "主頁空間", "zh-CN": "主页空间" },
  friends: { en: "Friends", "zh-HK": "好友", "zh-CN": "好友" },
  outside: { en: "Outside", "zh-HK": "戶外冒險", "zh-CN": "户外冒险" },
  soloGames: { en: "Solo", "zh-HK": "單人", "zh-CN": "单人" },
  dailyActivity: { en: "Daily Activity", "zh-HK": "每日活動", "zh-CN": "每日活动" },
  ex_jacks: { en: "Jumping Jacks", "zh-HK": "開合跳", "zh-CN": "开合跳" },
  ex_squat: { en: "Squat Rush", "zh-HK": "深蹲衝刺", "zh-CN": "深蹲冲刺" },
  ex_punch: { en: "Punch Combo", "zh-HK": "拳擊連擊", "zh-CN": "拳击连击" },
  ex_highKnees: { en: "High Knees", "zh-HK": "高抬腿", "zh-CN": "高抬腿" },
  ex_pushup: { en: "Push-Up Power", "zh-HK": "掌上壓", "zh-CN": "俯卧撑" },
  ex_star: { en: "Star Jumps", "zh-HK": "星型跳", "zh-CN": "星型跳" },
  ex_plank: { en: "Plank Hold", "zh-HK": "平板支撐", "zh-CN": "平板支撑" },
  ex_burpee: { en: "Burpee Blast", "zh-HK": "波比跳", "zh-CN": "波比跳" },
  ex_lunge: { en: "Side Lunges", "zh-HK": "側弓步", "zh-CN": "侧弓步" },
  ex_climbers: { en: "Mountain Climbers", "zh-HK": "登山者", "zh-CN": "登山者" },
  ex_toeTouch: { en: "Cross Toe-Touch", "zh-HK": "交叉觸腳", "zh-CN": "交叉触脚" },
  ex_skater: { en: "Skater Hops", "zh-HK": "溜冰跳", "zh-CN": "溜冰跳" },
  ex_grab: { en: "Fruit Catcher", "zh-HK": "接生果", "zh-CN": "接水果" },
  grab_good: { en: "Yum! Fresh apple! 🍎", "zh-HK": "好嘢！新鮮蘋果！🍎", "zh-CN": "好棒！新鲜苹果！🍎" },
  grab_bad: { en: "Yuck! Dodge the pizza! 🍕", "zh-HK": "哎呀！避開薄餅！🍕", "zh-CN": "哎呀！躲开披萨！🍕" },
  grab_intro: { en: "Catch apples 🍎 · Dodge pizza 🍕", "zh-HK": "接蘋果 🍎 · 避薄餅 🍕", "zh-CN": "接苹果 🍎 · 躲披萨 🍕" },
  ex_slice: { en: "Fruit Ninja", "zh-HK": "生果忍者", "zh-CN": "水果忍者" },
  slice_good: { en: "Slice! Juicy hit! 🍉", "zh-HK": "切中！多汁！🍉", "zh-CN": "切中！多汁！🍉" },
  slice_bad: { en: "Swing through the fruit! 🗡️", "zh-HK": "揮手切過生果！🗡️", "zh-CN": "挥手切过水果！🗡️" },
  slice_intro: { en: "Swipe your hand to slice the fruit! 🍓", "zh-HK": "揮手切生果！🍓", "zh-CN": "挥手切水果！🍓" },
  ex_lift: { en: "Iron Lifter", "zh-HK": "舉鐵手", "zh-CN": "举铁手" },
  lift_good: { en: "Strong, clean rep! 🏋️", "zh-HK": "好有力，姿勢正！🏋️", "zh-CN": "强壮又标准！🏋️" },
  lift_bad: { en: "Press higher & keep the bar level! ⚖️", "zh-HK": "推高啲，保持槓平衡！⚖️", "zh-CN": "推高点，保持杠平衡！⚖️" },
  lift_intro: { en: "Press the barbell overhead, then lower it 🏋️", "zh-HK": "將槓鈴推過頭再放低 🏋️", "zh-CN": "把杠铃举过头再放下 🏋️" },
  lift_grip: { en: "Grab the bar with both hands! ✊", "zh-HK": "雙手握住槓鈴！✊", "zh-CN": "双手握住杠铃！✊" },
  ex_karate: { en: "Karate Showdown", "zh-HK": "空手道對決", "zh-CN": "空手道对决" },
  karate_intro: { en: "Punch & kick when open · Block the red strike!", "zh-HK": "見空隙就出拳出腳 · 紅光時舉手防守！", "zh-CN": "见空隙就出拳出脚 · 红光时举手防守！" },
  karate_good: { en: "Clean strike! 🥋", "zh-HK": "漂亮一擊！🥋", "zh-CN": "漂亮一击！🥋" },
  karate_bad: { en: "Guard up! ⚠️", "zh-HK": "舉手防守！⚠️", "zh-CN": "举手防守！⚠️" },
  karate_block: { en: "BLOCK!", "zh-HK": "防守！", "zh-CN": "防守！" },
  karate_strike: { en: "STRIKE NOW", "zh-HK": "出招！", "zh-CN": "出招！" },
  karate_ko: { en: "K.O.! VICTORY 🥇", "zh-HK": "K.O.！勝利 🥇", "zh-CN": "K.O.！胜利 🥇" },
  // praise variants
  praise_jumps: { en: "Sky-high jumps! 🚀", "zh-HK": "跳得超高！🚀", "zh-CN": "跳得超高！🚀" },
  praise_form: { en: "Beautiful form! 🎯", "zh-HK": "姿勢漂亮！🎯", "zh-CN": "姿势漂亮！🎯" },
  praise_power: { en: "Powerful! 💥", "zh-HK": "好有力！💥", "zh-CN": "好有力！💥" },
  praise_speed: { en: "Lightning speed! ⚡", "zh-HK": "速度好快！⚡", "zh-CN": "速度好快！⚡" },
  praise_hold: { en: "Rock solid! 🪨", "zh-HK": "穩如泰山！🪨", "zh-CN": "稳如泰山！🪨" },
  // per-exercise correction tips
  tip_jacks: { en: "Open arms wider! 🙌", "zh-HK": "雙手張大啲！🙌", "zh-CN": "双手张大点！🙌" },
  tip_squat: { en: "Drop hips lower! 🪑", "zh-HK": "臀部蹲低啲！🪑", "zh-CN": "臀部蹲低点！🪑" },
  tip_punch: { en: "Fully extend that arm! 👊", "zh-HK": "手臂打直！👊", "zh-CN": "手臂打直！👊" },
  tip_highKnees: { en: "Knees up to your chest! 🦵", "zh-HK": "膝頭抬到胸口！🦵", "zh-CN": "膝盖抬到胸口！🦵" },
  tip_pushup: { en: "Chest closer to the floor! 🫳", "zh-HK": "胸口貼近地面！🫳", "zh-CN": "胸口贴近地面！🫳" },
  tip_star: { en: "Spread arms AND legs! ✨", "zh-HK": "手腳一齊張大！✨", "zh-CN": "手脚一齐张大！✨" },
  tip_plank: { en: "Keep your back straight! 📏", "zh-HK": "腰背保持挺直！📏", "zh-CN": "腰背保持挺直！📏" },
  tip_burpee: { en: "Don't skip the jump! 🦘", "zh-HK": "唔好漏咗跳起！🦘", "zh-CN": "别漏了跳起！🦘" },
  tip_lunge: { en: "Bend the front knee more! 🦵", "zh-HK": "前膝彎多啲！🦵", "zh-CN": "前膝弯多点！🦵" },
  tip_climbers: { en: "Pump those knees faster! 💨", "zh-HK": "膝頭加快啲！💨", "zh-CN": "膝盖快点交替！💨" },
  tip_toeTouch: { en: "Reach across to the toe! 🤸", "zh-HK": "對角觸腳趾！🤸", "zh-CN": "对角触脚趾！🤸" },
  tip_skater: { en: "Hop further sideways! ⛸️", "zh-HK": "側向跳遠啲！⛸️", "zh-CN": "侧向跳远点！⛸️" },
  startChallenge: { en: "Play Now", "zh-HK": "立即玩", "zh-CN": "立即玩" },
  searching: { en: "Finding Players…", "zh-HK": "正在尋找玩家…", "zh-CN": "正在寻找玩家…" },
  matchFound: { en: "Match Found!", "zh-HK": "已配對！", "zh-CN": "已配对！" },
  vs: { en: "VS", "zh-HK": "對戰", "zh-CN": "对战" },
  you: { en: "YOU", "zh-HK": "你", "zh-CN": "你" },
  rival: { en: "RIVAL", "zh-HK": "對手", "zh-CN": "对手" },
  accuracy: { en: "AI Accuracy", "zh-HK": "AI 準確度", "zh-CN": "AI 准确度" },
  streak: { en: "Streak", "zh-HK": "連擊", "zh-CN": "连击" },
  reps: { en: "Reps", "zh-HK": "次數", "zh-CN": "次数" },
  timeLeft: { en: "Time Left", "zh-HK": "剩餘時間", "zh-CN": "剩余时间" },
  excellent: { en: "Excellent! ✨", "zh-HK": "太棒了！✨", "zh-CN": "太棒了！✨" },
  perfect: { en: "Perfect Form! 🎯", "zh-HK": "完美姿勢！🎯", "zh-CN": "完美姿势！🎯" },
  liftArms: { en: "Lift your arms higher! 🙌", "zh-HK": "手臂抬高點！🙌", "zh-CN": "手臂抬高点！🙌" },
  jumpBigger: { en: "Jump bigger! 🚀", "zh-HK": "跳大力些！🚀", "zh-CN": "跳大力些！🚀" },
  faster: { en: "Pick up the pace! ⚡", "zh-HK": "加快節奏！⚡", "zh-CN": "加快节奏！⚡" },
  cameraNeeded: { en: "Camera permission needed", "zh-HK": "需要相機權限", "zh-CN": "需要相机权限" },
  cameraDenied: {
    en: "Camera blocked. Allow it in your browser to play.",
    "zh-HK": "相機被封鎖，請於瀏覽器允許使用。",
    "zh-CN": "相机被阻止，请在浏览器允许使用。"
  },
  enableCamera: { en: "Enable Camera", "zh-HK": "啟用相機", "zh-CN": "启用相机" },
  matchmakingRegion: { en: "Scanning Hong Kong, Mainland & Global…", "zh-HK": "搜尋香港、內地及全球…", "zh-CN": "搜寻香港、内地及全球…" },
  verdict: { en: "AI Verdict", "zh-HK": "AI 評定", "zh-CN": "AI 评定" },
  formAccuracy: { en: "Form Accuracy", "zh-HK": "姿勢準確", "zh-CN": "姿势准确" },
  rhythm: { en: "Rhythm", "zh-HK": "節奏", "zh-CN": "节奏" },
  speed: { en: "Speed", "zh-HK": "速度", "zh-CN": "速度" },
  rematch: { en: "Rematch", "zh-HK": "再戰一局", "zh-CN": "再战一局" },
  home: { en: "Home", "zh-HK": "返回首頁", "zh-CN": "返回首页" },
  win: { en: "VICTORY!", "zh-HK": "勝利！", "zh-CN": "胜利！" },
  lose: { en: "Good Try!", "zh-HK": "再接再厲！", "zh-CN": "再接再厉！" },
  draw: { en: "Draw!", "zh-HK": "平手！", "zh-CN": "平手！" },
  scanning: { en: "AI SCANNING", "zh-HK": "AI 掃描中", "zh-CN": "AI 扫描中" },
  level: { en: "Level", "zh-HK": "等級", "zh-CN": "等级" },
  xp: { en: "XP", "zh-HK": "經驗", "zh-CN": "经验" },
  ready: { en: "Get Ready!", "zh-HK": "預備！", "zh-CN": "预备！" },
  go: { en: "GO!", "zh-HK": "開始！", "zh-CN": "开始！" }
};
function usePoseDetection(videoRef, active) {
  const keypointsRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState(null);
  const [, force] = useState(0);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 1, h: 1 });
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let lastPush = 0;
    (async () => {
      try {
        const tf = await import("@tensorflow/tfjs-core");
        await import("@tensorflow/tfjs-converter");
        await import("@tensorflow/tfjs-backend-webgl");
        const poseDetection = await import("@tensorflow-models/pose-detection");
        await tf.setBackend("webgl");
        await tf.ready();
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
          }
        );
        if (cancelled) {
          detector.dispose();
          return;
        }
        detectorRef.current = detector;
        setStatus("ready");
        const loop = async () => {
          const v = videoRef.current;
          if (v && v.readyState >= 2 && v.videoWidth > 0) {
            sizeRef.current = { w: v.videoWidth, h: v.videoHeight };
            try {
              const poses = await detector.estimatePoses(v, {
                flipHorizontal: false
              });
              if (poses[0]) {
                keypointsRef.current = poses[0].keypoints;
                const now = performance.now();
                if (now - lastPush > 60) {
                  lastPush = now;
                  force((n) => (n + 1) % 1e3);
                }
              }
            } catch {
            }
          }
          if (!cancelled) rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.error("Pose detection init failed", e);
        setErrorMsg(e.message);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        detectorRef.current?.dispose?.();
      } catch {
      }
      detectorRef.current = null;
    };
  }, [active, videoRef]);
  return {
    keypoints: keypointsRef.current,
    status,
    errorMsg,
    size: sizeRef.current
  };
}
const KP = {
  nose: 0,
  lShoulder: 5,
  rShoulder: 6,
  lElbow: 7,
  rElbow: 8,
  lWrist: 9,
  rWrist: 10,
  lHip: 11,
  rHip: 12,
  lKnee: 13,
  rKnee: 14,
  lAnkle: 15,
  rAnkle: 16
};
const MOVENET_BONES = [
  [KP.lShoulder, KP.rShoulder],
  [KP.lShoulder, KP.lElbow],
  [KP.lElbow, KP.lWrist],
  [KP.rShoulder, KP.rElbow],
  [KP.rElbow, KP.rWrist],
  [KP.lShoulder, KP.lHip],
  [KP.rShoulder, KP.rHip],
  [KP.lHip, KP.rHip],
  [KP.lHip, KP.lKnee],
  [KP.lKnee, KP.lAnkle],
  [KP.rHip, KP.rKnee],
  [KP.rKnee, KP.rAnkle],
  [KP.nose, KP.lShoulder],
  [KP.nose, KP.rShoulder]
];
const MIN_SCORE = 0.3;
function g(kps, i) {
  const p = kps[i];
  if (!p || (p.score ?? 0) < MIN_SCORE) return null;
  return p;
}
function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}
class ExerciseScorer {
  key;
  phase = "neutral";
  lastRepTs = 0;
  accuracy = 0;
  // burpee multi-phase tracking
  burpeeSeen = { stand: false, squat: false, plank: false };
  // plank hold accumulator (in ms)
  holdMs = 0;
  lastTs = 0;
  constructor(key) {
    this.key = key;
  }
  reset(key) {
    if (key) this.key = key;
    this.phase = "neutral";
    this.lastRepTs = 0;
    this.accuracy = 0;
    this.burpeeSeen = { stand: false, squat: false, plank: false };
    this.holdMs = 0;
    this.lastTs = 0;
  }
  smooth(target) {
    this.accuracy = this.accuracy * 0.7 + target * 0.3;
    return Math.round(this.accuracy);
  }
  canRep(now, minMs = 350) {
    return now - this.lastRepTs >= minMs;
  }
  update(kps, now) {
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
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
      case "slice":
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
      case "lift":
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
      case "karate":
        return { repDelta: 0, repQuality: 0, accuracy: this.smooth(100), feedback: "good" };
    }
  }
  // ---- Exercise detectors ----
  jacks(kps, now, isStar) {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    if (!lS || !rS || !lW || !rW || !lA || !rA) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const shoulderWidth = Math.abs(lS.x - rS.x) || 1;
    const ankleSpread = Math.abs(lA.x - rA.x);
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
  squat(kps, now) {
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
    const ratio = clamp((kneeY - hipY) / torso * 100, 0, 100);
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
  punch(kps, now) {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lE = g(kps, KP.lElbow), rE = g(kps, KP.rElbow);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    if (!lS || !rS || !lE || !rE || !lW || !rW) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const lUpper = dist(lS, lE);
    const rUpper = dist(rS, rE);
    const lExt = dist(lS, lW) / Math.max(1, lUpper);
    const rExt = dist(rS, rW) / Math.max(1, rUpper);
    const leftPunch = lExt > 1.75;
    const rightPunch = rExt > 1.75;
    const ideal = Math.min(100, Math.max(lExt, rExt) * 50);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (leftPunch && this.phase !== "leftExt" && this.canRep(now, 250)) {
      this.phase = "leftExt";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (rightPunch && this.phase !== "rightExt" && this.canRep(now, 250)) {
      this.phase = "rightExt";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (!leftPunch && !rightPunch) {
      this.phase = "rest";
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 70 ? "good" : "bad" };
  }
  highKnees(kps, now) {
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
    const ideal = clamp(lift / Math.max(20, torso * 0.6) * 100, 0, 100);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (leftUp && this.phase !== "L" && this.canRep(now, 200)) {
      this.phase = "L";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (rightUp && this.phase !== "R" && this.canRep(now, 200)) {
      this.phase = "R";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }
  pushup(kps, now) {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lE = g(kps, KP.lElbow), rE = g(kps, KP.rElbow);
    const lW = g(kps, KP.lWrist), rW = g(kps, KP.rWrist);
    if (!lS || !rS || !lE || !rE || !lW || !rW) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const lRatio = dist(lS, lW) / Math.max(1, dist(lS, lE) + dist(lE, lW));
    const rRatio = dist(rS, rW) / Math.max(1, dist(rS, rE) + dist(rE, rW));
    const bent = (lRatio + rRatio) / 2;
    const down = bent < 0.65;
    const up = bent > 0.9;
    const ideal = down ? 95 : up ? 60 : 75;
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (down && this.phase !== "down") this.phase = "down";
    else if (up && this.phase === "down" && this.canRep(now, 500)) {
      this.phase = "up";
      this.lastRepTs = now;
      repDelta = 1;
      quality = 95;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: down ? "good" : "bad" };
  }
  plank(kps, dt) {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    if (!lS || !rS || !lH || !rH || !lA || !rA) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const sh = mid(lS, rS), hp = mid(lH, rH), an = mid(lA, rA);
    const t = (hp.x - sh.x) / Math.max(0.01, an.x - sh.x);
    const lineY = sh.y + t * (an.y - sh.y);
    const span = Math.max(20, dist(sh, an));
    const drift = Math.abs(hp.y - lineY) / span;
    const ideal = clamp(100 - drift * 300, 0, 100);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (ideal > 60) {
      this.holdMs += dt;
      while (this.holdMs >= 1e3) {
        this.holdMs -= 1e3;
        repDelta += 1;
        quality = ideal;
      }
    } else {
      this.holdMs = 0;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal > 60 ? "good" : "bad" };
  }
  burpee(kps, now) {
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
    const completed = this.burpeeSeen.squat && this.burpeeSeen.plank && this.burpeeSeen.stand;
    const visited = (this.burpeeSeen.squat ? 1 : 0) + (this.burpeeSeen.plank ? 1 : 0) + (this.burpeeSeen.stand ? 1 : 0);
    const ideal = visited / 3 * 100;
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (completed && this.canRep(now, 1200)) {
      this.lastRepTs = now;
      repDelta = 1;
      quality = 95;
      this.burpeeSeen = { stand: false, squat: false, plank: false };
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }
  lunge(kps, now) {
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    if (!lH || !rH || !lK || !rK || !lA || !rA) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const hipMid = mid(lH, rH);
    const kneeY = (lK.y + rK.y) / 2;
    const stance = Math.abs(lA.x - rA.x);
    const drop = kneeY - hipMid.y < 70;
    const wide = stance > Math.abs(lH.x - rH.x) * 1.8;
    const left = lA.x < rA.x - 20;
    const phase = wide && drop ? left ? "L" : "R" : "neutral";
    const ideal = (wide ? 50 : 0) + (drop ? 50 : 0);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (phase !== "neutral" && phase !== this.phase && this.canRep(now, 500)) {
      this.phase = phase;
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (phase === "neutral") {
      this.phase = "neutral";
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 70 ? "good" : "bad" };
  }
  climbers(kps, now) {
    const lS = g(kps, KP.lShoulder), rS = g(kps, KP.rShoulder);
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lK = g(kps, KP.lKnee), rK = g(kps, KP.rKnee);
    if (!lS || !rS || !lH || !rH || !lK || !rK) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const sh = mid(lS, rS), hp = mid(lH, rH);
    const horizontal = Math.abs(sh.y - hp.y) / Math.max(20, Math.abs(sh.x - hp.x)) < 0.5;
    const lAdv = lK.x - lH.x;
    const rAdv = rK.x - rH.x;
    const leftIn = Math.abs(lAdv) > Math.abs(rAdv) + 15;
    const rightIn = Math.abs(rAdv) > Math.abs(lAdv) + 15;
    const ideal = (horizontal ? 60 : 0) + (leftIn || rightIn ? 40 : 0);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (horizontal && leftIn && this.phase !== "L" && this.canRep(now, 180)) {
      this.phase = "L";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (horizontal && rightIn && this.phase !== "R" && this.canRep(now, 180)) {
      this.phase = "R";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }
  toeTouch(kps, now) {
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
    let repDelta = 0;
    let quality = 0;
    if (left && this.phase !== "L" && this.canRep(now, 400)) {
      this.phase = "L";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (right && this.phase !== "R" && this.canRep(now, 400)) {
      this.phase = "R";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }
  skater(kps, now) {
    const lH = g(kps, KP.lHip), rH = g(kps, KP.rHip);
    const lA = g(kps, KP.lAnkle), rA = g(kps, KP.rAnkle);
    const nose = g(kps, KP.nose);
    if (!lH || !rH || !lA || !rA || !nose) {
      return { repDelta: 0, repQuality: 0, accuracy: this.smooth(20), feedback: "idle" };
    }
    const hipMid = mid(lH, rH);
    const ankleMid = mid(lA, rA);
    const drift = hipMid.x - ankleMid.x;
    const span = Math.max(20, Math.abs(lH.x - rH.x));
    const ratio = drift / span;
    const right = ratio > 0.4;
    const left = ratio < -0.4;
    const ideal = clamp(Math.abs(ratio) * 120, 0, 100);
    const acc = this.smooth(ideal);
    let repDelta = 0;
    let quality = 0;
    if (right && this.phase !== "R" && this.canRep(now, 350)) {
      this.phase = "R";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    } else if (left && this.phase !== "L" && this.canRep(now, 350)) {
      this.phase = "L";
      this.lastRepTs = now;
      repDelta = 1;
      quality = ideal;
    }
    return { repDelta, repQuality: quality, accuracy: acc, feedback: ideal >= 60 ? "good" : "bad" };
  }
}
function CameraFeed({
  active,
  lang,
  mirrored = true,
  challengeKey,
  onScore
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
          });
          setReady(true);
        }
      } catch (e) {
        setError(e.message || "denied");
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
  const scorerRef = useRef(new ExerciseScorer(challengeKey));
  useEffect(() => {
    scorerRef.current.reset(challengeKey);
  }, [challengeKey]);
  const lastFeedback = useRef("idle");
  const lastAccuracy = useRef(0);
  useEffect(() => {
    if (!keypoints) return;
    const evt = scorerRef.current.update(keypoints, performance.now());
    lastFeedback.current = evt.feedback;
    lastAccuracy.current = evt.accuracy;
    onScore?.(evt);
  }, [keypoints, onScore]);
  const feedback = lastFeedback.current;
  const color = feedback === "good" ? "oklch(0.48 0.23 22)" : feedback === "bad" ? "oklch(0.65 0.18 50)" : "oklch(0.80 0.08 30)";
  const bbox = useMemo(() => {
    if (!keypoints) return null;
    const visible = keypoints.filter((k) => (k.score ?? 0) > 0.3);
    if (visible.length < 4) return null;
    const xs = visible.map((k) => k.x);
    const ys = visible.map((k) => k.y);
    const pad = 14;
    return {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2
    };
  }, [keypoints]);
  return /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground", children: [
    /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        playsInline: true,
        muted: true,
        className: "absolute inset-0 h-full w-full object-cover",
        style: { transform: mirrored ? "scaleX(-1)" : void 0 }
      }
    ),
    (!ready || error) && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/90 text-background", children: error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "📷" }),
      /* @__PURE__ */ jsx("div", { className: "px-4 text-center text-sm font-semibold", children: T.cameraDenied[lang] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-background/30 border-t-background" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-bold uppercase tracking-widest", children: T.cameraNeeded[lang] })
    ] }) }),
    ready && keypoints && size.w > 0 && /* @__PURE__ */ jsxs(
      "svg",
      {
        viewBox: `0 0 ${size.w} ${size.h}`,
        preserveAspectRatio: "xMidYMid slice",
        className: "pointer-events-none absolute inset-0 h-full w-full",
        style: { transform: mirrored ? "scaleX(-1)" : void 0 },
        children: [
          bbox && /* @__PURE__ */ jsx(
            "rect",
            {
              x: bbox.x,
              y: bbox.y,
              width: bbox.w,
              height: bbox.h,
              fill: "none",
              stroke: color,
              strokeWidth: Math.max(2, size.w / 200),
              strokeDasharray: `${size.w / 50} ${size.w / 80}`,
              rx: size.w / 80,
              style: { filter: `drop-shadow(0 0 4px ${color})` }
            }
          ),
          MOVENET_BONES.map(([a, b], i) => {
            const pa = keypoints[a];
            const pb = keypoints[b];
            if (!pa || !pb || (pa.score ?? 0) < 0.3 || (pb.score ?? 0) < 0.3) return null;
            return /* @__PURE__ */ jsx(
              "line",
              {
                x1: pa.x,
                y1: pa.y,
                x2: pb.x,
                y2: pb.y,
                stroke: color,
                strokeWidth: Math.max(3, size.w / 130),
                strokeLinecap: "round",
                opacity: "0.95"
              },
              i
            );
          }),
          keypoints.map((k, i) => {
            if ((k.score ?? 0) < 0.3) return null;
            return /* @__PURE__ */ jsx(
              "circle",
              {
                cx: k.x,
                cy: k.y,
                r: i === 0 ? Math.max(5, size.w / 80) : Math.max(3, size.w / 140),
                fill: color,
                stroke: "white",
                strokeWidth: Math.max(1, size.w / 400)
              },
              i
            );
          })
        ]
      }
    ),
    ready && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "animate-scanline h-[3px] w-full",
        style: { background: `linear-gradient(90deg, transparent, ${color}, transparent)` }
      }
    ) }),
    ready && /* @__PURE__ */ jsxs("div", { className: "absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "relative inline-flex h-2 w-2 rounded-full",
          style: { background: color, boxShadow: `0 0 6px ${color}` }
        }
      ),
      status === "ready" ? `AI · ${Math.round(lastAccuracy.current)}%` : T.scanning[lang]
    ] }),
    ready && status === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: "Loading AI model…" })
  ] });
}
const APPLE_PROB = 0.68;
const HIT_RADIUS$1 = 0.09;
function GrabGame({ active, lang, onGrab }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
          });
          setReady(true);
        }
      } catch (e) {
        setError(e.message || "denied");
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
  const handsRef = useRef([]);
  useEffect(() => {
    if (!keypoints || size.w <= 0 || size.h <= 0) return;
    const hs = [];
    for (const idx of [KP.lWrist, KP.rWrist]) {
      const k = keypoints[idx];
      if (k && (k.score ?? 0) > 0.3) hs.push({ x: k.x / size.w, y: k.y / size.h });
    }
    handsRef.current = hs;
  }, [keypoints, size]);
  const itemsRef = useRef([]);
  const [items, setItems] = useState([]);
  const [splashes, setSplashes] = useState([]);
  const [handDots, setHandDots] = useState([]);
  const idc = useRef(1);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);
  const startTs = useRef(0);
  const onGrabRef = useRef(onGrab);
  useEffect(() => {
    onGrabRef.current = onGrab;
  }, [onGrab]);
  useEffect(() => {
    if (!active || !ready) return;
    let mounted = true;
    let raf = 0;
    lastFrame.current = 0;
    lastSpawn.current = 0;
    startTs.current = 0;
    const loop = (ts) => {
      if (!mounted) return;
      if (!startTs.current) startTs.current = ts;
      const dt = lastFrame.current ? Math.min(0.05, (ts - lastFrame.current) / 1e3) : 0;
      lastFrame.current = ts;
      const elapsed = (ts - startTs.current) / 1e3;
      const spawnEvery = Math.max(550, 1e3 - elapsed * 14);
      if (ts - lastSpawn.current > spawnEvery) {
        lastSpawn.current = ts;
        const type = Math.random() < APPLE_PROB ? "apple" : "pizza";
        itemsRef.current.push({
          id: idc.current++,
          type,
          x: 0.12 + Math.random() * 0.76,
          y: -0.1,
          vy: 0.16 + Math.random() * 0.13 + elapsed * 3e-3,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 140
        });
      }
      const hands = handsRef.current;
      const next = [];
      const newSplashes = [];
      for (const it of itemsRef.current) {
        it.y += it.vy * dt;
        it.rot += it.vrot * dt;
        let hit = false;
        for (const h of hands) {
          const dx = h.x - it.x;
          const dy = h.y - it.y;
          if (Math.hypot(dx, dy) < HIT_RADIUS$1) {
            hit = true;
            break;
          }
        }
        if (hit) {
          onGrabRef.current(it.type === "apple" ? 1 : -1);
          newSplashes.push({ id: idc.current++, x: it.x, y: it.y, type: it.type });
          continue;
        }
        if (it.y < 1.15) next.push(it);
      }
      itemsRef.current = next;
      setItems([...next]);
      setHandDots([...hands]);
      if (newSplashes.length) {
        setSplashes((s) => [...s, ...newSplashes]);
        for (const sp of newSplashes) {
          window.setTimeout(() => {
            setSplashes((arr) => arr.filter((x) => x.id !== sp.id));
          }, 650);
        }
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
      itemsRef.current = [];
      setItems([]);
      setSplashes([]);
      setHandDots([]);
    };
  }, [active, ready]);
  return /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground", children: [
    /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        playsInline: true,
        muted: true,
        className: "absolute inset-0 h-full w-full object-cover",
        style: { transform: "scaleX(-1)" }
      }
    ),
    (!ready || error) && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/90 text-background", children: error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "📷" }),
      /* @__PURE__ */ jsx("div", { className: "px-4 text-center text-sm font-semibold", children: T.cameraDenied[lang] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-background/30 border-t-background" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-bold uppercase tracking-widest", children: T.cameraNeeded[lang] })
    ] }) }),
    ready && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0", style: { transform: "scaleX(-1)" }, children: [
      handDots.map((h, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2",
          style: { left: `${h.x * 100}%`, top: `${h.y * 100}%` },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-14 w-14 rounded-full",
                style: {
                  background: "radial-gradient(circle, oklch(0.93 0.17 95 / 0.55) 0%, oklch(0.93 0.17 95 / 0) 70%)",
                  animation: "pulse 1.2s ease-in-out infinite"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground",
                style: { background: "oklch(0.78 0.17 165)", boxShadow: "0 0 12px oklch(0.78 0.17 165)" },
                children: /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center text-xs", style: { transform: "scaleX(-1)" }, children: "✋" })
              }
            )
          ]
        },
        i
      )),
      items.map((it) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2 will-change-transform",
          style: { left: `${it.x * 100}%`, top: `${it.y * 100}%` },
          children: /* @__PURE__ */ jsx(
            "span",
            {
              className: "block text-4xl sm:text-5xl",
              style: {
                transform: `scaleX(-1) rotate(${it.rot}deg)`,
                filter: it.type === "apple" ? "drop-shadow(0 0 10px oklch(0.78 0.17 165)) drop-shadow(2px 3px 0 rgba(0,0,0,0.35))" : "drop-shadow(0 0 10px oklch(0.72 0.2 5)) drop-shadow(2px 3px 0 rgba(0,0,0,0.35))"
              },
              children: it.type === "apple" ? "🍎" : "🍕"
            }
          )
        },
        it.id
      )),
      splashes.map((sp) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2",
          style: { left: `${sp.x * 100}%`, top: `${sp.y * 100}%` },
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "display animate-float-up text-3xl sm:text-4xl",
              style: {
                transform: "scaleX(-1)",
                color: sp.type === "apple" ? "oklch(0.78 0.17 165)" : "oklch(0.72 0.2 5)",
                textShadow: "2px 2px 0 #1a1a2e"
              },
              children: sp.type === "apple" ? "+1" : "-1"
            }
          )
        },
        sp.id
      ))
    ] }),
    ready && /* @__PURE__ */ jsxs("div", { className: "absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "relative inline-flex h-2 w-2 rounded-full",
          style: { background: "oklch(0.78 0.17 165)", boxShadow: "0 0 6px oklch(0.78 0.17 165)" }
        }
      ),
      status === "ready" ? "AI HANDS" : T.scanning[lang]
    ] }),
    ready && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: T.grab_intro[lang] }),
    ready && status === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 top-9 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: "Loading AI model…" })
  ] });
}
const TELEGRAPH_MS = 1100;
const STRIKE_MS = 220;
const RECOVER_MS = 700;
const STUN_MS = 750;
const PLAYER_COOLDOWN_MS = 280;
const PUNCH_VEL_MULT = 1.8;
const PUNCH_EXT_MULT = 0.45;
const PUNCH_REARM_MULT = 0.3;
const KICK_LIFT_MULT = 0.45;
const KICK_REARM_MULT = 0.2;
const BLOCK_HOLD_MS = 140;
function KarateGame({ active, lang, onKarate }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
          });
          setReady(true);
        }
      } catch (e) {
        setError(e.message || "denied");
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
  const playerRef = useRef({
    punchEvent: false,
    kickEvent: false,
    blocking: false
  });
  const detectorRef = useRef({
    lArmed: true,
    rArmed: true,
    lKickArmed: true,
    rKickArmed: true,
    blockStartTs: 0,
    prev: { lx: 0, ly: 0, rx: 0, ry: 0, ts: 0, hasL: false, hasR: false }
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
    const ok = (k) => !!k && (k.score ?? 0) > 0.25;
    if (!ok(lS) || !ok(rS)) return;
    const shoulderSpan = Math.max(20, Math.hypot(lS.x - rS.x, lS.y - rS.y));
    const shCenterX = (lS.x + rS.x) / 2;
    const shCenterY = (lS.y + rS.y) / 2;
    const hipY = ok(lH) && ok(rH) ? (lH.y + rH.y) / 2 : shCenterY + shoulderSpan * 1.4;
    const torso = Math.max(40, hipY - shCenterY);
    const d = detectorRef.current;
    const dt = d.prev.ts ? Math.max(1e-3, (now - d.prev.ts) / 1e3) : 0.016;
    let punchEvent = false;
    let kickEvent = false;
    const checkPunch = (w, armed, prevX, prevY, has) => {
      if (!ok(w)) {
        d.prev[has] = false;
        return false;
      }
      const ext = Math.abs(w.x - shCenterX) / shoulderSpan;
      const aboveBelt = w.y < hipY - shoulderSpan * 0.2;
      let v = 0;
      if (d.prev[has]) {
        v = Math.hypot(w.x - d.prev[prevX], w.y - d.prev[prevY]) / dt / shoulderSpan;
      }
      d.prev[prevX] = w.x;
      d.prev[prevY] = w.y;
      d.prev[has] = true;
      if (ext < PUNCH_REARM_MULT) d[armed] = true;
      if (d[armed] && aboveBelt && ext > PUNCH_EXT_MULT && v > PUNCH_VEL_MULT) {
        d[armed] = false;
        return true;
      }
      return false;
    };
    if (checkPunch(lW, "lArmed", "lx", "ly", "hasL")) punchEvent = true;
    if (checkPunch(rW, "rArmed", "rx", "ry", "hasR")) punchEvent = true;
    d.prev.ts = now;
    const checkKick = (a, armed) => {
      if (!ok(a) || !ok(lH) || !ok(rH)) return false;
      const lift = (hipY - a.y) / torso;
      if (lift < KICK_REARM_MULT) d[armed] = true;
      if (d[armed] && lift > KICK_LIFT_MULT) {
        d[armed] = false;
        return true;
      }
      return false;
    };
    if (checkKick(lA, "lKickArmed")) kickEvent = true;
    if (checkKick(rA, "rKickArmed")) kickEvent = true;
    let blocking = false;
    if (ok(lW) && ok(rW) && ok(nose)) {
      const guardTop = nose.y - shoulderSpan * 0.3;
      const guardBot = shCenterY + shoulderSpan * 0.4;
      const inBand = (y) => y > guardTop && y < guardBot;
      const wristsClose = Math.abs(lW.x - rW.x) < shoulderSpan * 1.6;
      const inGuard = inBand(lW.y) && inBand(rW.y) && wristsClose;
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
  const [opp, setOpp] = useState({
    state: "idle",
    attack: "punch",
    until: 0
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
  useEffect(() => {
    onKarateRef.current = onKarate;
  }, [onKarate]);
  const [fx, setFx] = useState([]);
  const fxId = useRef(1);
  function pushFx(text, tone, x = 50, y = 50) {
    const id = fxId.current++;
    setFx((f) => [...f, { id, text, tone, x, y }]);
    window.setTimeout(() => setFx((f) => f.filter((e) => e.id !== id)), 900);
  }
  const lastPlayerHitTs = useRef(0);
  const lastStrikeResolvedRef = useRef(0);
  useEffect(() => {
    if (!active || !ready) return;
    let mounted = true;
    let raf = 0;
    const loop = () => {
      if (!mounted) return;
      const now = performance.now();
      const o = oppRef.current;
      const p = playerRef.current;
      if (o.state !== "ko") {
        if (now >= o.until) {
          if (o.state === "idle") {
            const attack = Math.random() < 0.55 ? "punch" : "kick";
            const next2 = { state: "telegraph", attack, until: now + TELEGRAPH_MS };
            setOpp(next2);
            oppRef.current = next2;
          } else if (o.state === "telegraph") {
            const next2 = { state: "strike", attack: o.attack, until: now + STRIKE_MS };
            setOpp(next2);
            oppRef.current = next2;
            lastStrikeResolvedRef.current = 0;
          } else if (o.state === "strike") {
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
            const next2 = { state: "recover", attack: o.attack, until: now + RECOVER_MS };
            setOpp(next2);
            oppRef.current = next2;
          } else if (o.state === "recover" || o.state === "stunned") {
            const idleFor = 350 + Math.random() * 450;
            const next2 = { state: "idle", attack: o.attack, until: now + idleFor };
            setOpp(next2);
            oppRef.current = next2;
          }
        } else if (o.state === "strike" && !lastStrikeResolvedRef.current && p.blocking) {
          lastStrikeResolvedRef.current = now;
          pushFx("BLOCK!", "good", 50, 55);
          onKarateRef.current({ kind: "blocked", magnitude: 0 });
        }
      }
      const canAttack = now - lastPlayerHitTs.current > PLAYER_COOLDOWN_MS;
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
        const next2 = { state: "stunned", attack: oppRef.current.attack, until: now + STUN_MS };
        setOpp(next2);
        oppRef.current = next2;
        if (newHP <= 0) {
          const ko = { state: "ko", attack: oppRef.current.attack, until: Number.POSITIVE_INFINITY };
          setOpp(ko);
          oppRef.current = ko;
          pushFx("K.O.!", "good", 50, 35);
          onKarateRef.current({ kind: "ko-win", magnitude: 25 });
        }
      }
      if (playerHPRef.current <= 0 && oppRef.current.state !== "ko") {
        const ko = { state: "idle", attack: "punch", until: now + 9999 };
        setOpp(ko);
        oppRef.current = ko;
        pushFx("DOWN!", "bad", 30, 35);
        onKarateRef.current({ kind: "ko-lose", magnitude: 25 });
        window.setTimeout(() => {
          setPlayerHP(50);
          playerHPRef.current = 50;
        }, 800);
      }
      if (oppRef.current.state === "ko" && oppHPRef.current <= 0) {
        window.setTimeout(() => {
          setOppHP(70);
          oppHPRef.current = 70;
          const next2 = { state: "idle", attack: "punch", until: performance.now() + 700 };
          setOpp(next2);
          oppRef.current = next2;
        }, 900);
        oppHPRef.current = 1;
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    const next = { state: "idle", attack: "punch", until: performance.now() + 1200 };
    setOpp(next);
    oppRef.current = next;
    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
    };
  }, [active, ready]);
  const oppPose = getOpponentPose(opp.state, opp.attack);
  const ringHue = opp.state === "telegraph" ? "oklch(0.93 0.17 95)" : opp.state === "strike" ? "oklch(0.72 0.2 5)" : opp.state === "ko" ? "oklch(0.55 0.18 25)" : "oklch(0.78 0.17 165)";
  return /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground", children: [
    /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        playsInline: true,
        muted: true,
        className: "absolute inset-0 h-full w-full object-cover opacity-90",
        style: { transform: "scaleX(-1)" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none absolute inset-0",
        style: {
          background: "linear-gradient(180deg, oklch(0.2 0.05 260 / 0.45) 0%, oklch(0.2 0.05 260 / 0.05) 35%, oklch(0.2 0.05 260 / 0.55) 100%)"
        }
      }
    ),
    (!ready || error) && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/90 text-background", children: error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "📷" }),
      /* @__PURE__ */ jsx("div", { className: "px-4 text-center text-sm font-semibold", children: T.cameraDenied[lang] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-background/30 border-t-background" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-bold uppercase tracking-widest", children: T.cameraNeeded[lang] })
    ] }) }),
    ready && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute left-2 right-2 top-2 grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsx(HPBar, { label: T.you[lang], hp: playerHP, tone: "oklch(0.78 0.17 165)" }),
        /* @__PURE__ */ jsx(HPBar, { label: "SENSEI", hp: oppHP, tone: "oklch(0.72 0.2 5)", rtl: true })
      ] }),
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "pointer-events-none absolute inset-0 h-full w-full", children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: "oppGlow", cx: "50%", cy: "50%", r: "50%", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: ringHue, stopOpacity: "0.55" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: ringHue, stopOpacity: "0" })
        ] }) }),
        /* @__PURE__ */ jsx("ellipse", { cx: "80", cy: "95", rx: "14", ry: "2", fill: "url(#oppGlow)" }),
        /* @__PURE__ */ jsx(Karateka, { pose: oppPose, state: opp.state }),
        opp.state === "telegraph" && /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsxs("circle", { cx: "80", cy: "52", r: "14", fill: "none", stroke: ringHue, strokeWidth: "0.8", strokeDasharray: "2 1.5", children: [
          /* @__PURE__ */ jsx("animate", { attributeName: "r", from: "14", to: "20", dur: "0.8s", repeatCount: "indefinite" }),
          /* @__PURE__ */ jsx("animate", { attributeName: "opacity", from: "0.9", to: "0", dur: "0.8s", repeatCount: "indefinite" })
        ] }) })
      ] }),
      opp.state === "telegraph" && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground bg-secondary px-4 py-1.5 text-center text-xs font-bold uppercase tracking-widest animate-pop", children: opp.attack === "punch" ? `🥊 ${T.karate_block[lang]}` : `🦵 ${T.karate_block[lang]}` }),
      (opp.state === "stunned" || opp.state === "recover") && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest animate-pop", children: T.karate_strike[lang] }),
      opp.state === "ko" && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-3 top-1/3 rounded-2xl border-[3px] border-foreground bg-accent px-4 py-2 text-center text-2xl font-bold animate-pop", children: T.karate_ko[lang] }),
      fx.map((e) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "display pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-float-up text-2xl",
          style: {
            left: `${e.x}%`,
            top: `${e.y}%`,
            color: e.tone === "good" ? "oklch(0.78 0.17 165)" : e.tone === "warn" ? "oklch(0.93 0.17 95)" : "oklch(0.72 0.2 5)",
            textShadow: "2px 2px 0 #1a1a2e"
          },
          children: e.text
        },
        e.id
      )),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-2 bottom-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", children: [
        /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full", style: { background: ringHue, boxShadow: `0 0 6px ${ringHue}` } }),
        status === "ready" ? "AI DOJO" : T.scanning[lang]
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 bottom-2 ml-24 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: T.karate_intro[lang] })
    ] })
  ] });
}
function HPBar({ label, hp, tone, rtl }) {
  return /* @__PURE__ */ jsxs("div", { className: `chunky bg-background px-2 py-1 ${rtl ? "text-right" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[9px] font-bold uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx("span", { children: label }),
      /* @__PURE__ */ jsxs("span", { children: [
        hp,
        " HP"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 h-2 w-full overflow-hidden rounded-full border-2 border-foreground bg-muted", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full transition-[width] duration-200",
        style: { width: `${hp}%`, background: tone, marginLeft: rtl ? `${100 - hp}%` : 0 }
      }
    ) })
  ] });
}
function getOpponentPose(state, attack) {
  const base = {
    head: { x: 80, y: 40 },
    body: { x: 80, y: 56 },
    hip: { x: 80, y: 70 },
    fHand: { x: 73, y: 58 },
    // lead guard
    rHand: { x: 85, y: 64 },
    // rear chamber
    fKnee: { x: 75, y: 81 },
    rKnee: { x: 86, y: 82 },
    fFoot: { x: 72, y: 93 },
    rFoot: { x: 90, y: 94 }
  };
  if (state === "telegraph") {
    if (attack === "punch") {
      base.rHand = { x: 92, y: 50 };
      base.body.x = 82;
      base.head.x = 82;
    } else {
      base.rKnee = { x: 84, y: 66 };
      base.rFoot = { x: 86, y: 74 };
      base.body.y = 54;
    }
  } else if (state === "strike") {
    if (attack === "punch") {
      base.rHand = { x: 55, y: 54 };
      base.fHand = { x: 78, y: 60 };
      base.body.x = 76;
      base.head.x = 78;
    } else {
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
    base.head = { x: 58, y: 84 };
    base.body = { x: 68, y: 86 };
    base.hip = { x: 78, y: 88 };
    base.fHand = { x: 52, y: 88 };
    base.rHand = { x: 76, y: 84 };
    base.fKnee = { x: 84, y: 88 };
    base.rKnee = { x: 88, y: 87 };
    base.fFoot = { x: 92, y: 88 };
    base.rFoot = { x: 94, y: 86 };
  }
  return base;
}
function Karateka({ pose, state }) {
  const giLight = "oklch(0.98 0.005 90)";
  const giShade = "oklch(0.88 0.01 80)";
  const giDeep = "oklch(0.78 0.015 70)";
  const belt = "oklch(0.45 0.18 28)";
  const beltEdge = "oklch(0.32 0.14 28)";
  const skin = "oklch(0.86 0.05 70)";
  const skinShade = "oklch(0.74 0.06 50)";
  const hair = "oklch(0.22 0.04 280)";
  const outline = "oklch(0.18 0.04 270)";
  const shake = state === "stunned" ? "translate(0.5, -0.2) rotate(-1.5, 80, 70)" : void 0;
  const ko = state === "ko";
  const limb = (a, b, color, w = 3.6) => /* @__PURE__ */ jsx("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: color, strokeWidth: w, strokeLinecap: "round" });
  return /* @__PURE__ */ jsxs("g", { transform: shake, children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: "giGrad", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: giLight }),
        /* @__PURE__ */ jsx("stop", { offset: "60%", stopColor: giLight }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: giShade })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "skinGrad", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: skin }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: skinShade })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "beltGrad", x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: belt }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: beltEdge })
      ] })
    ] }),
    !ko && /* @__PURE__ */ jsx("ellipse", { cx: pose.hip.x + 1, cy: "95", rx: "11", ry: "1.4", fill: "oklch(0.15 0.03 270 / 0.55)" }),
    limb(pose.hip, pose.fKnee, giShade, 5),
    limb(pose.fKnee, pose.fFoot, giShade, 4.6),
    limb(pose.hip, pose.rKnee, giDeep, 5),
    limb(pose.rKnee, pose.rFoot, giDeep, 4.6),
    /* @__PURE__ */ jsx("ellipse", { cx: pose.fFoot.x, cy: pose.fFoot.y, rx: "2.4", ry: "1.1", fill: skin, stroke: outline, strokeWidth: "0.4" }),
    /* @__PURE__ */ jsx("ellipse", { cx: pose.rFoot.x, cy: pose.rFoot.y, rx: "2.4", ry: "1.1", fill: skinShade, stroke: outline, strokeWidth: "0.4" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${pose.body.x - 8.5} ${pose.body.y - 7}
            Q ${pose.body.x} ${pose.body.y - 9} ${pose.body.x + 8.5} ${pose.body.y - 7}
            L ${pose.hip.x + 7.5} ${pose.hip.y + 1}
            Q ${pose.hip.x} ${pose.hip.y + 2.5} ${pose.hip.x - 7.5} ${pose.hip.y + 1} Z`,
        fill: "url(#giGrad)",
        stroke: outline,
        strokeWidth: "0.5"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${pose.body.x - 8} ${pose.body.y - 6.5}
            L ${pose.body.x} ${pose.hip.y - 3}
            L ${pose.body.x + 8} ${pose.body.y - 6.5}`,
        fill: "none",
        stroke: giDeep,
        strokeWidth: "0.7"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${pose.body.x - 8} ${pose.body.y - 6.5}
            L ${pose.body.x + 1.5} ${pose.hip.y - 1}
            L ${pose.body.x + 8} ${pose.body.y - 6.5} Z`,
        fill: giShade,
        opacity: "0.55"
      }
    ),
    /* @__PURE__ */ jsx(
      "rect",
      {
        x: pose.hip.x - 8.5,
        y: pose.hip.y - 1.8,
        width: "17",
        height: "3.2",
        fill: "url(#beltGrad)",
        stroke: outline,
        strokeWidth: "0.4",
        rx: "0.6"
      }
    ),
    /* @__PURE__ */ jsx(
      "rect",
      {
        x: pose.hip.x - 2.6,
        y: pose.hip.y - 2.6,
        width: "5.2",
        height: "4.8",
        fill: belt,
        stroke: outline,
        strokeWidth: "0.4",
        rx: "0.8"
      }
    ),
    /* @__PURE__ */ jsx("rect", { x: pose.hip.x - 2.3, y: pose.hip.y + 1.4, width: "1.8", height: "4.5", fill: belt, stroke: outline, strokeWidth: "0.3", rx: "0.4" }),
    /* @__PURE__ */ jsx("rect", { x: pose.hip.x + 0.6, y: pose.hip.y + 1.4, width: "1.8", height: "5.2", fill: beltEdge, stroke: outline, strokeWidth: "0.3", rx: "0.4" }),
    limb({ x: pose.body.x - 7, y: pose.body.y - 5 }, pose.fHand, giShade, 4.4),
    limb({ x: pose.body.x + 7, y: pose.body.y - 5 }, pose.rHand, giDeep, 4.4),
    /* @__PURE__ */ jsx("circle", { cx: pose.fHand.x, cy: pose.fHand.y, r: "2.4", fill: giLight, stroke: outline, strokeWidth: "0.5" }),
    /* @__PURE__ */ jsx("circle", { cx: pose.rHand.x, cy: pose.rHand.y, r: "2.4", fill: giLight, stroke: outline, strokeWidth: "0.5" }),
    /* @__PURE__ */ jsx("circle", { cx: pose.fHand.x, cy: pose.fHand.y, r: "1.8", fill: "url(#skinGrad)", stroke: outline, strokeWidth: "0.4" }),
    /* @__PURE__ */ jsx("circle", { cx: pose.rHand.x, cy: pose.rHand.y, r: "1.8", fill: "url(#skinGrad)", stroke: outline, strokeWidth: "0.4" }),
    /* @__PURE__ */ jsx("rect", { x: pose.head.x - 1.6, y: pose.head.y + 3.5, width: "3.2", height: "2.4", fill: skinShade }),
    /* @__PURE__ */ jsx("circle", { cx: pose.head.x, cy: pose.head.y, r: "5", fill: "url(#skinGrad)", stroke: outline, strokeWidth: "0.55" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${pose.head.x - 4.6} ${pose.head.y - 1.5}
            Q ${pose.head.x - 3.2} ${pose.head.y - 6} ${pose.head.x} ${pose.head.y - 5.2}
            Q ${pose.head.x + 3.8} ${pose.head.y - 5.6} ${pose.head.x + 4.7} ${pose.head.y - 0.8}
            Q ${pose.head.x + 2.8} ${pose.head.y - 2.4} ${pose.head.x - 1.2} ${pose.head.y - 2.4}
            Q ${pose.head.x - 3.8} ${pose.head.y - 1.6} ${pose.head.x - 4.6} ${pose.head.y - 1.5} Z`,
        fill: hair
      }
    ),
    /* @__PURE__ */ jsx("rect", { x: pose.head.x - 4.8, y: pose.head.y - 1, width: "9.6", height: "1.5", fill: belt, stroke: outline, strokeWidth: "0.35" }),
    /* @__PURE__ */ jsx("rect", { x: pose.head.x + 4, y: pose.head.y - 0.6, width: "2.2", height: "0.7", fill: beltEdge }),
    /* @__PURE__ */ jsx("rect", { x: pose.head.x + 4.4, y: pose.head.y + 0.5, width: "0.6", height: "2.2", fill: belt }),
    !ko ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("ellipse", { cx: pose.head.x - 1.5, cy: pose.head.y + 1.6, rx: "0.55", ry: "0.7", fill: outline }),
      /* @__PURE__ */ jsx("ellipse", { cx: pose.head.x + 1.5, cy: pose.head.y + 1.6, rx: "0.55", ry: "0.7", fill: outline }),
      /* @__PURE__ */ jsx("line", { x1: pose.head.x - 2.6, y1: pose.head.y + 0.5, x2: pose.head.x - 0.7, y2: pose.head.y + 1.2, stroke: outline, strokeWidth: "0.65", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("line", { x1: pose.head.x + 2.6, y1: pose.head.y + 0.5, x2: pose.head.x + 0.7, y2: pose.head.y + 1.2, stroke: outline, strokeWidth: "0.65", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("line", { x1: pose.head.x - 1.2, y1: pose.head.y + 3.2, x2: pose.head.x + 1.2, y2: pose.head.y + 3.2, stroke: outline, strokeWidth: "0.5", strokeLinecap: "round" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("text", { x: pose.head.x - 2.4, y: pose.head.y + 2.4, fontSize: "2.4", fill: outline, fontWeight: "bold", children: "×" }),
      /* @__PURE__ */ jsx("text", { x: pose.head.x + 0.4, y: pose.head.y + 2.4, fontSize: "2.4", fill: outline, fontWeight: "bold", children: "×" }),
      /* @__PURE__ */ jsx("path", { d: `M ${pose.head.x - 1.2} ${pose.head.y + 3.6} Q ${pose.head.x} ${pose.head.y + 4.5} ${pose.head.x + 1.2} ${pose.head.y + 3.6}`, stroke: outline, strokeWidth: "0.5", fill: "none" })
    ] }),
    state === "strike" && /* @__PURE__ */ jsxs("g", { opacity: "0.9", children: [
      /* @__PURE__ */ jsx("line", { x1: "48", y1: "55", x2: "42", y2: "52", stroke: "oklch(0.93 0.17 95)", strokeWidth: "1", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "44", y2: "60", stroke: "oklch(0.93 0.17 95)", strokeWidth: "1", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("line", { x1: "50", y1: "56", x2: "46", y2: "56", stroke: "oklch(0.99 0 0)", strokeWidth: "1.2", strokeLinecap: "round" })
    ] })
  ] });
}
const UP_THRESH = 0.95;
const DOWN_THRESH = 0.2;
function LiftGame({ active, lang, onLift }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
          });
          setReady(true);
        }
      } catch (e) {
        setError(e.message || "denied");
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
  const [bar, setBar] = useState(null);
  const [flashes, setFlashes] = useState([]);
  const phaseRef = useRef("down");
  const peakLiftRef = useRef(0);
  const worstLevelRef = useRef(0);
  const idc = useRef(1);
  const onLiftRef = useRef(onLift);
  useEffect(() => {
    onLiftRef.current = onLift;
  }, [onLift]);
  useEffect(() => {
    if (!keypoints || size.w <= 0 || size.h <= 0) return;
    const lW = keypoints[KP.lWrist];
    const rW = keypoints[KP.rWrist];
    const lS = keypoints[KP.lShoulder];
    const rS = keypoints[KP.rShoulder];
    const lH = keypoints[KP.lHip];
    const rH = keypoints[KP.rHip];
    const ok = (k) => k && (k.score ?? 0) > 0.3;
    if (!ok(lW) || !ok(rW) || !ok(lS) || !ok(rS)) {
      setBar(null);
      return;
    }
    const nx = (k) => k.x / size.w;
    const ny = (k) => k.y / size.h;
    const l = { x: nx(lW), y: ny(lW) };
    const r = { x: nx(rW), y: ny(rW) };
    const shoulderY = (ny(lS) + ny(rS)) / 2;
    const shoulderW = Math.abs(nx(lS) - nx(rS)) || 0.18;
    const hipY = ok(lH) && ok(rH) ? (ny(lH) + ny(rH)) / 2 : shoulderY + 0.28;
    const torso = Math.max(0.12, hipY - shoulderY);
    const avgWristY = (l.y + r.y) / 2;
    const lift = (shoulderY - avgWristY) / torso;
    const levelErr = Math.abs(l.y - r.y) / torso;
    const widthErr = Math.abs(Math.abs(l.x - r.x) - shoulderW * 1.4) / shoulderW;
    const grip = Math.max(0, 1 - levelErr * 1.6 - widthErr * 0.4);
    setBar({ l, r, grip, lift, gripping: true });
    if (phaseRef.current === "down") {
      if (lift > UP_THRESH) {
        phaseRef.current = "up";
        peakLiftRef.current = lift;
        worstLevelRef.current = levelErr;
      }
    } else {
      peakLiftRef.current = Math.max(peakLiftRef.current, lift);
      worstLevelRef.current = Math.max(worstLevelRef.current, levelErr);
      if (lift < DOWN_THRESH) {
        phaseRef.current = "down";
        const rom = Math.min(1, peakLiftRef.current / 1.25);
        const levelScore = Math.max(0, 1 - worstLevelRef.current * 2.2);
        const quality = Math.round(Math.min(100, rom * 55 + levelScore * 45));
        onLiftRef.current(quality);
        setFlashes((f) => {
          const id = idc.current++;
          const flash = { id, x: (l.x + r.x) / 2, y: avgWristY, quality };
          window.setTimeout(() => setFlashes((arr) => arr.filter((x) => x.id !== id)), 900);
          return [...f, flash];
        });
      }
    }
  }, [keypoints, size]);
  useEffect(() => {
    if (!active) {
      phaseRef.current = "down";
      peakLiftRef.current = 0;
      worstLevelRef.current = 0;
      setBar(null);
      setFlashes([]);
    }
  }, [active]);
  const barAngle = bar ? Math.atan2(bar.r.y - bar.l.y, bar.r.x - bar.l.x) * 180 / Math.PI : 0;
  const barMidX = bar ? (bar.l.x + bar.r.x) / 2 * 100 : 50;
  const barMidY = bar ? (bar.l.y + bar.r.y) / 2 * 100 : 50;
  const barLen = bar ? Math.hypot(bar.r.x - bar.l.x, bar.r.y - bar.l.y) * 100 : 30;
  const liftPct = bar ? Math.max(0, Math.min(1, bar.lift / 1.25)) : 0;
  const gripGood = bar ? bar.grip > 0.55 : false;
  return /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground", children: [
    /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        playsInline: true,
        muted: true,
        className: "absolute inset-0 h-full w-full object-cover",
        style: { transform: "scaleX(-1)" }
      }
    ),
    (!ready || error) && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/90 text-background", children: error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "📷" }),
      /* @__PURE__ */ jsx("div", { className: "px-4 text-center text-sm font-semibold", children: T.cameraDenied[lang] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-background/30 border-t-background" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-bold uppercase tracking-widest", children: T.cameraNeeded[lang] })
    ] }) }),
    ready && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0", style: { transform: "scaleX(-1)" }, children: [
      bar && /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2",
          style: {
            left: `${barMidX}%`,
            top: `${barMidY}%`,
            width: `${Math.max(barLen, 18)}%`,
            transform: `translate(-50%,-50%) rotate(${barAngle}deg)`
          },
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative h-2.5 w-full rounded-full border-2 border-foreground",
              style: {
                background: gripGood ? "linear-gradient(90deg, oklch(0.78 0.17 165), oklch(0.93 0.17 95), oklch(0.78 0.17 165))" : "linear-gradient(90deg, oklch(0.7 0.02 250), oklch(0.85 0.02 250), oklch(0.7 0.02 250))",
                boxShadow: gripGood ? "0 0 16px oklch(0.85 0.17 130)" : "0 0 6px oklch(0 0 0 / 0.4)"
              },
              children: [
                /* @__PURE__ */ jsx("span", { className: "absolute -left-1.5 top-1/2 h-8 w-3 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "absolute -right-1.5 top-1/2 h-8 w-3 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "absolute left-0.5 top-1/2 h-6 w-2 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "absolute right-0.5 top-1/2 h-6 w-2 -translate-y-1/2 rounded-md border-2 border-foreground bg-foreground" })
              ]
            }
          )
        }
      ),
      bar && [bar.l, bar.r].map((h, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2",
          style: { left: `${h.x * 100}%`, top: `${h.y * 100}%` },
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-6 w-6 rounded-full border-[3px] border-foreground",
              style: {
                background: gripGood ? "oklch(0.78 0.17 165)" : "oklch(0.99 0 0)",
                boxShadow: gripGood ? "0 0 12px oklch(0.78 0.17 165)" : "none"
              }
            }
          )
        },
        i
      )),
      flashes.map((f) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2",
          style: { left: `${f.x * 100}%`, top: `${f.y * 100}%` },
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "display animate-float-up text-3xl sm:text-4xl",
              style: {
                transform: "scaleX(-1)",
                color: f.quality >= 70 ? "oklch(0.78 0.17 165)" : "oklch(0.93 0.17 95)",
                textShadow: "2px 2px 0 #1a1a2e"
              },
              children: [
                "+",
                Math.max(1, Math.round(f.quality / 10))
              ]
            }
          )
        },
        f.id
      ))
    ] }),
    ready && /* @__PURE__ */ jsx("div", { className: "absolute right-2 top-9 bottom-9 flex w-3 flex-col-reverse overflow-hidden rounded-full border-2 border-foreground bg-background/70", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-full rounded-full transition-[height] duration-100",
        style: {
          height: `${liftPct * 100}%`,
          background: "linear-gradient(0deg, oklch(0.78 0.17 165), oklch(0.93 0.17 95))"
        }
      }
    ) }),
    ready && /* @__PURE__ */ jsxs("div", { className: "absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "relative inline-flex h-2 w-2 rounded-full",
          style: { background: "oklch(0.78 0.17 165)", boxShadow: "0 0 6px oklch(0.78 0.17 165)" }
        }
      ),
      status === "ready" ? "AI BARBELL" : T.scanning[lang]
    ] }),
    ready && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: !bar ? T.lift_grip[lang] : T.lift_intro[lang] }),
    ready && status === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 top-9 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: "Loading AI model…" })
  ] });
}
const FRUITS = ["🍉", "🍓", "🍊", "🍋", "🍇", "🍑", "🍍", "🥝", "🍎", "🍒", "🥭"];
const HIT_RADIUS = 0.1;
const SLICE_SPEED = 0.45;
const TRAIL_LEN = 8;
function SliceGame({ active, lang, onSlice }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
          });
          setReady(true);
        }
      } catch (e) {
        setError(e.message || "denied");
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
  const handsRef = useRef([]);
  const prevHandsRef = useRef({ ts: 0 });
  useEffect(() => {
    if (!keypoints || size.w <= 0 || size.h <= 0) return;
    const now = performance.now();
    const dt = prevHandsRef.current.ts ? Math.max(1e-3, (now - prevHandsRef.current.ts) / 1e3) : 0.016;
    const hs = [];
    const prev = prevHandsRef.current;
    const nextPrev = { ts: now };
    for (const [idx, name] of [[KP.lWrist, "lWrist"], [KP.rWrist, "rWrist"]]) {
      const k = keypoints[idx];
      if (k && (k.score ?? 0) > 0.3) {
        const x = k.x / size.w;
        const y = k.y / size.h;
        const p = prev[name];
        const vx = p ? (x - p.x) / dt : 0;
        const vy = p ? (y - p.y) / dt : 0;
        hs.push({ x, y, vx, vy });
        nextPrev[name] = { x, y };
      }
    }
    prevHandsRef.current = nextPrev;
    handsRef.current = hs;
  }, [keypoints, size]);
  const fruitsRef = useRef([]);
  const [fruits, setFruits] = useState([]);
  const [slices, setSlices] = useState([]);
  const [trail, setTrail] = useState([]);
  const trailRef = useRef([[], []]);
  const idc = useRef(1);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);
  const startTs = useRef(0);
  const onSliceRef = useRef(onSlice);
  useEffect(() => {
    onSliceRef.current = onSlice;
  }, [onSlice]);
  useEffect(() => {
    if (!active || !ready) return;
    let mounted = true;
    let raf = 0;
    lastFrame.current = 0;
    lastSpawn.current = 0;
    startTs.current = 0;
    trailRef.current = [[], []];
    const loop = (ts) => {
      if (!mounted) return;
      if (!startTs.current) startTs.current = ts;
      const dt = lastFrame.current ? Math.min(0.05, (ts - lastFrame.current) / 1e3) : 0;
      lastFrame.current = ts;
      const elapsed = (ts - startTs.current) / 1e3;
      const spawnEvery = Math.max(500, 950 - elapsed * 12);
      if (ts - lastSpawn.current > spawnEvery) {
        lastSpawn.current = ts;
        fruitsRef.current.push({
          id: idc.current++,
          emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)],
          x: 0.12 + Math.random() * 0.76,
          y: -0.1,
          vy: 0.15 + Math.random() * 0.12 + elapsed * 3e-3,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 160
        });
      }
      const hands = handsRef.current;
      for (let i = 0; i < 2; i++) {
        const h = hands[i];
        const arr = trailRef.current[i] ?? (trailRef.current[i] = []);
        if (h) {
          arr.push({ x: h.x, y: h.y });
          while (arr.length > TRAIL_LEN) arr.shift();
        } else if (arr.length) {
          arr.shift();
        }
      }
      const next = [];
      const newSlices = [];
      for (const fr of fruitsRef.current) {
        fr.y += fr.vy * dt;
        fr.rot += fr.vrot * dt;
        let sliced = false;
        for (const h of hands) {
          const dx = h.x - fr.x;
          const dy = h.y - fr.y;
          const speed = Math.hypot(h.vx, h.vy);
          if (Math.hypot(dx, dy) < HIT_RADIUS && speed > SLICE_SPEED) {
            sliced = true;
            const angle = Math.atan2(h.vy, h.vx) * 180 / Math.PI;
            newSlices.push({ id: idc.current++, x: fr.x, y: fr.y, emoji: fr.emoji, angle });
            break;
          }
        }
        if (sliced) {
          onSliceRef.current(1);
          continue;
        }
        if (fr.y < 1.15) next.push(fr);
      }
      fruitsRef.current = next;
      setFruits([...next]);
      setTrail(trailRef.current.map((a) => [...a]));
      if (newSlices.length) {
        setSlices((s) => [...s, ...newSlices]);
        for (const sp of newSlices) {
          window.setTimeout(() => {
            setSlices((arr) => arr.filter((x) => x.id !== sp.id));
          }, 700);
        }
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(raf);
      fruitsRef.current = [];
      setFruits([]);
      setSlices([]);
      setTrail([]);
    };
  }, [active, ready]);
  return /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border-[3px] border-foreground bg-foreground", children: [
    /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        playsInline: true,
        muted: true,
        className: "absolute inset-0 h-full w-full object-cover",
        style: { transform: "scaleX(-1)" }
      }
    ),
    (!ready || error) && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/90 text-background", children: error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "📷" }),
      /* @__PURE__ */ jsx("div", { className: "px-4 text-center text-sm font-semibold", children: T.cameraDenied[lang] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-background/30 border-t-background" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-bold uppercase tracking-widest", children: T.cameraNeeded[lang] })
    ] }) }),
    ready && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0", style: { transform: "scaleX(-1)" }, children: [
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "absolute inset-0 h-full w-full", children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "blade", x1: "0", y1: "0", x2: "1", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.93 0.17 95 / 0)" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.93 0.17 95)" })
        ] }) }),
        trail.map(
          (arr, i) => arr.length > 1 ? /* @__PURE__ */ jsx(
            "polyline",
            {
              points: arr.map((p) => `${p.x * 100},${p.y * 100}`).join(" "),
              fill: "none",
              stroke: "url(#blade)",
              strokeWidth: 2.4,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              style: { filter: "drop-shadow(0 0 3px oklch(0.93 0.17 95))" }
            },
            i
          ) : null
        )
      ] }),
      trail.map((arr, i) => {
        const tip = arr[arr.length - 1];
        if (!tip) return null;
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute -translate-x-1/2 -translate-y-1/2",
            style: { left: `${tip.x * 100}%`, top: `${tip.y * 100}%` },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-7 w-7 rounded-full border-[3px] border-foreground",
                style: { background: "oklch(0.93 0.17 95)", boxShadow: "0 0 14px oklch(0.93 0.17 95)" },
                children: /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center text-sm", style: { transform: "scaleX(-1)" }, children: "🗡️" })
              }
            )
          },
          i
        );
      }),
      fruits.map((fr) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2 will-change-transform",
          style: { left: `${fr.x * 100}%`, top: `${fr.y * 100}%` },
          children: /* @__PURE__ */ jsx(
            "span",
            {
              className: "block text-4xl sm:text-5xl",
              style: {
                transform: `scaleX(-1) rotate(${fr.rot}deg)`,
                filter: "drop-shadow(0 0 9px oklch(0.78 0.17 165 / 0.6)) drop-shadow(2px 3px 0 rgba(0,0,0,0.35))"
              },
              children: fr.emoji
            }
          )
        },
        fr.id
      )),
      slices.map((sp) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "absolute -translate-x-1/2 -translate-y-1/2",
          style: { left: `${sp.x * 100}%`, top: `${sp.y * 100}%` },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute left-1/2 top-1/2 h-1 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full animate-fade-out",
                style: {
                  transform: `translate(-50%,-50%) rotate(${sp.angle}deg)`,
                  background: "linear-gradient(90deg, transparent, oklch(0.99 0 0), transparent)",
                  boxShadow: "0 0 12px oklch(0.93 0.17 95)"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "absolute block text-4xl sm:text-5xl animate-slice-left",
                style: { transform: "scaleX(-1)", clipPath: "inset(0 50% 0 0)" },
                children: sp.emoji
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "absolute block text-4xl sm:text-5xl animate-slice-right",
                style: { transform: "scaleX(-1)", clipPath: "inset(0 0 0 50%)" },
                children: sp.emoji
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "display absolute left-1/2 top-1/2 -translate-x-1/2 animate-float-up text-3xl sm:text-4xl",
                style: { transform: "scaleX(-1)", color: "oklch(0.93 0.17 95)", textShadow: "2px 2px 0 #1a1a2e" },
                children: "+1"
              }
            )
          ]
        },
        sp.id
      ))
    ] }),
    ready && /* @__PURE__ */ jsxs("div", { className: "absolute left-2 top-2 flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "relative inline-flex h-2 w-2 rounded-full",
          style: { background: "oklch(0.93 0.17 95)", boxShadow: "0 0 6px oklch(0.93 0.17 95)" }
        }
      ),
      status === "ready" ? "AI BLADES" : T.scanning[lang]
    ] }),
    ready && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 bottom-2 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: T.slice_intro[lang] }),
    ready && status === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-2 top-9 rounded-full border-2 border-foreground bg-background/90 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider", children: "Loading AI model…" })
  ] });
}
function getPose(key, time) {
  const t = time;
  const s = Math.sin(t);
  let head = { x: 50, y: 20 };
  let sL = { x: 40, y: 34 };
  let sR = { x: 60, y: 34 };
  let hL = { x: 32, y: 52 };
  let hR = { x: 68, y: 52 };
  let hip = { x: 50, y: 58 };
  let kL = { x: 46, y: 74 };
  let kR = { x: 54, y: 74 };
  let fL = { x: 45, y: 90 };
  let fR = { x: 55, y: 90 };
  switch (key) {
    case "jacks": {
      const up = (s + 1) / 2;
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
      const phase = Math.floor((t % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2) * 4);
      if (phase === 0) ;
      else if (phase === 1) {
        const drop = 14;
        head = { x: 50, y: 20 + drop };
        sL = { x: 40, y: 34 + drop };
        sR = { x: 60, y: 34 + drop };
        hip = { x: 50, y: 58 + drop };
        hL = { x: 40, y: 66 };
        hR = { x: 60, y: 66 };
        kL = { x: 42, y: 74 };
        kR = { x: 58, y: 74 };
      } else if (phase === 2) {
        const y = 68;
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
      } else {
        head = { x: 50, y: 12 };
        sL = { x: 40, y: 26 };
        sR = { x: 60, y: 26 };
        hip = { x: 50, y: 50 };
        hL = { x: 30, y: 10 };
        hR = { x: 70, y: 10 };
        kL = { x: 46, y: 68 };
        kR = { x: 54, y: 68 };
        fL = { x: 45, y: 84 };
        fR = { x: 55, y: 84 };
      }
      break;
    }
    case "lunge": {
      const left = s > 0;
      if (left) {
        fL = { x: 30, y: 90 };
        kL = { x: 36, y: 70 };
        fR = { x: 64, y: 90 };
        kR = { x: 60, y: 78 };
        hip = { x: 48, y: 64 };
      } else {
        fR = { x: 70, y: 90 };
        kR = { x: 64, y: 70 };
        fL = { x: 36, y: 90 };
        kL = { x: 40, y: 78 };
        hip = { x: 52, y: 64 };
      }
      head = { x: hip.x, y: 26 };
      sL = { x: hip.x - 10, y: 40 };
      sR = { x: hip.x + 10, y: 40 };
      hL = { x: hip.x - 12, y: 58 };
      hR = { x: hip.x + 12, y: 58 };
      break;
    }
    case "climbers": {
      const y = 64;
      head = { x: 16, y: y - 4 };
      sL = { x: 28, y };
      sR = { x: 30, y: y + 2 };
      hip = { x: 58, y: y + 2 };
      hL = { x: 26, y: 82 };
      hR = { x: 34, y: 82 };
      if (s > 0) {
        kL = { x: 48, y: 64 };
        fL = { x: 46, y: 74 };
        kR = { x: 74, y: y + 6 };
        fR = { x: 90, y: y + 8 };
      } else {
        kR = { x: 50, y: 64 };
        fR = { x: 48, y: 74 };
        kL = { x: 74, y: y + 6 };
        fL = { x: 90, y: y + 8 };
      }
      break;
    }
    case "toeTouch": {
      const left = s > 0;
      head = { x: 50, y: 44 };
      sL = { x: 42, y: 50 };
      sR = { x: 58, y: 50 };
      hip = { x: 50, y: 60 };
      if (left) {
        hL = { x: 30, y: 34 };
        hR = { x: 46, y: 86 };
      } else {
        hR = { x: 70, y: 34 };
        hL = { x: 54, y: 86 };
      }
      kL = { x: 46, y: 74 };
      kR = { x: 54, y: 74 };
      fL = { x: 44, y: 90 };
      fR = { x: 56, y: 90 };
      break;
    }
    case "grab": {
      const reachL = s > 0;
      head = { x: 50, y: 18 };
      sL = { x: 40, y: 34 };
      sR = { x: 60, y: 34 };
      hip = { x: 50, y: 58 };
      kL = { x: 46, y: 74 };
      kR = { x: 54, y: 74 };
      fL = { x: 45, y: 90 };
      fR = { x: 55, y: 90 };
      if (reachL) {
        hL = { x: 32, y: 12 };
        hR = { x: 64, y: 44 };
      } else {
        hR = { x: 68, y: 12 };
        hL = { x: 36, y: 44 };
      }
      break;
    }
    case "slice": {
      const c = Math.cos(t);
      head = { x: 50, y: 18 };
      sL = { x: 40, y: 34 };
      sR = { x: 60, y: 34 };
      hip = { x: 50, y: 58 };
      kL = { x: 46, y: 74 };
      kR = { x: 54, y: 74 };
      fL = { x: 45, y: 90 };
      fR = { x: 55, y: 90 };
      hL = { x: 34 + s * 14, y: 28 - c * 16 };
      hR = { x: 66 - s * 14, y: 28 + c * 16 };
      break;
    }
    case "lift": {
      const up = (s + 1) / 2;
      head = { x: 50, y: 20 };
      sL = { x: 40, y: 36 };
      sR = { x: 60, y: 36 };
      hip = { x: 50, y: 60 };
      kL = { x: 46, y: 76 };
      kR = { x: 54, y: 76 };
      fL = { x: 45, y: 92 };
      fR = { x: 55, y: 92 };
      hL = { x: 38, y: 36 - up * 26 };
      hR = { x: 62, y: 36 - up * 26 };
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
        kR = { x: 60, y: 74 };
        fR = { x: 62, y: 90 };
        kL = { x: 42, y: 72 };
        fL = { x: 28, y: 86 };
      } else {
        kL = { x: 40, y: 74 };
        fL = { x: 38, y: 90 };
        kR = { x: 58, y: 72 };
        fR = { x: 72, y: 86 };
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
      h: Math.min(100, maxY) - Math.max(0, minY)
    }
  };
}
const BONES = [
  ["head", "sL"],
  ["head", "sR"],
  ["sL", "sR"],
  ["sL", "hL"],
  ["sR", "hR"],
  ["sL", "hip"],
  ["sR", "hip"],
  ["hip", "kL"],
  ["hip", "kR"],
  ["kL", "fL"],
  ["kR", "fR"]
];
const CHALLENGES = [
  { key: "jacks", emoji: "🤸", labelKey: "ex_jacks", tip: "Jumping Jacks · 30s", speed: 0.22, badTipKey: "tip_jacks", goodTipKey: "praise_jumps" },
  { key: "squat", emoji: "🦵", labelKey: "ex_squat", tip: "Air Squats · 30s", speed: 0.16, badTipKey: "tip_squat", goodTipKey: "praise_form" },
  { key: "punch", emoji: "🥊", labelKey: "ex_punch", tip: "Boxing Combo · 30s", speed: 0.34, badTipKey: "tip_punch", goodTipKey: "praise_power" },
  { key: "highKnees", emoji: "🏃", labelKey: "ex_highKnees", tip: "High Knees · 30s", speed: 0.36, badTipKey: "tip_highKnees", goodTipKey: "praise_speed" },
  { key: "pushup", emoji: "💪", labelKey: "ex_pushup", tip: "Push-Ups · 30s", speed: 0.14, badTipKey: "tip_pushup", goodTipKey: "praise_form" },
  { key: "star", emoji: "⭐", labelKey: "ex_star", tip: "Star Jumps · 30s", speed: 0.2, badTipKey: "tip_star", goodTipKey: "praise_jumps" },
  { key: "plank", emoji: "🛡️", labelKey: "ex_plank", tip: "Plank Hold · 30s", speed: 0.06, badTipKey: "tip_plank", goodTipKey: "praise_hold" },
  { key: "burpee", emoji: "🔥", labelKey: "ex_burpee", tip: "Burpees · 30s", speed: 0.18, badTipKey: "tip_burpee", goodTipKey: "praise_power" },
  { key: "lunge", emoji: "🦶", labelKey: "ex_lunge", tip: "Side Lunges · 30s", speed: 0.18, badTipKey: "tip_lunge", goodTipKey: "praise_form" },
  { key: "climbers", emoji: "⛰️", labelKey: "ex_climbers", tip: "Mountain Climbers · 30s", speed: 0.4, badTipKey: "tip_climbers", goodTipKey: "praise_speed" },
  { key: "toeTouch", emoji: "🤾", labelKey: "ex_toeTouch", tip: "Cross Toe-Touch · 30s", speed: 0.22, badTipKey: "tip_toeTouch", goodTipKey: "praise_form" },
  { key: "skater", emoji: "⛸️", labelKey: "ex_skater", tip: "Skater Hops · 30s", speed: 0.26, badTipKey: "tip_skater", goodTipKey: "praise_jumps" },
  { key: "grab", emoji: "🍎", labelKey: "ex_grab", tip: "Catch & Dodge · 30s", speed: 0.3, badTipKey: "grab_bad", goodTipKey: "grab_good" },
  { key: "slice", emoji: "🗡️", labelKey: "ex_slice", tip: "Fruit Ninja · 30s", speed: 0.42, badTipKey: "slice_bad", goodTipKey: "slice_good" },
  { key: "lift", emoji: "🏋️", labelKey: "ex_lift", tip: "Overhead Press · 30s", speed: 0.2, badTipKey: "lift_bad", goodTipKey: "lift_good" },
  { key: "karate", emoji: "🥋", labelKey: "ex_karate", tip: "Karate Showdown · 45s", speed: 0.3, badTipKey: "karate_bad", goodTipKey: "karate_good" }
];
function RivalFeed({ active, lang, rivalName, rivalRegion, challengeKey, speed = 0.2 }) {
  const [tick, setTick] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      setTick((t2) => t2 + 1);
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
  const boneColor = "oklch(0.48 0.23 22)";
  const jointColor = "oklch(0.75 0.12 350)";
  const glowColor = "oklch(0.48 0.23 22)";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative aspect-[4/3] w-full overflow-hidden rounded-2xl",
      style: {
        border: "1.5px solid oklch(0.90 0.03 40)",
        boxShadow: "0 2px 12px oklch(0 0 0 / 0.06)",
        background: "linear-gradient(180deg, oklch(0.92 0.06 355) 0%, oklch(0.88 0.04 30) 52%, oklch(0.68 0.14 148) 52%, oklch(0.58 0.18 148) 100%)"
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute left-5 top-5 h-6 w-20 rounded-full bg-white/75", style: { filter: "blur(4px)" } }),
        /* @__PURE__ */ jsx("div", { className: "absolute right-10 top-7 h-4 w-14 rounded-full bg-white/55", style: { filter: "blur(3px)" } }),
        /* @__PURE__ */ jsx("div", { className: "absolute right-5 top-4 h-9 w-9 rounded-full", style: {
          background: "oklch(0.88 0.12 90)",
          boxShadow: "0 0 16px oklch(0.88 0.12 90 / 0.4)"
        } }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-[47%]", style: {
          backgroundImage: "radial-gradient(circle, oklch(0.75 0.14 148 / 0.4) 1px, transparent 1px)",
          backgroundSize: "14px 14px"
        } }),
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "absolute inset-0 h-full w-full", children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: bbox.x,
              y: bbox.y,
              width: bbox.w,
              height: bbox.h,
              fill: "none",
              stroke: glowColor,
              strokeWidth: "0.5",
              strokeDasharray: "2 2",
              rx: "2",
              opacity: "0.5",
              style: { filter: `drop-shadow(0 0 3px ${glowColor})` }
            }
          ),
          BONES.map(([a, b], i) => {
            const pa = joints[a];
            const pb = joints[b];
            return /* @__PURE__ */ jsx(
              "line",
              {
                x1: pa.x,
                y1: pa.y,
                x2: pb.x,
                y2: pb.y,
                stroke: boneColor,
                strokeWidth: "2.6",
                strokeLinecap: "round",
                opacity: "0.95",
                style: { filter: `drop-shadow(0 0 2px ${boneColor})` }
              },
              i
            );
          }),
          jointArr.map((j, i) => /* @__PURE__ */ jsx(
            "circle",
            {
              cx: j.x,
              cy: j.y,
              r: i === 0 ? 4.5 : 2,
              fill: i === 0 ? "oklch(0.98 0.01 30)" : jointColor,
              stroke: boneColor,
              strokeWidth: "0.8"
            },
            i
          ))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm", style: { border: "1px solid oklch(0.90 0.03 40)" }, children: [
          /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: { background: "oklch(0.48 0.23 22)", boxShadow: "0 0 6px oklch(0.48 0.23 22)" } }),
          T.scanning[lang]
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-full bg-white/85 px-3 py-1 text-xs font-semibold backdrop-blur-sm", style: { border: "1px solid oklch(0.90 0.03 40)" }, children: [
          /* @__PURE__ */ jsx("span", { children: rivalName }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: rivalRegion })
        ] })
      ]
    }
  );
}
function HUD({ lang, accuracy, streak, reps, score, rivalScore, timeLeft, label }) {
  return /* @__PURE__ */ jsxs("div", { className: "chunky space-y-2.5 bg-card p-3", children: [
    label && /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Stat, { value: score, label: T.xp[lang], icon: Zap, color: "bg-moss" }),
      /* @__PURE__ */ jsx(Stat, { value: `×${streak}`, label: T.streak[lang], icon: Flame, color: "bg-lime" }),
      /* @__PURE__ */ jsx(Stat, { value: reps, label: T.reps[lang], icon: Dumbbell, color: "bg-fern" }),
      typeof timeLeft === "number" && /* @__PURE__ */ jsx(Stat, { value: `${timeLeft}s`, label: T.timeLeft[lang], icon: Timer, color: "bg-aqua" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between text-[10px] font-semibold", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-muted-foreground uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx(Target, { size: 10, strokeWidth: 2.5 }),
          " ",
          T.accuracy[lang]
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
          Math.round(accuracy),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full transition-all duration-300",
          style: {
            width: `${accuracy}%`,
            background: accuracy > 75 ? "oklch(0.48 0.23 22)" : accuracy > 50 ? "oklch(0.80 0.12 350)" : "oklch(0.65 0.18 50)"
          }
        }
      ) })
    ] }),
    typeof rivalScore === "number" && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(User, { size: 11, strokeWidth: 2 }),
        " ",
        T.you[lang],
        ": ",
        score
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", style: { color: "oklch(0.50 0.16 22)" }, children: [
        /* @__PURE__ */ jsx(Bot, { size: 11, strokeWidth: 2 }),
        " ",
        T.rival[lang],
        ": ",
        rivalScore
      ] })
    ] })
  ] });
}
function Stat({
  value,
  label,
  icon: Icon,
  color
}) {
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 ${color}`, children: [
    /* @__PURE__ */ jsx(Icon, { size: 13, strokeWidth: 2.5, className: "opacity-60" }),
    /* @__PURE__ */ jsx("span", { className: "display text-lg leading-none", children: value }),
    /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground", children: label })
  ] });
}
function getDolphinMood(score) {
  if (score === 0) return "sleeping";
  if (score < 20) return "sad";
  if (score < 50) return "neutral";
  if (score < 80) return "happy";
  return "excited";
}
function DolphinMascot({ mood, accessory, size = 200, className = "" }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ms = mood === "excited" ? 50 : mood === "sleeping" ? 120 : 80;
    const id = setInterval(() => setPhase((p) => p + 1), ms);
    return () => clearInterval(id);
  }, [mood]);
  const bobY = mood === "sleeping" ? Math.sin(phase * 0.04) * 2 : mood === "excited" ? Math.sin(phase * 0.14) * 8 : Math.sin(phase * 0.08) * 4;
  const isExcited = mood === "excited";
  const isHappy = mood === "happy" || mood === "excited";
  const isSad = mood === "sad";
  const isSleeping = mood === "sleeping";
  const body = "#F4A8C0";
  const darkFin = "#D96090";
  const belly = "#FFE4EE";
  const eyeDark = "#3D1A2A";
  return /* @__PURE__ */ jsx("div", { className: `inline-block select-none ${className}`, style: { width: size, height: size }, children: /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 200 200",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { width: size, height: size, transform: `translateY(${bobY.toFixed(1)}px)` },
      children: [
        accessory === "bg_ocean" && /* @__PURE__ */ jsx("circle", { cx: "100", cy: "100", r: "96", fill: "#8ECFEE", fillOpacity: "0.32" }),
        accessory === "bg_hk" && /* @__PURE__ */ jsx("circle", { cx: "100", cy: "100", r: "96", fill: "#182038", fillOpacity: "0.35" }),
        accessory === "bg_sunset" && /* @__PURE__ */ jsx("circle", { cx: "100", cy: "100", r: "96", fill: "#FFB040", fillOpacity: "0.22" }),
        /* @__PURE__ */ jsx("path", { d: "M 50 98 Q 44 108 50 120", stroke: body, strokeWidth: "20", strokeLinecap: "round", fill: "none" }),
        /* @__PURE__ */ jsx("path", { d: "M 50 100 C 42 88 20 76 24 62 C 32 68 44 84 48 98 Z", fill: darkFin }),
        /* @__PURE__ */ jsx("path", { d: "M 50 118 C 42 130 20 142 24 156 C 32 150 44 134 48 120 Z", fill: darkFin }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M 52 108 C 48 82 70 54 110 54 C 142 54 166 74 168 98 C 170 120 158 142 130 148 C 100 154 62 142 52 122 Z",
            fill: body
          }
        ),
        /* @__PURE__ */ jsx("ellipse", { cx: "122", cy: "124", rx: "46", ry: "20", fill: belly, transform: "rotate(-6, 122, 124)" }),
        /* @__PURE__ */ jsx("path", { d: "M 164 96 C 180 95 196 104 196 110 C 196 116 180 122 164 120 Z", fill: body }),
        /* @__PURE__ */ jsx("path", { d: "M 100 58 C 112 36 134 50 132 66 C 120 68 106 64 100 58 Z", fill: darkFin }),
        /* @__PURE__ */ jsx("path", { d: "M 122 134 C 136 152 158 158 160 148 C 152 138 136 128 122 128 Z", fill: darkFin }),
        accessory === "special_rainbow" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "rainbowG", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#FF6B9D" }),
            /* @__PURE__ */ jsx("stop", { offset: "33%", stopColor: "#FFD166" }),
            /* @__PURE__ */ jsx("stop", { offset: "66%", stopColor: "#6BCB77" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#4D96FF" })
          ] }) }),
          /* @__PURE__ */ jsx(
            "ellipse",
            {
              cx: "108",
              cy: "108",
              rx: "72",
              ry: "52",
              stroke: "url(#rainbowG)",
              strokeWidth: "4",
              fill: "none",
              strokeOpacity: "0.65",
              transform: "rotate(-5, 108, 108)"
            }
          )
        ] }),
        accessory === "special_fire" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("text", { x: "55", y: "84", fontSize: "22", children: "🔥" }),
          /* @__PURE__ */ jsx("text", { x: "152", y: "170", fontSize: "18", children: "🔥" })
        ] }),
        accessory === "special_sparkles" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("text", { x: "50", y: "62", fontSize: "18", children: "✨" }),
          /* @__PURE__ */ jsx("text", { x: "166", y: "58", fontSize: "14", children: "✨" }),
          /* @__PURE__ */ jsx("text", { x: "158", y: "174", fontSize: "16", children: "✨" })
        ] }),
        /* @__PURE__ */ jsx("circle", { cx: "160", cy: "100", r: "11", fill: "white" }),
        isSleeping ? /* @__PURE__ */ jsx("path", { d: "M 152 100 Q 160 107 168 100", stroke: eyeDark, strokeWidth: "3", fill: "none", strokeLinecap: "round" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("circle", { cx: "162", cy: "100", r: isExcited ? 8 : 7, fill: eyeDark }),
          /* @__PURE__ */ jsx("circle", { cx: "165", cy: "97", r: "2.2", fill: "white" })
        ] }),
        isSad && /* @__PURE__ */ jsx("path", { d: "M 152 92 Q 160 90 168 94", stroke: darkFin, strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }),
        isExcited && /* @__PURE__ */ jsx("path", { d: "M 153 91 Q 160 94 167 91", stroke: darkFin, strokeWidth: "2", fill: "none", strokeLinecap: "round" }),
        isHappy && /* @__PURE__ */ jsx("ellipse", { cx: "149", cy: "111", rx: "11", ry: "5", fill: "#F06080", fillOpacity: "0.28" }),
        isSad && /* @__PURE__ */ jsx("path", { d: "M 163 112 Q 165 122 163 125 Q 160 122 161 112 Z", fill: "#A8D0FF", fillOpacity: "0.85" }),
        isSleeping && /* @__PURE__ */ jsx("path", { d: "M 176 118 L 188 118", stroke: "#C04060", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }),
        isSad && /* @__PURE__ */ jsx("path", { d: "M 174 122 Q 181 116 188 122", stroke: "#C04060", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }),
        mood === "neutral" && /* @__PURE__ */ jsx("path", { d: "M 176 118 Q 181 121 188 118", stroke: "#C04060", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }),
        mood === "happy" && /* @__PURE__ */ jsx("path", { d: "M 174 115 Q 181 124 188 115", stroke: "#C04060", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }),
        isExcited && /* @__PURE__ */ jsx("path", { d: "M 172 113 Q 181 126 190 113", stroke: "#C04060", strokeWidth: "3", fill: "none", strokeLinecap: "round" }),
        isSleeping && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("text", { x: "150", y: "82", fontSize: "12", fill: "#9090B0", fillOpacity: "0.7", fontFamily: "sans-serif", fontWeight: "bold", children: "z" }),
          /* @__PURE__ */ jsx("text", { x: "158", y: "70", fontSize: "16", fill: "#9090B0", fillOpacity: "0.85", fontFamily: "sans-serif", fontWeight: "bold", children: "z" }),
          /* @__PURE__ */ jsx("text", { x: "168", y: "55", fontSize: "20", fill: "#9090B0", fontFamily: "sans-serif", fontWeight: "bold", children: "Z" })
        ] }),
        isExcited && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("text", { x: "86", y: "48", fontSize: "18", textAnchor: "middle", children: "✨" }),
          /* @__PURE__ */ jsx("text", { x: "170", y: "74", fontSize: "14", textAnchor: "middle", children: "⭐" })
        ] }),
        accessory === "hat_top" && /* @__PURE__ */ jsx("text", { x: "118", y: "44", fontSize: "42", textAnchor: "middle", children: "🎩" }),
        accessory === "hat_flower" && /* @__PURE__ */ jsx("text", { x: "112", y: "44", fontSize: "36", textAnchor: "middle", children: "🌸" }),
        accessory === "hat_crown" && /* @__PURE__ */ jsx("text", { x: "116", y: "42", fontSize: "36", textAnchor: "middle", children: "👑" }),
        accessory === "hat_santa" && /* @__PURE__ */ jsx("text", { x: "112", y: "46", fontSize: "36", textAnchor: "middle", children: "🎅" }),
        accessory === "hat_grad" && /* @__PURE__ */ jsx("text", { x: "114", y: "44", fontSize: "36", textAnchor: "middle", children: "🎓" }),
        accessory === "hat_ferry" && /* @__PURE__ */ jsx("text", { x: "114", y: "44", fontSize: "34", textAnchor: "middle", children: "⚓" }),
        accessory === "glasses_sun" && /* @__PURE__ */ jsx("text", { x: "168", y: "110", fontSize: "22", textAnchor: "middle", children: "😎" }),
        accessory === "glasses_heart" && /* @__PURE__ */ jsx("text", { x: "168", y: "110", fontSize: "22", textAnchor: "middle", children: "🥰" }),
        accessory === "acc_bow" && /* @__PURE__ */ jsx("text", { x: "150", y: "156", fontSize: "26", textAnchor: "middle", children: "🎀" }),
        accessory === "acc_scarf" && /* @__PURE__ */ jsx("text", { x: "148", y: "156", fontSize: "24", textAnchor: "middle", children: "🧣" }),
        accessory === "acc_lei" && /* @__PURE__ */ jsx("text", { x: "142", y: "158", fontSize: "26", textAnchor: "middle", children: "💐" }),
        accessory === "acc_lantern" && /* @__PURE__ */ jsx("text", { x: "148", y: "160", fontSize: "24", textAnchor: "middle", children: "🏮" }),
        accessory === "acc_hongbao" && /* @__PURE__ */ jsx("text", { x: "148", y: "156", fontSize: "24", textAnchor: "middle", children: "🧧" }),
        accessory === "acc_dragon" && /* @__PURE__ */ jsx("text", { x: "148", y: "160", fontSize: "26", textAnchor: "middle", children: "🐉" })
      ]
    }
  ) });
}
const BOARD = [
  { rank: 1, name: "Wing Lam", score: 9840, streak: 42, avatar: "🏆" },
  { rank: 2, name: "Ka Man", score: 8920, streak: 35, avatar: "🥈" },
  { rank: 3, name: "Tsz Ying", score: 8340, streak: 28, avatar: "🥉" },
  { rank: 4, name: "Siu Ming", score: 7880, streak: 21, avatar: "🦅" },
  { rank: 5, name: "Wai Kei", score: 7450, streak: 19, avatar: "🐯" },
  { rank: 6, name: "Mei Yee", score: 7120, streak: 17, avatar: "🌸" },
  { rank: 7, name: "Ho Fung", score: 6890, streak: 15, avatar: "🦁" },
  { rank: 8, name: "Ka Ling", score: 6540, streak: 14, avatar: "🐉" },
  { rank: 9, name: "Chun Ho", score: 6210, streak: 12, avatar: "⚡" },
  { rank: 10, name: "Nga Ting", score: 5980, streak: 11, avatar: "🌺" },
  { rank: 11, name: "Lok Yi", score: 5720, streak: 10, avatar: "🔥" },
  { rank: 12, name: "Pak Hei", score: 5480, streak: 9, avatar: "💫" },
  { rank: 13, name: "Ching Man", score: 5240, streak: 8, avatar: "🌊" },
  { rank: 14, name: "Sum Yi", score: 5010, streak: 8, avatar: "🦋" },
  { rank: 15, name: "Hiu Tung", score: 4780, streak: 7, avatar: "⭐" },
  { rank: 16, name: "Yat Long", score: 4560, streak: 7, avatar: "🎯" },
  { rank: 17, name: "Sze Man", score: 4340, streak: 6, avatar: "🎪" },
  { rank: 18, name: "Ka Wai", score: 4120, streak: 6, avatar: "🌙" },
  { rank: 19, name: "Pui Ling", score: 3910, streak: 5, avatar: "🍀" },
  { rank: 20, name: "Bik Ha", score: 3700, streak: 5, avatar: "🦊" },
  { rank: 21, name: "Chi Wai", score: 3490, streak: 4, avatar: "🎭" },
  { rank: 22, name: "Fong Yi", score: 3280, streak: 4, avatar: "🎨" },
  { rank: 23, name: "Man Kei", score: 3080, streak: 4, avatar: "🌼" },
  { rank: 24, name: "Ho Yee", score: 2880, streak: 3, avatar: "🦜" },
  { rank: 25, name: "Shun Hei", score: 2690, streak: 3, avatar: "🐧" },
  { rank: 26, name: "Yi Ting", score: 2500, streak: 3, avatar: "🌻" },
  { rank: 27, name: "Kin Fung", score: 2320, streak: 2, avatar: "🎸" },
  { rank: 28, name: "Hoi Yan", score: 2140, streak: 2, avatar: "🐠" },
  { rank: 29, name: "Tsun Ming", score: 1960, streak: 2, avatar: "🎮" },
  { rank: 30, name: "You", score: 1200, streak: 3, avatar: "🐬", isMe: true }
];
function LeaderboardScreen({ lang }) {
  const top3 = BOARD.slice(0, 3);
  const rest = BOARD.slice(3);
  return /* @__PURE__ */ jsxs("div", { className: "pb-6 animate-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "display text-2xl", children: lang === "en" ? "Top 30 Players" : "前30名玩家" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: lang === "en" ? "Move more to climb the ranks!" : "多動才能提高排名！" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: top3[1].avatar }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold text-center leading-tight mb-1 max-w-[72px]", children: top3[1].name }),
        /* @__PURE__ */ jsxs("div", { className: "w-20 h-16 rounded-t-2xl bg-secondary flex flex-col items-center justify-center shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🥈" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold", children: [
            (top3[1].score / 1e3).toFixed(1),
            "k"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(Crown, { size: 16, className: "text-primary mb-0.5" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: top3[0].avatar }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold text-center leading-tight mb-1 max-w-[72px]", children: top3[0].name }),
        /* @__PURE__ */ jsxs("div", { className: "w-20 h-24 rounded-t-2xl bg-primary flex flex-col items-center justify-center shadow-md", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🏆" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-primary-foreground", children: [
            (top3[0].score / 1e3).toFixed(1),
            "k"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: top3[2].avatar }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold text-center leading-tight mb-1 max-w-[72px]", children: top3[2].name }),
        /* @__PURE__ */ jsxs("div", { className: "w-20 h-12 rounded-t-2xl bg-accent flex flex-col items-center justify-center shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🥉" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold", children: [
            (top3[2].score / 1e3).toFixed(1),
            "k"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: rest.map((p) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${p.isMe ? "border-primary bg-primary/[0.07] shadow-md" : "border-border bg-card"}`,
        children: [
          /* @__PURE__ */ jsxs("span", { className: "w-7 text-center text-sm font-bold text-muted-foreground shrink-0", children: [
            "#",
            p.rank
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl shrink-0", children: p.avatar }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: `text-sm font-semibold truncate ${p.isMe ? "text-primary" : ""}`, children: [
              p.name,
              p.isMe ? ` (${lang === "en" ? "You" : "你"})` : ""
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Flame, { size: 10, className: "text-primary shrink-0" }),
              p.streak,
              lang === "en" ? "d streak" : "天連勝"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold", children: p.score.toLocaleString() }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: "pts" })
          ] })
        ]
      },
      p.rank
    )) })
  ] });
}
const ITEMS = [
  /* Hats */
  { id: "hat_top", name: "Top Hat", nameZh: "高帽", emoji: "🎩", price: 120, category: "hat", description: "Classic elegance", descriptionZh: "經典優雅" },
  { id: "hat_flower", name: "Flower Crown", nameZh: "花冠", emoji: "🌸", price: 80, category: "hat", description: "Spring vibes", descriptionZh: "春天氣息" },
  { id: "hat_crown", name: "Royal Crown", nameZh: "皇冠", emoji: "👑", price: 250, category: "hat", description: "Champions only", descriptionZh: "冠軍專屬" },
  { id: "hat_santa", name: "Santa Hat", nameZh: "聖誕帽", emoji: "🎅", price: 100, category: "hat", description: "Festive spirit", descriptionZh: "節日氣氛" },
  { id: "hat_grad", name: "Grad Cap", nameZh: "學士帽", emoji: "🎓", price: 150, category: "hat", description: "Scholar dolphin", descriptionZh: "學者海豚" },
  { id: "hat_ferry", name: "Ferry Captain", nameZh: "渡輪船長帽", emoji: "⚓", price: 130, category: "hat", description: "Star Ferry pride", descriptionZh: "天星小輪驕傲" },
  /* Glasses */
  { id: "glasses_sun", name: "Sunglasses", nameZh: "太陽眼鏡", emoji: "😎", price: 90, category: "glasses", description: "Way too cool", descriptionZh: "超級酷" },
  { id: "glasses_heart", name: "Heart Glasses", nameZh: "愛心眼鏡", emoji: "🥰", price: 85, category: "glasses", description: "Love everything", descriptionZh: "愛心滿滿" },
  /* Accessories */
  { id: "acc_bow", name: "Red Bow", nameZh: "紅蝴蝶結", emoji: "🎀", price: 60, category: "accessory", description: "Cute & sweet", descriptionZh: "可愛甜美" },
  { id: "acc_scarf", name: "Cozy Scarf", nameZh: "保暖圍巾", emoji: "🧣", price: 75, category: "accessory", description: "Winter ready", descriptionZh: "冬日準備" },
  { id: "acc_lei", name: "Flower Lei", nameZh: "花環", emoji: "💐", price: 110, category: "accessory", description: "Tropical vibes", descriptionZh: "熱帶風情" },
  { id: "acc_lantern", name: "HK Lantern", nameZh: "香港燈籠", emoji: "🏮", price: 95, category: "accessory", description: "Mid-Autumn spirit", descriptionZh: "中秋節氣氛" },
  { id: "acc_hongbao", name: "Red Envelope", nameZh: "紅包", emoji: "🧧", price: 70, category: "accessory", description: "Lunar New Year luck", descriptionZh: "好運連連" },
  { id: "acc_dragon", name: "Dragon Amulet", nameZh: "龍護符", emoji: "🐉", price: 200, category: "accessory", description: "Legendary power", descriptionZh: "傳奇力量" },
  /* Backgrounds */
  { id: "bg_ocean", name: "Deep Ocean", nameZh: "深海", emoji: "🌊", price: 130, category: "bg", description: "Natural habitat", descriptionZh: "自然棲息地" },
  { id: "bg_hk", name: "HK Skyline", nameZh: "香港夜景", emoji: "🏙️", price: 175, category: "bg", description: "Home sweet home", descriptionZh: "香港夜景" },
  { id: "bg_sunset", name: "Sunset Glow", nameZh: "日落晚霞", emoji: "🌅", price: 140, category: "bg", description: "Golden hour", descriptionZh: "黃金時刻" },
  /* Special */
  { id: "special_rainbow", name: "Rainbow Aura", nameZh: "彩虹光環", emoji: "🌈", price: 200, category: "special", description: "Glow in all colors", descriptionZh: "七彩光芒" },
  { id: "special_sparkles", name: "Sparkle Mode", nameZh: "閃光模式", emoji: "✨", price: 180, category: "special", description: "Always shining", descriptionZh: "永遠閃亮" },
  { id: "special_fire", name: "On Fire!", nameZh: "燃燒吧！", emoji: "🔥", price: 160, category: "special", description: "Unstoppable energy", descriptionZh: "無法阻擋的能量" }
];
const CATS = [
  { key: "all", label: "All", labelZh: "全部" },
  { key: "hat", label: "Hats", labelZh: "帽子" },
  { key: "glasses", label: "Glasses", labelZh: "眼鏡" },
  { key: "accessory", label: "Accessories", labelZh: "配件" },
  { key: "bg", label: "Backgrounds", labelZh: "背景" },
  { key: "special", label: "Special", labelZh: "特效" }
];
function ShopScreen({ lang, diamonds, ownedItems, equippedItem, onBuy, onEquip }) {
  const [cat, setCat] = useState("all");
  const [confirm, setConfirm] = useState(null);
  const filtered = cat === "all" ? ITEMS : ITEMS.filter((i) => i.category === cat);
  return /* @__PURE__ */ jsxs("div", { className: "pb-4 animate-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "display text-2xl", children: lang === "en" ? "Dolphin Shop" : "海豚商店" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: lang === "en" ? "Dress up your pink dolphin mascot!" : "幫你的粉紅海豚打扮！" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm", children: [
        /* @__PURE__ */ jsx(Gem, { size: 14, className: "text-primary", strokeWidth: 2.5 }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", children: diamonds })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto pb-2 mb-4", style: { scrollbarWidth: "none" }, children: CATS.map(({ key, label, labelZh }) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCat(key),
        className: `flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${cat === key ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground"}`,
        children: lang === "en" ? label : labelZh
      },
      key
    )) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2.5", children: filtered.map((item) => {
      const owned = ownedItems.includes(item.id);
      const equipped = equippedItem === item.id;
      const canBuy = diamonds >= item.price;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            if (owned) onEquip(equipped ? null : item.id);
            else if (canBuy) setConfirm(item);
          },
          className: `relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all active:scale-95 ${equipped ? "border-primary bg-primary/[0.08] shadow-md" : owned ? "border-border bg-card" : canBuy ? "border-border bg-card hover:bg-secondary/50" : "border-border bg-muted opacity-55 cursor-default"}`,
          children: [
            equipped && /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { size: 9, className: "text-primary-foreground", strokeWidth: 3 }) }),
            /* @__PURE__ */ jsx("span", { className: "text-3xl mb-1", children: item.emoji }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold leading-tight", children: lang === "en" ? item.name : item.nameZh }),
            /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground mt-0.5 leading-tight", children: lang === "en" ? item.description : item.descriptionZh }),
            /* @__PURE__ */ jsx("div", { className: "mt-1.5", children: equipped ? /* @__PURE__ */ jsx("span", { className: "text-[10px] text-primary font-bold", children: lang === "en" ? "Equipped" : "已裝備" }) : owned ? /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: lang === "en" ? "Tap to equip" : "點擊裝備" }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 justify-center", children: [
              /* @__PURE__ */ jsx(Gem, { size: 9, className: "text-primary", strokeWidth: 2.5 }),
              /* @__PURE__ */ jsx("span", { className: `text-[11px] font-bold ${canBuy ? "text-foreground" : "text-destructive"}`, children: item.price })
            ] }) })
          ]
        },
        item.id
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-5 p-4 rounded-2xl bg-secondary/60 border border-border", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-medium text-center", children: lang === "en" ? "✨ Coming soon: Dragon Boat paddle, Typhoon T8 sign, MTR Octopus card, seasonal outfits & more!" : "✨ 即將推出：龍舟槳、八號颱風信號、八達通卡、季節造型等！" }) }),
    confirm && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/55 flex items-end justify-center z-50 p-4",
        onClick: () => setConfirm(null),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "text-center mb-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-5xl", children: confirm.emoji }),
                /* @__PURE__ */ jsx("h3", { className: "display text-xl mt-2", children: lang === "en" ? confirm.name : confirm.nameZh }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: lang === "en" ? confirm.description : confirm.descriptionZh })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-5 p-3 rounded-2xl bg-secondary", children: [
                /* @__PURE__ */ jsx(Gem, { size: 18, className: "text-primary", strokeWidth: 2.5 }),
                /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: confirm.price }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: lang === "en" ? "diamonds" : "鑽石" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setConfirm(null),
                    className: "flex-1 py-3 rounded-2xl border border-border bg-muted font-semibold text-sm",
                    children: lang === "en" ? "Cancel" : "取消"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      onBuy(confirm);
                      setConfirm(null);
                    },
                    className: "flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow",
                    children: lang === "en" ? "Buy Now!" : "立即購買！"
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
}
const HK_GRAD = "linear-gradient(135deg, oklch(0.40 0.24 22) 0%, oklch(0.55 0.18 355) 100%)";
const RIVALS = [
  { name: "Kenji", region: "Hong Kong" },
  { name: "Mei Mei", region: "Shanghai" },
  { name: "Leo", region: "Toronto" },
  { name: "Aanya", region: "Mumbai" },
  { name: "Hiro", region: "Osaka" }
];
function ActivePalsApp() {
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("home");
  const [mainTab, setMainTab] = useState("dolphin");
  const [challenge, setChallenge] = useState(CHALLENGES[0]);
  const [rivalIdx, setRivalIdx] = useState(0);
  const [accuracy, setAccuracy] = useState(85);
  const [streak, setStreak] = useState(0);
  const [reps, setReps] = useState(0);
  const [score, setScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [grade, setGrade] = useState("idle");
  const [banner, setBanner] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [stats, setStats] = useState({ form: 0, rhythm: 0, speed: 0 });
  const [totalScore, setTotalScore] = useState(0);
  const [diamonds, setDiamonds] = useState(340);
  const dayStreak = 3;
  const myRank = 30;
  const [equippedAccessory, setEquippedAccessory] = useState(null);
  const [ownedAccessories, setOwnedAccessories] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime, setNotifTime] = useState("09:00");
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window) setNotifEnabled(Notification.permission === "granted");
    const saved = localStorage.getItem("zw_notify_time");
    if (saved) setNotifTime(saved);
  }, []);
  useEffect(() => {
    if (!notifEnabled) return;
    const id = setInterval(() => {
      const now = /* @__PURE__ */ new Date();
      const cur = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (cur !== notifTime) return;
      const today = now.toDateString();
      const last = localStorage.getItem("zw_last_notif");
      if (last === today) return;
      localStorage.setItem("zw_last_notif", today);
      new Notification("ZaoWay — Time to Move! 🐬", {
        body: "Your dolphin is waiting! Roll out of bed and start playing."
      });
    }, 3e4);
    return () => clearInterval(id);
  }, [notifEnabled, notifTime]);
  const currentRival = RIVALS[rivalIdx % RIVALS.length];
  function pickChallenge(c) {
    setChallenge(c);
    setScreen("matchmaking");
  }
  useEffect(() => {
    if (screen !== "matchmaking") return;
    const rot = window.setInterval(() => setRivalIdx((i) => i + 1), 700);
    const t = window.setTimeout(() => {
      window.clearInterval(rot);
      setScreen("countdown");
    }, 3200);
    return () => {
      window.clearInterval(rot);
      window.clearTimeout(t);
    };
  }, [screen]);
  useEffect(() => {
    if (screen !== "countdown") return;
    setCountdown(3);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          setAccuracy(85);
          setStreak(0);
          setReps(0);
          setScore(0);
          setRivalScore(0);
          setTimeLeft(30);
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
  useEffect(() => {
    if (screen !== "battle") return;
    const rivalId = window.setInterval(() => setRivalScore((rs) => rs + Math.floor(5 + Math.random() * 9)), 1200);
    const tId = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(tId);
          window.clearInterval(rivalId);
          return 0;
        }
        return t - 1;
      });
    }, 1e3);
    return () => {
      window.clearInterval(rivalId);
      window.clearInterval(tId);
    };
  }, [screen]);
  const handleScore = useCallback((evt) => {
    if (screen !== "battle") return;
    setAccuracy(evt.accuracy);
    setGrade(evt.feedback === "good" ? "excellent" : evt.feedback === "bad" ? "poor" : "idle");
    if (evt.repDelta > 0) {
      const q = evt.repQuality;
      const delta = Math.max(5, Math.round(6 + q / 10));
      setReps((r) => r + evt.repDelta);
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
  useRef(0);
  useEffect(() => {
    if (screen === "battle" && timeLeft === 0) {
      const form = Math.min(100, 60 + Math.round(score / 8));
      const rhythm = Math.min(100, 55 + Math.round(reps * 1.6));
      const speed = Math.min(100, 50 + Math.round(reps * 1.8));
      setStats({ form, rhythm, speed });
      setDiamonds((d) => d + Math.max(5, Math.floor(score / 10)));
      const t = window.setTimeout(() => setScreen("report"), 800);
      return () => window.clearTimeout(t);
    }
  }, [screen, timeLeft, score, reps]);
  function pushToast(t) {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { ...t, id }]);
    window.setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 1200);
  }
  const inBattle = screen !== "home";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen pb-24 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-3xl px-3 sm:px-6", children: [
      /* @__PURE__ */ jsx(TopBar, { lang, setLang, diamonds, onBell: () => setShowNotif(true) }),
      /* @__PURE__ */ jsx("div", { className: "mt-5", children: inBattle ? /* @__PURE__ */ jsxs(Fragment, { children: [
        screen === "matchmaking" && /* @__PURE__ */ jsx(MatchmakingScreen, { lang, rival: currentRival }),
        screen === "countdown" && /* @__PURE__ */ jsx(CountdownScreen, { lang, value: countdown }),
        screen === "battle" && /* @__PURE__ */ jsx(
          BattleScreen,
          {
            lang,
            accuracy,
            streak,
            reps,
            score,
            rivalScore,
            timeLeft,
            grade,
            banner,
            toasts,
            rival: currentRival,
            challenge,
            onScore: handleScore
          }
        ),
        screen === "report" && /* @__PURE__ */ jsx(
          ReportScreen,
          {
            lang,
            score,
            rivalScore,
            stats,
            onRematch: () => setScreen("countdown"),
            onHome: () => {
              setScreen("home");
              setMainTab("games");
            }
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        mainTab === "dolphin" && /* @__PURE__ */ jsx(
          DolphinHome,
          {
            lang,
            totalScore,
            dayStreak,
            diamonds,
            myRank,
            equippedAccessory,
            onPlay: () => setMainTab("games")
          }
        ),
        mainTab === "games" && /* @__PURE__ */ jsx(GamesScreen, { lang, challenges: CHALLENGES, onPick: pickChallenge }),
        mainTab === "leaderboard" && /* @__PURE__ */ jsx(LeaderboardScreen, { lang }),
        mainTab === "shop" && /* @__PURE__ */ jsx(
          ShopScreen,
          {
            lang,
            diamonds,
            ownedItems: ownedAccessories,
            equippedItem: equippedAccessory,
            onBuy: (item) => {
              setDiamonds((d) => d - item.price);
              setOwnedAccessories((prev) => [...prev, item.id]);
              setEquippedAccessory(item.id);
            },
            onEquip: (id) => setEquippedAccessory(id)
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(Footer, { lang })
    ] }),
    !inBattle && /* @__PURE__ */ jsx(BottomNav, { tab: mainTab, setTab: setMainTab, lang }),
    showNotif && /* @__PURE__ */ jsx(
      NotifModal,
      {
        lang,
        notifTime,
        notifEnabled,
        onSave: async (time, want) => {
          if (want && "Notification" in window) {
            const perm = await Notification.requestPermission();
            const granted = perm === "granted";
            setNotifEnabled(granted);
            if (granted) {
              localStorage.setItem("zw_notify_time", time);
              setNotifTime(time);
            }
          } else {
            setNotifEnabled(false);
          }
          setShowNotif(false);
        },
        onClose: () => setShowNotif(false)
      }
    )
  ] });
}
const MOOD_LABEL = {
  sleeping: { en: "Zzz… wake me up!", "zh-HK": "你還沒動過！", "zh-CN": "你还没动过！" },
  sad: { en: "Come on, let's move!", "zh-HK": "加油！動一動吧", "zh-CN": "加油！动一动吧" },
  neutral: { en: "Not bad, keep going!", "zh-HK": "還不錯，繼續！", "zh-CN": "还不错，继续！" },
  happy: { en: "Looking great today!", "zh-HK": "今日好棒！", "zh-CN": "今天很棒！" },
  excited: { en: "ON FIRE! Incredible! 🔥", "zh-HK": "超厲害！繼續燃燒！", "zh-CN": "超厉害！继续燃烧！" }
};
function DolphinHome({
  lang,
  totalScore,
  dayStreak,
  diamonds,
  myRank,
  equippedAccessory,
  onPlay
}) {
  const mood = getDolphinMood(totalScore);
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const greet = lang === "en" ? hour < 12 ? "Good morning 👋" : hour < 18 ? "Good afternoon 👋" : "Good evening 👋" : hour < 12 ? "早安 👋" : hour < 18 ? "下午好 👋" : "晚安 👋";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center pb-4 animate-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full text-center mb-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground font-medium", children: greet }),
      /* @__PURE__ */ jsx("h2", { className: "display text-2xl mt-0.5", children: lang === "en" ? "How's your body today?" : "今天身體感覺怎樣？" })
    ] }),
    /* @__PURE__ */ jsx(DolphinMascot, { mood, accessory: equippedAccessory, size: 220 }),
    /* @__PURE__ */ jsx("div", { className: `mt-2 mb-5 px-5 py-2 rounded-full text-sm font-bold ${mood === "excited" ? "bg-primary text-primary-foreground" : mood === "happy" ? "bg-accent text-accent-foreground" : mood === "sleeping" || mood === "sad" ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"}`, children: MOOD_LABEL[mood]?.[lang] ?? "" }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-3 mb-5 w-full", children: [
      { Icon: Flame, value: `${dayStreak}d`, label: lang === "en" ? "Streak" : "連勝" },
      { Icon: Gem, value: diamonds, label: lang === "en" ? "Diamonds" : "鑽石" },
      { Icon: Trophy, value: `#${myRank}`, label: lang === "en" ? "Rank" : "排名" }
    ].map(({ Icon, value, label }) => /* @__PURE__ */ jsxs("div", { className: "flex-1 chunky bg-card flex flex-col items-center py-3 gap-0.5", children: [
      /* @__PURE__ */ jsx(Icon, { size: 18, className: "text-primary", strokeWidth: 2 }),
      /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: value }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: label })
    ] }, label)) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full chunky bg-card p-4 mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: lang === "en" ? "Today's Activity" : "今日活動" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          Math.min(totalScore, 100),
          " / 100 pts"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-3 rounded-full bg-secondary overflow-hidden mb-3", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full transition-all duration-700",
          style: {
            width: `${Math.min(100, totalScore)}%`,
            background: totalScore >= 80 ? "oklch(0.48 0.23 22)" : totalScore >= 50 ? "oklch(0.87 0.10 350)" : "oklch(0.75 0.08 40)"
          }
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [1, 2, 3, 4, 5, 6, 7].map((d) => /* @__PURE__ */ jsx("div", { className: `flex-1 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${d <= dayStreak ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"}`, children: d <= dayStreak ? /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 }) : d }, d)) })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onPlay,
        className: "w-full py-4 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform",
        style: { background: HK_GRAD },
        children: [
          lang === "en" ? "Start Moving" : "開始活動",
          /* @__PURE__ */ jsx(ChevronRight, { size: 22, strokeWidth: 3 })
        ]
      }
    )
  ] });
}
function BottomNav({ tab, setTab, lang }) {
  const tabs = [
    { id: "dolphin", Icon: Home, label: lang === "en" ? "Home" : "主頁" },
    { id: "games", Icon: Gamepad2, label: lang === "en" ? "Games" : "遊戲" },
    { id: "leaderboard", Icon: Trophy, label: lang === "en" ? "Ranks" : "排名" },
    { id: "shop", Icon: ShoppingBag, label: lang === "en" ? "Shop" : "商店" }
  ];
  return /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 inset-x-0 bg-card border-t border-border flex z-40", children: tabs.map(({ id, Icon, label }) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => setTab(id),
      className: `flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === id ? "text-primary" : "text-muted-foreground"}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { size: 22, strokeWidth: tab === id ? 2.5 : 1.8 }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold", children: label })
      ]
    },
    id
  )) });
}
function NotifModal({ lang, notifTime, notifEnabled, onSave, onClose }) {
  const [time, setTime] = useState(notifTime);
  const [want, setWant] = useState(notifEnabled);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("h3", { className: "display text-xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Bell, { size: 20, className: "text-primary" }),
        lang === "en" ? "Daily Reminder" : "每日提醒"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-2xl bg-secondary", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: lang === "en" ? "Enable reminders" : "開啟提醒" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setWant(!want),
            className: `w-12 h-6 rounded-full transition-colors ${want ? "bg-primary" : "bg-muted"}`,
            children: /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${want ? "translate-x-6" : "translate-x-0"}` })
          }
        )
      ] }),
      want && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-2xl bg-secondary", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold block mb-1.5", children: lang === "en" ? "Reminder time" : "提醒時間" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "time",
            value: time,
            onChange: (e) => setTime(e.target.value),
            className: "w-full bg-card rounded-xl px-3 py-2 text-lg font-bold border border-border text-center"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: lang === "en" ? "Works when ZaoWay is open in your browser." : "在瀏覽器開啟時生效。" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onSave(time, want),
          className: "w-full py-3 rounded-2xl text-white font-bold shadow",
          style: { background: HK_GRAD },
          children: lang === "en" ? "Save" : "儲存"
        }
      )
    ] })
  ] }) });
}
function TopBar({ lang, setLang, diamonds, onBell }) {
  return /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex h-11 w-11 items-center justify-center rounded-2xl shadow-md overflow-hidden",
          style: { background: HK_GRAD },
          children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 40", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "h-9 w-9", children: [
            /* @__PURE__ */ jsx("path", { d: "M 5 30 L 5 33 Q 5 36 8 36 L 32 36 Q 36 36 36 33 L 36 30 Z", fill: "white", fillOpacity: "0.92" }),
            /* @__PURE__ */ jsx("path", { d: "M 7.5 30 L 8.5 17 Q 11 8 18 7 L 30 7 Q 36 7 36 14 L 36 30 Z", fill: "white", fillOpacity: "0.85" }),
            /* @__PURE__ */ jsx("path", { d: "M 7.5 30 Q 5.5 26 6 19 Q 6.5 13 9 11", stroke: "white", strokeWidth: "1.5", strokeOpacity: "0.42", strokeLinecap: "round", fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: "M 9 11 Q 7.5 8.5 10.5 7.5", stroke: "white", strokeWidth: "1.5", strokeOpacity: "0.32", strokeLinecap: "round", fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: "M 22 7.5 Q 31 9 35 17", stroke: "white", strokeWidth: "3", strokeOpacity: "0.22", strokeLinecap: "round", fill: "none" }),
            /* @__PURE__ */ jsx(
              "path",
              {
                d: "M 20 18.5 C 20 15.8 15.5 15.8 15.5 18.5 C 15.5 21.2 20 21.2 20 18.5 C 20 15.8 24.5 15.8 24.5 18.5 C 24.5 21.2 20 21.2 20 18.5",
                stroke: "oklch(0.42 0.24 22)",
                strokeWidth: "2.1",
                fill: "none",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            ),
            /* @__PURE__ */ jsx("circle", { cx: "15.5", cy: "18.5", r: "1.2", fill: "oklch(0.42 0.24 22)", fillOpacity: "0.68" }),
            /* @__PURE__ */ jsx("circle", { cx: "24.5", cy: "18.5", r: "1.2", fill: "oklch(0.42 0.24 22)", fillOpacity: "0.68" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "display text-xl leading-none", children: T.appName[lang] }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium uppercase tracking-widest text-muted-foreground", children: T.tagline[lang] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold shadow-sm", children: [
        /* @__PURE__ */ jsx(Gem, { size: 12, className: "text-primary", strokeWidth: 2.5 }),
        /* @__PURE__ */ jsx("span", { children: diamonds })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onBell,
          className: "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card shadow-sm text-muted-foreground hover:text-primary transition-colors",
          children: /* @__PURE__ */ jsx(Bell, { size: 16, strokeWidth: 2 })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-xl border border-border bg-card p-1 shadow-sm", children: LANGS.map((l) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setLang(l.code),
          className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${lang === l.code ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"}`,
          children: l.label
        },
        l.code
      )) })
    ] })
  ] });
}
const CARD_COLORS = ["bg-moss", "bg-fern", "bg-lime", "bg-aqua"];
const CHALLENGE_ICONS = {
  jacks: GiCartwheel,
  squat: FaDumbbell,
  punch: GiBoxingGlove,
  highKnees: FaRunning,
  pushup: GiMuscleUp,
  star: FaStar,
  plank: FaShieldAlt,
  burpee: FaFire,
  lunge: FaWalking,
  climbers: FaMountain,
  toeTouch: FaHandPaper,
  skater: FaSkating,
  karate: GiKatana,
  grab: GiFruitBowl,
  slice: GiSwordClash,
  lift: GiWeightLiftingUp
};
function ChallengeIcon({ challengeKey, size = 36, className = "text-primary" }) {
  const Icon = CHALLENGE_ICONS[challengeKey];
  if (!Icon) return null;
  return /* @__PURE__ */ jsx(Icon, { size, className });
}
function GamesScreen({ lang, challenges, onPick }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5 animate-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl p-6 shadow-lg sm:p-8", style: { background: HK_GRAD }, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "pointer-events-none absolute inset-0 opacity-[0.07]",
          style: { backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative text-white", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx(Gem, { size: 11, strokeWidth: 2.5 }),
            " ",
            T.diamonds[lang],
            " · ",
            T.level[lang],
            " 7"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx(Trophy, { size: 11, strokeWidth: 2.5 }),
            " 3-day streak"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "display mt-3 text-3xl leading-tight sm:text-4xl", children: [
          "Roll out of bed.",
          /* @__PURE__ */ jsx("br", {}),
          "Start playing."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-sm text-sm font-medium opacity-75", children: "Casual movement games for real life. No gym needed." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "display text-base", children: T.pickChallenge[lang] }),
        /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground", children: [
          challenges.length,
          " games"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", children: challenges.map((c, i) => /* @__PURE__ */ jsxs("button", { onClick: () => onPick(c), className: `bubble ${CARD_COLORS[i % CARD_COLORS.length]} p-4 text-left`, children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 items-center", children: /* @__PURE__ */ jsx(ChallengeIcon, { challengeKey: c.key, size: 34 }) }),
        /* @__PURE__ */ jsx("div", { className: "display mt-2 text-sm leading-tight", children: T[c.labelKey][lang] }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[10px] font-medium text-muted-foreground", children: c.tip }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-1 text-[10px] font-semibold text-primary", children: [
          /* @__PURE__ */ jsx(ChevronRight, { size: 11, strokeWidth: 3 }),
          " ",
          T.startChallenge[lang]
        ] })
      ] }, c.key)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "chunky bg-card p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsx(Flame, { size: 16, className: "text-primary" }),
        " ",
        T.dailyActivity[lang]
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4, 5, 6, 7].map((d) => /* @__PURE__ */ jsx("div", { className: `flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all ${d <= 3 ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"}`, children: d <= 3 ? /* @__PURE__ */ jsx(Check, { size: 14, strokeWidth: 3 }) : d }, d)) })
    ] })
  ] });
}
function MatchmakingScreen({ lang, rival }) {
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl p-8 text-center shadow-xl animate-pop", style: { background: HK_GRAD }, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none absolute inset-0 opacity-[0.06]",
        style: { backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm animate-wobble",
        style: { boxShadow: "0 0 0 8px oklch(1 0 0 / 0.06)" },
        children: /* @__PURE__ */ jsx(Globe, { size: 42, className: "text-white", strokeWidth: 1.5 })
      }
    ),
    /* @__PURE__ */ jsx("h2", { className: "display mt-6 text-2xl text-white", children: T.searching[lang] }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs font-medium text-white/60", children: T.matchmakingRegion[lang] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-6 flex max-w-xs items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(PlayerChip, { label: T.you[lang], icon: User }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsx(Swords, { size: 18, className: "text-white/50", strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "inline-block h-2 w-2 rounded-full bg-white/40",
            style: { animation: `pop 0.8s ${i * 0.15}s infinite alternate` }
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ jsx(PlayerChip, { label: rival.name, sub: rival.region, icon: HelpCircle })
    ] })
  ] });
}
function PlayerChip({ icon: Icon, label, sub }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm",
        style: { border: "1.5px solid oklch(1 0 0 / 0.2)" },
        children: /* @__PURE__ */ jsx(Icon, { size: 26, className: "text-white", strokeWidth: 1.5 })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-white", children: label }),
    sub && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-wider", children: sub })
  ] });
}
function CountdownScreen({ lang, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl", style: { background: HK_GRAD }, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none absolute inset-0 opacity-[0.06]",
        style: { backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative text-center text-white", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold uppercase tracking-widest opacity-60", children: T.ready[lang] }),
      /* @__PURE__ */ jsx("div", { className: "display animate-bounce-in text-[120px] leading-none", children: value > 0 ? value : T.go[lang] }, value)
    ] })
  ] });
}
function BattleScreen({
  lang,
  accuracy,
  streak,
  reps,
  score,
  rivalScore,
  timeLeft,
  grade: _grade,
  banner,
  toasts,
  rival,
  challenge,
  onScore
}) {
  const leadingYou = score >= rivalScore;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 animate-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "chunky flex items-center justify-between bg-card px-4 py-2.5", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsx(ChallengeIcon, { challengeKey: challenge.key, size: 15, className: "text-primary" }),
        T[challenge.labelKey][lang]
      ] }),
      /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${timeLeft <= 5 ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"}`, children: [
        /* @__PURE__ */ jsx(Timer, { size: 11, strokeWidth: 2.5 }),
        " ",
        timeLeft,
        "s"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          challenge.key === "slice" ? /* @__PURE__ */ jsx(
            SliceGame,
            {
              active: true,
              lang,
              onSlice: (d) => onScore({ repDelta: d, repQuality: 80, accuracy: 80, feedback: "good" })
            }
          ) : challenge.key === "grab" ? /* @__PURE__ */ jsx(
            GrabGame,
            {
              active: true,
              lang,
              onGrab: (d) => onScore({ repDelta: d > 0 ? 1 : 0, repQuality: d > 0 ? 85 : 0, accuracy: d > 0 ? 85 : 30, feedback: d > 0 ? "good" : "bad" })
            }
          ) : challenge.key === "lift" ? /* @__PURE__ */ jsx(
            LiftGame,
            {
              active: true,
              lang,
              onLift: (q) => onScore({ repDelta: 1, repQuality: q, accuracy: q, feedback: q > 60 ? "good" : "bad" })
            }
          ) : challenge.key === "karate" ? /* @__PURE__ */ jsx(
            KarateGame,
            {
              active: true,
              lang,
              onKarate: (evt) => {
                if (evt.kind === "hit" || evt.kind === "ko-win")
                  onScore({ repDelta: 1, repQuality: Math.min(100, evt.magnitude * 5), accuracy: 85, feedback: "good" });
                else if (evt.kind === "hurt")
                  onScore({ repDelta: 0, repQuality: 0, accuracy: 30, feedback: "bad" });
                else if (evt.kind === "blocked")
                  onScore({ repDelta: 0, repQuality: 0, accuracy: 75, feedback: "good" });
              }
            }
          ) : /* @__PURE__ */ jsx(CameraFeed, { active: true, lang, challengeKey: challenge.key, onScore }),
          toasts.map((t) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "display pointer-events-none absolute left-1/2 top-1/2 z-10 text-3xl font-black animate-float-up",
              style: { color: t.tone === "good" ? "oklch(0.48 0.23 22)" : "oklch(0.65 0.18 50)", textShadow: "0 2px 8px oklch(0 0 0 / 0.2)" },
              children: t.text
            },
            t.id
          )),
          banner && /* @__PURE__ */ jsx(
            "div",
            {
              className: `absolute bottom-2 left-2 right-2 rounded-full border border-white/30 px-3 py-1.5 text-center text-xs font-bold backdrop-blur-sm animate-pop ${banner.tone === "good" ? "bg-primary/90 text-white" : "bg-destructive text-destructive-foreground"}`,
              children: banner.text
            },
            banner.text + score
          ),
          leadingYou && /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx(Crown, { size: 10, strokeWidth: 2.5 }),
            " LEAD"
          ] })
        ] }),
        /* @__PURE__ */ jsx(HUD, { lang, accuracy, streak, reps, score, label: T.you[lang] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            RivalFeed,
            {
              active: true,
              lang,
              rivalName: rival.name,
              rivalRegion: rival.region,
              challengeKey: challenge.key,
              speed: challenge.speed
            }
          ),
          !leadingYou && /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx(Crown, { size: 10, strokeWidth: 2.5 }),
            " LEAD"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          HUD,
          {
            lang,
            accuracy: Math.min(100, 60 + rivalScore % 35),
            streak: Math.floor(rivalScore / 30),
            reps: Math.floor(rivalScore / 12),
            score: rivalScore,
            label: T.rival[lang],
            timeLeft
          }
        )
      ] })
    ] })
  ] });
}
function ReportScreen({ lang, score, rivalScore, stats, onRematch, onHome }) {
  const youWon = score > rivalScore;
  const draw = score === rivalScore;
  const rank = useMemo(() => {
    const avg = (stats.form + stats.rhythm + stats.speed) / 3;
    if (avg >= 85) return { letter: "S", label: "Mastery", bg: "bg-primary text-primary-foreground" };
    if (avg >= 70) return { letter: "A", label: "Great!", bg: "bg-fern" };
    if (avg >= 55) return { letter: "B", label: "Solid", bg: "bg-moss" };
    return { letter: "C", label: "Keep going!", bg: "bg-secondary" };
  }, [stats]);
  const resultBg = draw ? "linear-gradient(135deg, oklch(0.55 0.18 355) 0%, oklch(0.65 0.12 340) 100%)" : youWon ? HK_GRAD : "linear-gradient(135deg, oklch(0.42 0.14 30) 0%, oklch(0.55 0.10 40) 100%)";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-pop", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl p-6 text-white shadow-lg", style: { background: resultBg }, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "pointer-events-none absolute inset-0 opacity-[0.06]",
          style: { backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-widest opacity-60", children: T.verdict[lang] }),
          /* @__PURE__ */ jsx("div", { className: "display mt-1 text-4xl leading-none", children: draw ? T.draw[lang] : youWon ? T.win[lang] : T.lose[lang] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm font-medium opacity-75", children: [
            T.you[lang],
            " ",
            score,
            " · ",
            T.rival[lang],
            " ",
            rivalScore
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-5xl", children: draw ? "🤝" : youWon ? "🎉" : "😤" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "chunky bg-card p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: `flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ${rank.bg}`, children: [
        /* @__PURE__ */ jsx("div", { className: "display text-3xl leading-none", children: rank.letter }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[9px] font-bold uppercase tracking-wide opacity-80", children: rank.label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2.5", children: [
        /* @__PURE__ */ jsx(Bar, { label: T.formAccuracy[lang], value: stats.form, color: "oklch(0.48 0.23 22)" }),
        /* @__PURE__ */ jsx(Bar, { label: T.rhythm[lang], value: stats.rhythm, color: "oklch(0.80 0.12 350)" }),
        /* @__PURE__ */ jsx(Bar, { label: T.speed[lang], value: stats.speed, color: "oklch(0.65 0.14 350)" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("button", { onClick: onRematch, className: "bubble bg-secondary p-5 text-left", children: [
        /* @__PURE__ */ jsx(RotateCcw, { size: 28, className: "text-primary", strokeWidth: 2 }),
        /* @__PURE__ */ jsx("div", { className: "display mt-2 text-lg", children: T.rematch[lang] }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs font-medium text-muted-foreground", children: "Same rival, new round." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: onHome, className: "bubble bg-moss p-5 text-left", children: [
        /* @__PURE__ */ jsx(Home, { size: 28, className: "text-primary", strokeWidth: 2 }),
        /* @__PURE__ */ jsx("div", { className: "display mt-2 text-lg", children: T.home[lang] }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs font-medium text-muted-foreground", children: "Pick a new challenge." })
      ] })
    ] })
  ] });
}
function Bar({ label, value, color }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between text-xs font-semibold", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
        value,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all", style: { width: `${value}%`, background: color } }) })
  ] });
}
function Footer({ lang }) {
  return /* @__PURE__ */ jsxs("footer", { className: "mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground", children: [
    "ZaoWay · ",
    lang.toUpperCase(),
    " · Roll out of bed. Start playing."
  ] });
}
function Index() {
  return /* @__PURE__ */ jsx(ActivePalsApp, {});
}
export {
  Index as component
};
