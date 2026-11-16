import type {
  BallStyle, EquipType, GrassPattern, KitDesign, PitchId, StrokeTool, Tool, ZoneMode,
} from "./types";

/* Pitch data is authored in portrait metres: x across (0..W), y along (0..H).
   The home team defends the top (y≈0) and attacks downward. */

export type Slot = { role: string; x: number; y: number };

// y is given for a team defending the bottom goal (GK at y=100); the home team is mirrored.
export const FORMATIONS: Record<string, Slot[]> = {
  "4-4-2": [
    { role: "KL", x: 34, y: 100 },
    { role: "SLB", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SĞB", x: 60, y: 80 },
    { role: "SLK", x: 8, y: 50 }, { role: "MO", x: 26, y: 55 }, { role: "MO", x: 42, y: 55 }, { role: "SĞK", x: 60, y: 50 },
    { role: "FV", x: 26, y: 20 }, { role: "FV", x: 42, y: 20 },
  ],
  "4-3-3": [
    { role: "KL", x: 34, y: 100 },
    { role: "SLB", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SĞB", x: 60, y: 80 },
    { role: "MO", x: 20, y: 55 }, { role: "DOS", x: 34, y: 60 }, { role: "MO", x: 48, y: 55 },
    { role: "SLK", x: 10, y: 25 }, { role: "FV", x: 34, y: 18 }, { role: "SĞK", x: 58, y: 25 },
  ],
  "4-2-3-1": [
    { role: "KL", x: 34, y: 100 },
    { role: "SLB", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SĞB", x: 60, y: 80 },
    { role: "DOS", x: 24, y: 62 }, { role: "DOS", x: 44, y: 62 },
    { role: "SLK", x: 10, y: 38 }, { role: "OOS", x: 34, y: 32 }, { role: "SĞK", x: 58, y: 38 },
    { role: "FV", x: 34, y: 15 },
  ],
  "4-3-1-2": [
    { role: "KL", x: 34, y: 100 },
    { role: "SLB", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SĞB", x: 60, y: 80 },
    { role: "MO", x: 18, y: 55 }, { role: "MO", x: 34, y: 58 }, { role: "MO", x: 50, y: 55 },
    { role: "OOS", x: 34, y: 35 },
    { role: "FV", x: 24, y: 18 }, { role: "FV", x: 44, y: 18 },
  ],
  "4-3-2-1": [
    { role: "KL", x: 34, y: 100 },
    { role: "SLB", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SĞB", x: 60, y: 80 },
    { role: "MO", x: 18, y: 55 }, { role: "MO", x: 34, y: 58 }, { role: "MO", x: 50, y: 55 },
    { role: "OOS", x: 24, y: 32 }, { role: "OOS", x: 44, y: 32 },
    { role: "FV", x: 34, y: 15 },
  ],
  "3-4-1-2": [
    { role: "KL", x: 34, y: 100 },
    { role: "STP", x: 16, y: 82 }, { role: "STP", x: 34, y: 86 }, { role: "STP", x: 52, y: 82 },
    { role: "KB", x: 6, y: 55 }, { role: "MO", x: 26, y: 58 }, { role: "MO", x: 42, y: 58 }, { role: "KB", x: 62, y: 55 },
    { role: "OOS", x: 34, y: 35 },
    { role: "FV", x: 24, y: 18 }, { role: "FV", x: 44, y: 18 },
  ],
  "4-1-2-1-2": [
    { role: "KL", x: 34, y: 100 },
    { role: "SLB", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SĞB", x: 60, y: 80 },
    { role: "DOS", x: 34, y: 65 },
    { role: "MO", x: 18, y: 48 }, { role: "MO", x: 50, y: 48 },
    { role: "OOS", x: 34, y: 32 },
    { role: "FV", x: 24, y: 16 }, { role: "FV", x: 44, y: 16 },
  ],
  "3-5-2": [
    { role: "KL", x: 34, y: 100 },
    { role: "STP", x: 16, y: 82 }, { role: "STP", x: 34, y: 86 }, { role: "STP", x: 52, y: 82 },
    { role: "KB", x: 6, y: 50 }, { role: "MO", x: 22, y: 55 }, { role: "DOS", x: 34, y: 58 }, { role: "MO", x: 46, y: 55 }, { role: "KB", x: 62, y: 50 },
    { role: "FV", x: 24, y: 18 }, { role: "FV", x: 44, y: 18 },
  ],
  "5-3-2": [
    { role: "KL", x: 34, y: 100 },
    { role: "KB", x: 6, y: 78 }, { role: "STP", x: 20, y: 84 }, { role: "STP", x: 34, y: 87 }, { role: "STP", x: 48, y: 84 }, { role: "KB", x: 62, y: 78 },
    { role: "MO", x: 20, y: 55 }, { role: "DOS", x: 34, y: 58 }, { role: "MO", x: 48, y: 55 },
    { role: "FV", x: 24, y: 18 }, { role: "FV", x: 44, y: 18 },
  ],
};
export const FORMATION_KEYS = Object.keys(FORMATIONS);

export const ROLE_NAMES: Record<string, string> = {
  KL: "Kaleci", SLB: "Sol bek", SĞB: "Sağ bek", STP: "Stoper", KB: "Kanat bek", DOS: "Defansif orta saha",
  MO: "Merkez orta saha", OOS: "Ofansif orta saha", SLK: "Sol kanat", SĞK: "Sağ kanat", FV: "Forvet",
  // legacy role codes found in older saves
  GK: "Kaleci", SL: "Sol bek", SG: "Sağ bek", OS: "Orta saha", OSL: "Sol orta saha", OSG: "Sağ orta saha", SKA: "Sol kanat", SAA: "Sağ kanat", F: "Forvet",
};
export const isKeeper = (role: string) => role === "KL" || role === "GK";

export type PitchPreset = { id: PitchId; label: string; hint: string; W: number; H: number; band?: [number, number]; noLines?: boolean };
export const PITCH_PRESETS: PitchPreset[] = [
  { id: "full", label: "Tam saha", hint: "105 × 68 m", W: 68, H: 105 },
  { id: "attackHalf", label: "Hücum yarı sahası", hint: "Rakip yarı", W: 68, H: 105, band: [0, 52.5] },
  { id: "defenseHalf", label: "Savunma yarı sahası", hint: "Kendi yarın", W: 68, H: 105, band: [52.5, 105] },
  { id: "attackThird", label: "Hücum üçte biri", hint: "Son 35 m", W: 68, H: 105, band: [0, 47] },
  { id: "defenseThird", label: "Savunma üçte biri", hint: "İlk 35 m", W: 68, H: 105, band: [58, 105] },
  { id: "seven", label: "7'ye 7", hint: "80 × 50 m", W: 50, H: 80 },
  { id: "nine", label: "9'a 9", hint: "92 × 58 m", W: 58, H: 92 },
  { id: "blank", label: "Çizgisiz saha", hint: "Antrenman alanı", W: 68, H: 105, noLines: true },
];
export const presetOf = (id: PitchId) => PITCH_PRESETS.find((p) => p.id === id) || PITCH_PRESETS[0];

export const TEAM_COLORS = [
  "#3F86D6", "#F4F4F7", "#E5484D", "#F5C542", "#1F2430", "#8B5CF6",
  "#F59E0B", "#22A06B", "#0EA5E9", "#EC4899", "#F97316", "#94A3B8",
];
export const DRAW_COLORS = ["#FFFFFF", "#F5E94A", "#EF4444", "#38BDF8", "#111827", "#2563EB", "#22C55E", "#F97316"];
export const TEXT_SIZES = [2, 3, 4.2, 5.6];
export const GK_COLOR = "#8D8E96";

export const KIT_DESIGNS: { id: KitDesign; label: string }[] = [
  { id: "plain", label: "Düz" }, { id: "hoops", label: "Yatay çizgili" }, { id: "thinhoops", label: "İnce yatay" },
  { id: "stripes", label: "Dikey çizgili" }, { id: "thinstripes", label: "İnce dikey" }, { id: "halves", label: "Yarı yarıya" },
  { id: "halvesH", label: "Alt üst" }, { id: "quarters", label: "Çeyrek" }, { id: "sash", label: "Çapraz şerit" },
  { id: "band", label: "Orta şerit" }, { id: "cross", label: "Artı" }, { id: "chevron", label: "V yaka" },
  { id: "checks", label: "Damalı" }, { id: "diag", label: "Çapraz çizgili" },
  { id: "pinstripe", label: "İnce çizgi" }, { id: "plaid", label: "Ekose" }, { id: "wide", label: "Geniş şerit" },
];

export type GrassColor = { id: string; label: string; a: string; b: string; line: string };
export const GRASS_COLORS: GrassColor[] = [
  { id: "green", label: "Stadyum yeşili", a: "#6A9D5B", b: "#66975A", line: "#FFFFFF" },
  { id: "fresh", label: "Açık yeşil", a: "#6DBB5E", b: "#61AF55", line: "#FFFFFF" },
  { id: "deep", label: "Koyu yeşil", a: "#3F8A4A", b: "#377F43", line: "#FFFFFF" },
  { id: "olive", label: "Zeytin", a: "#7A9A3A", b: "#6F8F33", line: "#FFFFFF" },
  { id: "charcoal", label: "Antrasit", a: "#3A3F3C", b: "#313634", line: "#E9ECEA" },
  { id: "navy", label: "Lacivert", a: "#3B4A6B", b: "#33415F", line: "#FFFFFF" },
  { id: "blue", label: "Mavi", a: "#3F7FCB", b: "#3873BA", line: "#FFFFFF" },
  { id: "grey", label: "Gri", a: "#7C7C84", b: "#72727A", line: "#FFFFFF" },
  { id: "sand", label: "Kum", a: "#C7B07B", b: "#BCA56F", line: "#FFFFFF" },
  { id: "clay", label: "Toprak", a: "#C0623C", b: "#B35A36", line: "#FFFFFF" },
];
export const grassOf = (id: string) => GRASS_COLORS.find((g) => g.id === id) || GRASS_COLORS[0];

export const GRASS_PATTERNS: { id: GrassPattern; label: string }[] = [
  { id: "grid", label: "Kareli" }, { id: "bands", label: "Enine şerit" }, { id: "lanes", label: "Boyuna şerit" },
  { id: "checker", label: "Dama" }, { id: "diag", label: "Çapraz" }, { id: "rings", label: "Halka" }, { id: "plain", label: "Düz" },
];

export const ZONE_MODES: { id: ZoneMode; label: string }[] = [
  { id: "none", label: "Yok" },
  { id: "thirds", label: "Üçte birler" },
  { id: "halfspaces", label: "Half-space" },
  { id: "positional", label: "Pozisyonel oyun" },
  { id: "lanes", label: "5 kulvar" },
  { id: "lanesThirds", label: "Kulvar ve üçte bir" },
];
// lane boundaries of the positional-play grid (flank / half-space / centre / half-space / flank)
export const POS_VLINES = [0.195, 0.364, 0.626, 0.8];
export const POS_ROWS = 6;

export type ToolDef = { id: Tool; label: string; key?: string; hint: string };
export const TOOLS: Record<string, ToolDef> = {
  move: { id: "move", label: "Seç ve taşı", key: "V", hint: "" },
  link: { id: "link", label: "Bağla", key: "C", hint: "İki oyuncuya sırayla dokun, aralarına çizgi çekilir. Aynı ikiliye yine dokunursan çizgi kalkar." },
  line: { id: "line", label: "Çizgi", key: "L", hint: "Sürükleyerek çiz. Uçları birleşen çizgiler kapalı bir alan oluşturursa içi boyanır." },
  arrow: { id: "arrow", label: "Ok", key: "A", hint: "Sürükleyerek ok çiz." },
  darrow: { id: "darrow", label: "Kesik ok", key: "D", hint: "Sürükleyerek pas ya da top yolu için kesik ok çiz." },
  curve: { id: "curve", label: "Eğri ok", key: "B", hint: "Sürükleyerek eğri ok çiz. Var olan bir çizgiyi eğmek için ortasındaki noktadan tut." },
  pen: { id: "pen", label: "Kalem", key: "P", hint: "Serbestçe çiz." },
  rect: { id: "rect", label: "Kutu", key: "R", hint: "Sürükleyerek kutu çiz." },
  frect: { id: "frect", label: "Dolu kutu", key: "F", hint: "Sürükleyerek yarı saydam dolgulu bir alan çiz." },
  zone: { id: "zone", label: "Bölge", key: "Z", hint: "Bir alanı sürükleyerek seç; içindeki oyuncu sayısı (ör. 3v2) yazılır." },
  text: { id: "text", label: "Metin", key: "T", hint: "Metin eklemek istediğin yere dokun." },
  eraser: { id: "eraser", label: "Silgi", key: "E", hint: "Silmek istediğin çizime ya da nesneye dokun." },
  equip: { id: "equip", label: "Malzeme", hint: "Sahada bir yere dokunarak yerleştir." },
  ball: { id: "ball", label: "Top", hint: "Sahada bir yere dokunarak top ekle." },
};
export const LINE_TOOLS: StrokeTool[] = ["line", "arrow", "darrow"];
export const STROKE_LABELS: Record<StrokeTool, string> = {
  line: "Çizgi", arrow: "Ok", darrow: "Kesik ok", pen: "Kalem çizimi", rect: "Kutu", frect: "Dolu kutu", zone: "Bölge",
};

export type EquipDef = { id: EquipType; label: string; group: "goal" | "marker" | "agility" | "dummy"; rotatable?: boolean; base: number };
export const EQUIPMENT: EquipDef[] = [
  { id: "goal", label: "Kale 7,32 m", group: "goal", rotatable: true, base: 1 },
  { id: "goal5", label: "Kale 5 m", group: "goal", rotatable: true, base: 1 },
  { id: "mini", label: "Mini kale 3 m", group: "goal", rotatable: true, base: 1 },
  { id: "cone_white", label: "Beyaz şapka", group: "marker", base: 0.64 },
  { id: "cone_yellow", label: "Sarı şapka", group: "marker", base: 0.64 },
  { id: "cone_orange", label: "Turuncu şapka", group: "marker", base: 0.64 },
  { id: "cone_blue", label: "Mavi şapka", group: "marker", base: 0.64 },
  { id: "cone_red", label: "Kırmızı şapka", group: "marker", base: 0.64 },
  { id: "cone_tall", label: "Huni", group: "marker", base: 0.6 },
  { id: "flag", label: "Bayrak", group: "marker", base: 0.62 },
  { id: "pole", label: "Slalom direği", group: "agility", base: 0.62 },
  { id: "hurdle", label: "Engel", group: "agility", rotatable: true, base: 0.85 },
  { id: "ladder", label: "Koordinasyon merdiveni", group: "agility", rotatable: true, base: 0.95 },
  { id: "ring", label: "Halka", group: "agility", base: 0.72 },
  { id: "dummy_yellow", label: "Sarı manken", group: "dummy", base: 0.78 },
  { id: "dummy_blue", label: "Mavi manken", group: "dummy", base: 0.78 },
  { id: "dummy_red", label: "Kırmızı manken", group: "dummy", base: 0.78 },
  { id: "wall", label: "Baraj (4 manken)", group: "dummy", rotatable: true, base: 0.78 },
];
export const equipDef = (t: EquipType) => EQUIPMENT.find((e) => e.id === t) || EQUIPMENT[3];
export const EQUIP_GROUPS: { id: EquipDef["group"]; label: string }[] = [
  { id: "goal", label: "Kaleler" }, { id: "marker", label: "Şapkalar ve işaretler" },
  { id: "agility", label: "Koordinasyon" }, { id: "dummy", label: "Mankenler" },
];
export const CONE_COLORS: Partial<Record<EquipType, string>> = {
  cone_white: "#F4F4F4", cone_yellow: "#F6D60A", cone_orange: "#F28C28", cone_blue: "#3B82F6", cone_red: "#E5484D",
};
export const DUMMY_COLORS: Partial<Record<EquipType, string>> = { dummy_yellow: "#F6C90A", dummy_blue: "#2F74E0", dummy_red: "#E0454A" };
export const GOAL_SPECS: Partial<Record<EquipType, { w: number; d: number; h: number }>> = {
  goal: { w: 7.32, d: 2.4, h: 2.44 }, goal5: { w: 5, d: 1.8, h: 1.8 }, mini: { w: 3, d: 1.2, h: 1.1 },
};

export const BALL_STYLES: { id: BallStyle; label: string }[] = [
  { id: "classic", label: "Klasik" },
  { id: "ucl", label: "Mavi altın" },
  { id: "superlig", label: "Kırmızı siyah" },
  { id: "stars", label: "Yıldızlı" },
];

// sizes in metres on a 68 m wide pitch
export const DISC_R = 1.9;
export const PLAYER_BASE = 0.9;
export const BALL_BASE = 0.5;
export const LINE_W = 0.24;

export type Template = { id: string; label: string; strokes: { tool: StrokeTool; color: string; points: { x: number; y: number }[] }[] };
// quick-insert patterns, authored in portrait metres
export const TEMPLATES: Template[] = [
  {
    id: "press", label: "Pres tetiği",
    strokes: [
      { tool: "arrow", color: "#F5E94A", points: [{ x: 20, y: 45 }, { x: 30, y: 30 }] },
      { tool: "arrow", color: "#F5E94A", points: [{ x: 34, y: 42 }, { x: 34, y: 26 }] },
      { tool: "arrow", color: "#F5E94A", points: [{ x: 48, y: 45 }, { x: 38, y: 30 }] },
    ],
  },
  {
    id: "lowblock", label: "Geri çekilen blok",
    strokes: [
      { tool: "line", color: "#38BDF8", points: [{ x: 8, y: 78 }, { x: 60, y: 78 }] },
      { tool: "arrow", color: "#38BDF8", points: [{ x: 20, y: 55 }, { x: 20, y: 72 }] },
      { tool: "arrow", color: "#38BDF8", points: [{ x: 48, y: 55 }, { x: 48, y: 72 }] },
    ],
  },
  {
    id: "wingtriangle", label: "Kanat üçgeni",
    strokes: [
      { tool: "arrow", color: "#FFFFFF", points: [{ x: 8, y: 50 }, { x: 8, y: 25 }] },
      { tool: "darrow", color: "#FFFFFF", points: [{ x: 20, y: 55 }, { x: 10, y: 30 }] },
      { tool: "line", color: "#FFFFFF", points: [{ x: 8, y: 25 }, { x: 34, y: 18 }] },
    ],
  },
];

// fictional sample squads for the first view
export const HOME_SQUAD = [
  { number: 1, name: "Uğur" }, { number: 2, name: "Eren" }, { number: 4, name: "Kaan" },
  { number: 5, name: "Mert" }, { number: 3, name: "Ferdi" }, { number: 6, name: "Salih" },
  { number: 8, name: "Arda" }, { number: 10, name: "Hakan" }, { number: 7, name: "Yunus" },
  { number: 9, name: "Barış" }, { number: 11, name: "Kenan" },
];
export const AWAY_SQUAD = [
  { number: 1, name: "Silva" }, { number: 2, name: "Novak" }, { number: 5, name: "Larsen" },
  { number: 4, name: "Rossi" }, { number: 3, name: "Kovac" }, { number: 6, name: "Kim" },
  { number: 8, name: "Dupont" }, { number: 10, name: "Costa" }, { number: 7, name: "Okafor" },
  { number: 9, name: "Lindgren" }, { number: 11, name: "Popov" },
];
