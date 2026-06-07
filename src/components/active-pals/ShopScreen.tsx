import { useState } from "react";
import { Gem, Check } from "lucide-react";
import type { Lang } from "./i18n";

export interface ShopItem {
  id: string;
  name: string;
  nameZh: string;
  emoji: string;
  price: number;
  category: "hat" | "glasses" | "accessory" | "special";
  description: string;
  descriptionZh: string;
}

const ITEMS: ShopItem[] = [
  /* Hats */
  { id: "hat_top",    name: "Top Hat",       nameZh: "高帽",     emoji: "🎩", price: 120, category: "hat", description: "Classic elegance",    descriptionZh: "經典優雅" },
  { id: "hat_flower", name: "Flower Crown",  nameZh: "花冠",     emoji: "🌸", price: 80,  category: "hat", description: "Spring vibes",         descriptionZh: "春天氣息" },
  { id: "hat_crown",  name: "Royal Crown",   nameZh: "皇冠",     emoji: "👑", price: 250, category: "hat", description: "Champions only",       descriptionZh: "冠軍專屬" },
  { id: "hat_santa",  name: "Santa Hat",     nameZh: "聖誕帽",   emoji: "🎅", price: 100, category: "hat", description: "Festive spirit",       descriptionZh: "節日氣氛" },
  { id: "hat_grad",   name: "Grad Cap",      nameZh: "學士帽",   emoji: "🎓", price: 150, category: "hat", description: "Scholar dolphin",      descriptionZh: "學者海豚" },
  { id: "hat_ferry",  name: "Ferry Captain", nameZh: "渡輪船長帽", emoji: "⚓", price: 130, category: "hat", description: "Star Ferry pride",     descriptionZh: "天星小輪驕傲" },
  /* Glasses */
  { id: "glasses_sun",   name: "Sunglasses",    nameZh: "太陽眼鏡", emoji: "😎", price: 90,  category: "glasses", description: "Way too cool",    descriptionZh: "超級酷" },
  { id: "glasses_heart", name: "Heart Glasses", nameZh: "愛心眼鏡", emoji: "🥰", price: 85,  category: "glasses", description: "Love everything",  descriptionZh: "愛心滿滿" },
  /* Accessories */
  { id: "acc_bow",     name: "Red Bow",        nameZh: "紅蝴蝶結", emoji: "🎀", price: 60,  category: "accessory", description: "Cute & sweet",       descriptionZh: "可愛甜美" },
  { id: "acc_scarf",   name: "Cozy Scarf",     nameZh: "保暖圍巾", emoji: "🧣", price: 75,  category: "accessory", description: "Winter ready",       descriptionZh: "冬日準備" },
  { id: "acc_lei",     name: "Flower Lei",     nameZh: "花環",     emoji: "💐", price: 110, category: "accessory", description: "Tropical vibes",     descriptionZh: "熱帶風情" },
  { id: "acc_lantern", name: "HK Lantern",     nameZh: "香港燈籠", emoji: "🏮", price: 95,  category: "accessory", description: "Mid-Autumn spirit",  descriptionZh: "中秋節氣氛" },
  { id: "acc_hongbao", name: "Red Envelope",   nameZh: "紅包",     emoji: "🧧", price: 70,  category: "accessory", description: "Lunar New Year luck",descriptionZh: "好運連連" },
  { id: "acc_dragon",  name: "Dragon Amulet",  nameZh: "龍護符",   emoji: "🐉", price: 200, category: "accessory", description: "Legendary power",    descriptionZh: "傳奇力量" },
  /* Special */
  { id: "special_rainbow",  name: "Rainbow Aura",  nameZh: "彩虹光環", emoji: "🌈", price: 200, category: "special", description: "Glow in all colors",    descriptionZh: "七彩光芒" },
  { id: "special_sparkles", name: "Sparkle Mode",  nameZh: "閃光模式", emoji: "✨", price: 180, category: "special", description: "Always shining",         descriptionZh: "永遠閃亮" },
  { id: "special_fire",     name: "On Fire!",       nameZh: "燃燒吧！",  emoji: "🔥", price: 160, category: "special", description: "Unstoppable energy",     descriptionZh: "無法阻擋的能量" },
];

const CATS = [
  { key: "all",       label: "All",         labelZh: "全部" },
  { key: "hat",       label: "Hats",        labelZh: "帽子" },
  { key: "glasses",   label: "Glasses",     labelZh: "眼鏡" },
  { key: "accessory", label: "Accessories", labelZh: "配件" },
  { key: "special",   label: "Special",     labelZh: "特效" },
] as const;

interface ShopScreenProps {
  lang: Lang;
  diamonds: number;
  ownedItems: string[];
  equippedItem: string | null;
  onBuy: (item: ShopItem) => void;
  onEquip: (id: string | null) => void;
}

export function ShopScreen({ lang, diamonds, ownedItems, equippedItem, onBuy, onEquip }: ShopScreenProps) {
  const [cat, setCat] = useState<string>("all");
  const [confirm, setConfirm] = useState<ShopItem | null>(null);

  const filtered = cat === "all" ? ITEMS : ITEMS.filter((i) => i.category === cat);

  return (
    <div className="pb-4 animate-pop">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="display text-2xl">{lang === "en" ? "Dolphin Shop" : "海豚商店"}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "en" ? "Dress up your pink dolphin mascot!" : "幫你的粉紅海豚打扮！"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
          <Gem size={14} className="text-primary" strokeWidth={2.5}/>
          <span className="font-bold text-sm">{diamonds}</span>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {CATS.map(({ key, label, labelZh }) => (
          <button
            key={key}
            onClick={() => setCat(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              cat === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {lang === "en" ? label : labelZh}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {filtered.map((item) => {
          const owned    = ownedItems.includes(item.id);
          const equipped = equippedItem === item.id;
          const canBuy   = diamonds >= item.price;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (owned) onEquip(equipped ? null : item.id);
                else if (canBuy) setConfirm(item);
              }}
              className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all active:scale-95 ${
                equipped
                  ? "border-primary bg-primary/[0.08] shadow-md"
                  : owned
                  ? "border-border bg-card"
                  : canBuy
                  ? "border-border bg-card hover:bg-secondary/50"
                  : "border-border bg-muted opacity-55 cursor-default"
              }`}
            >
              {equipped && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check size={9} className="text-primary-foreground" strokeWidth={3}/>
                </div>
              )}
              <span className="text-3xl mb-1">{item.emoji}</span>
              <span className="text-[11px] font-semibold leading-tight">
                {lang === "en" ? item.name : item.nameZh}
              </span>
              <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                {lang === "en" ? item.description : item.descriptionZh}
              </span>
              <div className="mt-1.5">
                {equipped ? (
                  <span className="text-[10px] text-primary font-bold">
                    {lang === "en" ? "Equipped" : "已裝備"}
                  </span>
                ) : owned ? (
                  <span className="text-[10px] text-muted-foreground">
                    {lang === "en" ? "Tap to equip" : "點擊裝備"}
                  </span>
                ) : (
                  <div className="flex items-center gap-0.5 justify-center">
                    <Gem size={9} className="text-primary" strokeWidth={2.5}/>
                    <span className={`text-[11px] font-bold ${canBuy ? "text-foreground" : "text-destructive"}`}>
                      {item.price}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Shop ideas hint */}
      <div className="mt-5 p-4 rounded-2xl bg-secondary/60 border border-border">
        <p className="text-xs text-muted-foreground font-medium text-center">
          {lang === "en"
            ? "✨ Coming soon: Dragon Boat paddle, Typhoon T8 sign, MTR Octopus card, seasonal outfits & more!"
            : "✨ 即將推出：龍舟槳、八號颱風信號、八達通卡、季節造型等！"}
        </p>
      </div>

      {/* Buy confirmation */}
      {confirm && (
        <div
          className="fixed inset-0 bg-black/55 flex items-end justify-center z-50 p-4"
          onClick={() => setConfirm(null)}
        >
          <div
            className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <span className="text-5xl">{confirm.emoji}</span>
              <h3 className="display text-xl mt-2">{lang === "en" ? confirm.name : confirm.nameZh}</h3>
              <p className="text-sm text-muted-foreground">{lang === "en" ? confirm.description : confirm.descriptionZh}</p>
            </div>
            <div className="flex items-center justify-center gap-2 mb-5 p-3 rounded-2xl bg-secondary">
              <Gem size={18} className="text-primary" strokeWidth={2.5}/>
              <span className="text-xl font-bold">{confirm.price}</span>
              <span className="text-sm text-muted-foreground">{lang === "en" ? "diamonds" : "鑽石"}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-3 rounded-2xl border border-border bg-muted font-semibold text-sm"
              >
                {lang === "en" ? "Cancel" : "取消"}
              </button>
              <button
                onClick={() => { onBuy(confirm); setConfirm(null); }}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow"
              >
                {lang === "en" ? "Buy Now!" : "立即購買！"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
