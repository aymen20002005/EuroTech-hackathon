import { useEffect, useState } from "react";

export type DolphinMood = "sleeping" | "sad" | "neutral" | "happy" | "excited";

export function getDolphinMood(score: number): DolphinMood {
  if (score === 0) return "sleeping";
  if (score < 20) return "sad";
  if (score < 50) return "neutral";
  if (score < 80) return "happy";
  return "excited";
}

interface DolphinMascotProps {
  mood: DolphinMood;
  accessory?: string | null;
  size?: number;
  className?: string;
}

const HAT_EMOJI: Record<string, string> = {
  hat_top: "🎩", hat_flower: "🌸", hat_crown: "👑",
  hat_santa: "🎅", hat_grad: "🎓", hat_ferry: "⚓",
};
const GLASSES_EMOJI: Record<string, string> = {
  glasses_sun: "😎", glasses_heart: "🥰",
};
const BODY_EMOJI: Record<string, string> = {
  acc_bow: "🎀", acc_scarf: "🧣", acc_lei: "💐",
  acc_lantern: "🏮", acc_hongbao: "🧧", acc_dragon: "🐉",
};

export function DolphinMascot({ mood, accessory, size = 200, className = "" }: DolphinMascotProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const ms = mood === "excited" ? 50 : mood === "sleeping" ? 120 : 80;
    const id = setInterval(() => setPhase((p) => p + 1), ms);
    return () => clearInterval(id);
  }, [mood]);

  const bobY =
    mood === "sleeping" ? Math.sin(phase * 0.04) * 2
    : mood === "excited" ? Math.sin(phase * 0.14) * 8
    : Math.sin(phase * 0.08) * 4;

  const isExcited  = mood === "excited";
  const isHappy    = mood === "happy" || mood === "excited";
  const isSad      = mood === "sad";
  const isSleeping = mood === "sleeping";

  const body    = "#F4A8C0";
  const darkFin = "#D96090";
  const belly   = "#FFE4EE";
  const eyeDark = "#3D1A2A";

  const hatEmoji     = accessory ? HAT_EMOJI[accessory] ?? null : null;
  const glassesEmoji = accessory ? GLASSES_EMOJI[accessory] ?? null : null;
  const bodyEmoji    = accessory ? BODY_EMOJI[accessory] ?? null : null;

  // SVG font-size / 200 * size = HTML px equivalent
  const hatPx     = Math.round(size * 0.22);
  const glassesPx = Math.round(size * 0.13);
  const bodyPx    = Math.round(size * 0.17);

  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size }}>
      {/* Single transform container — both SVG and overlays bob together */}
      <div style={{ width: size, height: size, transform: `translateY(${bobY.toFixed(1)}px)`, position: "relative" }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: size, height: size }}
        >
          {/* ── TAIL (drawn behind body) ── */}
          <path d="M 50 98 Q 44 108 50 120" stroke={body} strokeWidth="20" strokeLinecap="round" fill="none"/>
          <path d="M 50 100 C 42 88 20 76 24 62 C 32 68 44 84 48 98 Z" fill={darkFin}/>
          <path d="M 50 118 C 42 130 20 142 24 156 C 32 150 44 134 48 120 Z" fill={darkFin}/>

          {/* ── MAIN BODY ── */}
          <path
            d="M 52 108 C 48 82 70 54 110 54 C 142 54 166 74 168 98 C 170 120 158 142 130 148 C 100 154 62 142 52 122 Z"
            fill={body}
          />

          {/* ── BELLY (lighter) ── */}
          <ellipse cx="122" cy="124" rx="46" ry="20" fill={belly} transform="rotate(-6, 122, 124)"/>

          {/* ── SNOUT ── */}
          <path d="M 164 96 C 180 95 196 104 196 110 C 196 116 180 122 164 120 Z" fill={body}/>

          {/* ── DORSAL FIN ── */}
          <path d="M 100 58 C 112 36 134 50 132 66 C 120 68 106 64 100 58 Z" fill={darkFin}/>

          {/* ── PECTORAL FIN ── */}
          <path d="M 122 134 C 136 152 158 158 160 148 C 152 138 136 128 122 128 Z" fill={darkFin}/>

          {/* ── SPECIAL RAINBOW — kept in SVG because it uses a gradient ── */}
          {accessory === "special_rainbow" && (
            <>
              <defs>
                <linearGradient id="rainbowG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#FF6B9D"/>
                  <stop offset="33%"  stopColor="#FFD166"/>
                  <stop offset="66%"  stopColor="#6BCB77"/>
                  <stop offset="100%" stopColor="#4D96FF"/>
                </linearGradient>
              </defs>
              <ellipse cx="108" cy="108" rx="72" ry="52" stroke="url(#rainbowG)" strokeWidth="4"
                fill="none" strokeOpacity="0.65" transform="rotate(-5, 108, 108)"/>
            </>
          )}

          {/* ── EYE ── */}
          <circle cx="160" cy="100" r="11" fill="white"/>
          {isSleeping ? (
            <path d="M 152 100 Q 160 107 168 100" stroke={eyeDark} strokeWidth="3" fill="none" strokeLinecap="round"/>
          ) : (
            <>
              <circle cx="162" cy="100" r={isExcited ? 8 : 7} fill={eyeDark}/>
              <circle cx="165" cy="97"  r="2.2" fill="white"/>
            </>
          )}

          {/* ── EYEBROW expressions ── */}
          {isSad && (
            <path d="M 152 92 Q 160 90 168 94" stroke={darkFin} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          )}
          {isExcited && (
            <path d="M 153 91 Q 160 94 167 91" stroke={darkFin} strokeWidth="2" fill="none" strokeLinecap="round"/>
          )}

          {/* ── BLUSH ── */}
          {isHappy && (
            <ellipse cx="149" cy="111" rx="11" ry="5" fill="#F06080" fillOpacity="0.28"/>
          )}

          {/* ── TEAR ── */}
          {isSad && (
            <path d="M 163 112 Q 165 122 163 125 Q 160 122 161 112 Z" fill="#A8D0FF" fillOpacity="0.85"/>
          )}

          {/* ── MOUTH ── */}
          {isSleeping && (
            <path d="M 176 118 L 188 118" stroke="#C04060" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          )}
          {isSad && (
            <path d="M 174 122 Q 181 116 188 122" stroke="#C04060" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          )}
          {mood === "neutral" && (
            <path d="M 176 118 Q 181 121 188 118" stroke="#C04060" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          )}
          {mood === "happy" && (
            <path d="M 174 115 Q 181 124 188 115" stroke="#C04060" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          )}
          {isExcited && (
            <path d="M 172 113 Q 181 126 190 113" stroke="#C04060" strokeWidth="3" fill="none" strokeLinecap="round"/>
          )}

          {/* ── ZZZ — ASCII characters are fine in SVG ── */}
          {isSleeping && (
            <>
              <text x="150" y="82" fontSize="12" fill="#9090B0" fillOpacity="0.7"  fontFamily="sans-serif" fontWeight="bold">z</text>
              <text x="158" y="70" fontSize="16" fill="#9090B0" fillOpacity="0.85" fontFamily="sans-serif" fontWeight="bold">z</text>
              <text x="168" y="55" fontSize="20" fill="#9090B0"                    fontFamily="sans-serif" fontWeight="bold">Z</text>
            </>
          )}
        </svg>

        {/* ── HTML overlay — emoji render reliably as color glyphs here ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Mood: excited sparkles */}
          {isExcited && (
            <>
              <span style={{ position: "absolute", left: "43%", top: "14%", fontSize: size * 0.11, transform: "translate(-50%,-50%)", lineHeight: 1 }}>✨</span>
              <span style={{ position: "absolute", left: "84%", top: "31%", fontSize: size * 0.08, transform: "translate(-50%,-50%)", lineHeight: 1 }}>⭐</span>
            </>
          )}

          {/* Hat — sits above the dorsal fin */}
          {hatEmoji && (
            <span style={{ position: "absolute", left: "59%", top: "1%", fontSize: hatPx, transform: "translateX(-50%)", lineHeight: 1, display: "block" }}>
              {hatEmoji}
            </span>
          )}

          {/* Glasses — over the eye */}
          {glassesEmoji && (
            <span style={{ position: "absolute", left: "80%", top: "49%", fontSize: glassesPx, transform: "translate(-50%,-50%)", lineHeight: 1, display: "block" }}>
              {glassesEmoji}
            </span>
          )}

          {/* Body accessories — pectoral fin area */}
          {bodyEmoji && (
            <span style={{ position: "absolute", left: "73%", top: "71%", fontSize: bodyPx, transform: "translate(-50%,-50%)", lineHeight: 1, display: "block" }}>
              {bodyEmoji}
            </span>
          )}

          {/* Special: fire */}
          {accessory === "special_fire" && (
            <>
              <span style={{ position: "absolute", left: "27%", top: "31%", fontSize: size * 0.13, transform: "translate(-50%,-50%)", lineHeight: 1 }}>🔥</span>
              <span style={{ position: "absolute", left: "75%", top: "80%", fontSize: size * 0.10, transform: "translate(-50%,-50%)", lineHeight: 1 }}>🔥</span>
            </>
          )}

          {/* Special: sparkles */}
          {accessory === "special_sparkles" && (
            <>
              <span style={{ position: "absolute", left: "25%", top: "21%", fontSize: size * 0.10, transform: "translate(-50%,-50%)", lineHeight: 1 }}>✨</span>
              <span style={{ position: "absolute", left: "84%", top: "19%", fontSize: size * 0.08, transform: "translate(-50%,-50%)", lineHeight: 1 }}>✨</span>
              <span style={{ position: "absolute", left: "79%", top: "83%", fontSize: size * 0.09, transform: "translate(-50%,-50%)", lineHeight: 1 }}>✨</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
