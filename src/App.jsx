import React, { useState, useRef, useEffect, useMemo } from "react";
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from "webm-muxer";
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from "mp4-muxer";
import Tour from "./Tour.jsx";
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONTACT_EMAIL, OWNER_NAME } from "./config.js";
import {
  Plus, Download, Users, Palette, Tag, Grid3x3, PenTool, Eraser,
  Trash2, X, Check, Undo2, ArrowUpRight, Minus, Square,
  MousePointer2, Image as ImageIcon, ChevronRight, UserCog, Shield,
  Type, CircleDot, Save, LogOut, LogIn, FolderOpen, Layers, Play,
  Upload, Keyboard, ArrowUp, ArrowDown, Video, Sun, Moon, BoxSelect, Link2, Flag, RotateCw, Info
, HelpCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* DATA                                                                */
/* ------------------------------------------------------------------ */

const HOME_SQUAD = [
  { number: 1, name: "D. Ward" }, { number: 22, name: "P. Mendes" }, { number: 24, name: "I. Diallo" },
  { number: 15, name: "B. Hughes" }, { number: 21, name: "A. Ruiz" }, { number: 7, name: "L. Ferreira" },
  { number: 14, name: "A. Nowak" }, { number: 17, name: "Y. Demir" }, { number: 10, name: "D. Alvarez" },
  { number: 11, name: "N. Berg" }, { number: 20, name: "L. Petrovic" },
];

const AWAY_SQUAD = [
  { number: 1, name: "R. Silva" }, { number: 2, name: "K. Novak" }, { number: 5, name: "T. Larsen" },
  { number: 4, name: "M. Rossi" }, { number: 3, name: "E. Kovac" }, { number: 6, name: "S. Kim" },
  { number: 8, name: "J. Dupont" }, { number: 10, name: "F. Costa" }, { number: 7, name: "H. Okafor" },
  { number: 9, name: "B. Lindgren" }, { number: 11, name: "V. Popov" },
];

const FORMATIONS = {
  "4-4-2": [
    { role: "GK", x: 34, y: 100 },
    { role: "SL", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SG", x: 60, y: 80 },
    { role: "OSL", x: 8, y: 50 }, { role: "OS", x: 26, y: 55 }, { role: "OS", x: 42, y: 55 }, { role: "OSG", x: 60, y: 50 },
    { role: "F", x: 26, y: 20 }, { role: "F", x: 42, y: 20 },
  ],
  "4-3-3": [
    { role: "GK", x: 34, y: 100 },
    { role: "SL", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SG", x: 60, y: 80 },
    { role: "OS", x: 20, y: 55 }, { role: "DOS", x: 34, y: 60 }, { role: "OS", x: 48, y: 55 },
    { role: "SKA", x: 10, y: 25 }, { role: "F", x: 34, y: 18 }, { role: "SAA", x: 58, y: 25 },
  ],
  "4-2-3-1": [
    { role: "GK", x: 34, y: 100 },
    { role: "SL", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SG", x: 60, y: 80 },
    { role: "DOS", x: 24, y: 62 }, { role: "DOS", x: 44, y: 62 },
    { role: "SKA", x: 10, y: 38 }, { role: "OOS", x: 34, y: 32 }, { role: "SAA", x: 58, y: 38 },
    { role: "F", x: 34, y: 15 },
  ],
  "4-3-1-2": [
    { role: "GK", x: 34, y: 100 },
    { role: "SL", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SG", x: 60, y: 80 },
    { role: "OS", x: 18, y: 55 }, { role: "OS", x: 34, y: 58 }, { role: "OS", x: 50, y: 55 },
    { role: "OOS", x: 34, y: 35 },
    { role: "F", x: 24, y: 18 }, { role: "F", x: 44, y: 18 },
  ],
  "4-3-2-1": [
    { role: "GK", x: 34, y: 100 },
    { role: "SL", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SG", x: 60, y: 80 },
    { role: "OS", x: 18, y: 55 }, { role: "OS", x: 34, y: 58 }, { role: "OS", x: 50, y: 55 },
    { role: "F", x: 24, y: 32 }, { role: "F", x: 44, y: 32 },
    { role: "F", x: 34, y: 15 },
  ],
  "3-4-1-2": [
    { role: "GK", x: 34, y: 100 },
    { role: "STP", x: 16, y: 82 }, { role: "STP", x: 34, y: 86 }, { role: "STP", x: 52, y: 82 },
    { role: "KB", x: 6, y: 55 }, { role: "OS", x: 26, y: 58 }, { role: "OS", x: 42, y: 58 }, { role: "KB", x: 62, y: 55 },
    { role: "OOS", x: 34, y: 35 },
    { role: "F", x: 24, y: 18 }, { role: "F", x: 44, y: 18 },
  ],
  "4-1-2-1-2": [
    { role: "GK", x: 34, y: 100 },
    { role: "SL", x: 8, y: 80 }, { role: "STP", x: 24, y: 84 }, { role: "STP", x: 44, y: 84 }, { role: "SG", x: 60, y: 80 },
    { role: "DOS", x: 34, y: 65 },
    { role: "OS", x: 18, y: 48 }, { role: "OS", x: 50, y: 48 },
    { role: "OOS", x: 34, y: 32 },
    { role: "F", x: 24, y: 16 }, { role: "F", x: 44, y: 16 },
  ],
  "3-5-2": [
    { role: "GK", x: 34, y: 100 },
    { role: "STP", x: 16, y: 82 }, { role: "STP", x: 34, y: 86 }, { role: "STP", x: 52, y: 82 },
    { role: "KB", x: 6, y: 50 }, { role: "OS", x: 22, y: 55 }, { role: "OS", x: 34, y: 58 }, { role: "OS", x: 46, y: 55 }, { role: "KB", x: 62, y: 50 },
    { role: "F", x: 24, y: 18 }, { role: "F", x: 44, y: 18 },
  ],
  "5-3-2": [
    { role: "GK", x: 34, y: 100 },
    { role: "KB", x: 6, y: 78 }, { role: "STP", x: 20, y: 84 }, { role: "STP", x: 34, y: 87 }, { role: "STP", x: 48, y: 84 }, { role: "KB", x: 62, y: 78 },
    { role: "OS", x: 20, y: 55 }, { role: "OS", x: 34, y: 58 }, { role: "OS", x: 48, y: 55 },
    { role: "F", x: 24, y: 18 }, { role: "F", x: 44, y: 18 },
  ],
};

const PITCH_PRESETS = [
  { id: "full", label: "Tam Saha", W: 68, H: 105 },
  { id: "attackHalf", label: "Hücum Yarı Sahası", W: 68, H: 105 },
  { id: "defenseHalf", label: "Savunma Yarı Sahası", W: 68, H: 105 },
  { id: "attackThird", label: "Hücum Üçte Biri", W: 68, H: 105 },
  { id: "defenseThird", label: "Savunma Üçte Biri", W: 68, H: 105 },
  { id: "seven", label: "7'ye 7", W: 50, H: 80 },
  { id: "nine", label: "9'a 9", W: 58, H: 92 },
  { id: "blank", label: "Boş Saha", W: 68, H: 105, noLines: true },
];

const HIGHLIGHTS = {
  attackHalf: [0, 52.5], defenseHalf: [52.5, 105],
  attackThird: [0, 47], defenseThird: [58, 105],
};

const TEAM_COLORS = [
  "#3F86D6", "#F4F4F7", "#E5484D", "#F5C542", "#1F2430", "#8B5CF6",
  "#F59E0B", "#22A06B", "#0EA5E9", "#EC4899", "#F97316", "#94A3B8",
];
const DRAW_COLORS = ["#FFFFFF", "#F5E94A", "#EF4444", "#38BDF8", "#111827", "#2563EB", "#22C55E", "#F97316"];
const ARROW_COLORS = Array.from(new Set([...DRAW_COLORS, "#EAFF3D", "#F4F4F7", "#38BDF8"]));
const TEXT_SIZES = [2, 3, 4.2, 5.6];
const GK_COLOR = "#8D8E96";
const PLAYER_BASE = 0.72; // disc ≈ 2.7 m across on a 68 m pitch (a real player is far smaller, but this stays readable)
const BALL_BASE = 0.5; // ball ≈ 1.5 m across (real is 0.22 m, kept visible)
const EQUIP_BASE = { cone_tall: 0.4, pole: 0.4, flag: 0.45, hurdle: 0.4, ladder: 0.6, ring: 0.4, wall: 0.6 };
const equipBase = (type) => (CONE_COLORS[type] ? 0.5 : DUMMY_COLORS[type] ? 0.66 : GOAL_SPECS[type] ? 1 : EQUIP_BASE[type] || 0.5);
const DISC_R = 1.9; // player disc radius in metres on a 68 m wide pitch

const KIT_DESIGNS = [
  { id: "plain", label: "Düz" }, { id: "hoops", label: "Yatay Çizgili" }, { id: "thinhoops", label: "İnce Yatay" },
  { id: "stripes", label: "Dikey Çizgili" }, { id: "thinstripes", label: "İnce Dikey" }, { id: "halves", label: "Yarı Yarıya" },
  { id: "halvesH", label: "Alt-Üst" }, { id: "quarters", label: "Çeyrek" }, { id: "sash", label: "Çapraz Şerit" },
  { id: "band", label: "Orta Şerit" }, { id: "cross", label: "Artı" }, { id: "chevron", label: "V Şekli" },
  { id: "checks", label: "Damalı" }, { id: "diag", label: "Çapraz Çizgili" },
  { id: "pinstripe", label: "İnce Çizgi" }, { id: "plaid", label: "Ekose" }, { id: "wide", label: "Geniş Şerit" },
];

// grass: two alternating tones per colour (read from the reference footage)
const GRASS_COLORS = [
  { id: "green", label: "Yeşil", a: "#6A9D5B", b: "#66975A", line: "#FFFFFF" },
  { id: "fresh", label: "Açık Yeşil", a: "#6DBB5E", b: "#61AF55", line: "#FFFFFF" },
  { id: "deep", label: "Koyu Yeşil", a: "#3F8A4A", b: "#377F43", line: "#FFFFFF" },
  { id: "olive", label: "Zeytin", a: "#7A9A3A", b: "#6F8F33", line: "#FFFFFF" },
  { id: "charcoal", label: "Antrasit", a: "#3A3F3C", b: "#313634", line: "#E9ECEA" },
  { id: "navy", label: "Lacivert", a: "#3B4A6B", b: "#33415F", line: "#FFFFFF" },
  { id: "blue", label: "Mavi", a: "#3F7FCB", b: "#3873BA", line: "#FFFFFF" },
  { id: "grey", label: "Gri", a: "#7C7C84", b: "#72727A", line: "#FFFFFF" },
  { id: "sand", label: "Kum", a: "#C7B07B", b: "#BCA56F", line: "#FFFFFF" },
  { id: "clay", label: "Toprak", a: "#C0623C", b: "#B35A36", line: "#FFFFFF" },
];
const GRASS_PATTERNS = [
  { id: "grid", label: "Kareli" }, { id: "bands", label: "Yatay Şerit" }, { id: "lanes", label: "Dikey Şerit" }, { id: "checker", label: "Dama" },
  { id: "diag", label: "Çapraz" }, { id: "rings", label: "Halkalar" }, { id: "plain", label: "Düz" },
];

const ZONE_MODES = [
  { id: "none", label: "Yok" },
  { id: "thirds", label: "Üçte Birler" },
  { id: "halfspaces", label: "Half Space" },
  { id: "positional", label: "Pozisyonel Oyun" },
  { id: "lanes", label: "5 Kulvar" },
  { id: "lanesThirds", label: "Kulvar + Üçte Bir" },
];

function DashedArrowIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L8 16" /><path d="M11 13 L14 10" />
      <path d="M13 6 H18 V11" /><path d="M18 6 L17 7" />
    </svg>
  );
}

function FilledBoxIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="12" rx="1" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

function CurveIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 C4 10 10 5 19 5" /><path d="M14 4 L19.5 5 L17.5 10" />
    </svg>
  );
}

const DRAW_TOOLS = [
  { id: "move", label: "Taşı", icon: MousePointer2 },
  { id: "link", label: "Bağla", icon: Link2 },
  { id: "line", label: "Çizgi", icon: Minus },
  { id: "arrow", label: "Ok", icon: ArrowUpRight },
  { id: "darrow", label: "Kesik Ok", icon: DashedArrowIcon },
  { id: "curve", label: "Eğri Ok", icon: CurveIcon },
  { id: "pen", label: "Kalem", icon: PenTool },
  { id: "rect", label: "Kutu", icon: Square },
  { id: "frect", label: "Dolu Kutu", icon: FilledBoxIcon },
  { id: "zone", label: "Bölge", icon: BoxSelect },
  { id: "text", label: "Metin", icon: Type },
  { id: "eraser", label: "Silgi", icon: Eraser },
];
const LINE_W = 0.24; // same thickness as the pitch markings

const EQUIP_TYPES = [
  { id: "goal", label: "Kale (7,32 m)", rot: true }, { id: "goal5", label: "Kale (5 m)", rot: true }, { id: "mini", label: "Mini Kale (3 m)", rot: true },
  { id: "cone_white", label: "Koni (beyaz)" }, { id: "cone_yellow", label: "Koni (sarı)" }, { id: "cone_orange", label: "Koni (turuncu)" },
  { id: "cone_blue", label: "Koni (mavi)" }, { id: "cone_red", label: "Koni (kırmızı)" }, { id: "cone_tall", label: "Koni (yüksek)" },
  { id: "pole", label: "Slalom Sopası" }, { id: "hurdle", label: "Çit", rot: true }, { id: "ladder", label: "Çeviklik Merdiveni", rot: true },
  { id: "ring", label: "Halka" }, { id: "wall", label: "Manken Duvarı" }, { id: "flag", label: "Bayrak" },
  { id: "dummy_yellow", label: "Manken (sarı)", vb: "-2.4 -4.7 4.8 5.2" }, { id: "dummy_blue", label: "Manken (mavi)", vb: "-2.4 -4.7 4.8 5.2" }, { id: "dummy_red", label: "Manken (kırmızı)", vb: "-2.4 -4.7 4.8 5.2" },
];
const DUMMY_COLORS = { dummy_yellow: "#F6D60A", dummy_blue: "#3B82F6", dummy_red: "#E5484D" };
const CONE_COLORS = { cone_white: "#F4F4F4", cone_yellow: "#F6D60A", cone_orange: "#F28C28", cone_blue: "#3B82F6", cone_red: "#E5484D" };
const GOAL_SPECS = { goal: { w: 7.32, d: 2.4, h: 2.44 }, goal5: { w: 5, d: 1.8, h: 1.8 }, mini: { w: 3, d: 1.2, h: 1.1 } };
const FACINGS = ["up", "right", "down", "left"];

const TOOL_HINTS = {
  equip: "Malzeme: sahada bir yere dokunarak ekle. Eklenen malzemeye dokunursan döndürebilir, büyütebilir veya silebilirsin.",
  link: "Bağla: iki oyuncuya sırayla dokun, aralarına çizgi çekilir. Aynı ikiliye tekrar dokunursan çizgi silinir.",
  line: "Çizgi: sahada sürükleyerek çiz. Uçları birleşip kapalı bir şekil olursa içi boyanır.", arrow: "Ok: sahada sürükleyerek çiz.", darrow: "Kesik ok: sahada sürükleyerek çiz.", curve: "Eğri ok: sürükleyerek çiz. Mevcut bir çizgiyi/oku eğmek için ortasındaki beyaz noktayı tutup sürükle.", pen: "Kalem: serbest çiz.",
  rect: "Kutu: sahada sürükleyerek çiz.", frect: "Dolu Kutu: sürükleyerek yarı saydam dolgulu, beyaz çerçeveli alan çiz.", zone: "Bölge: bir alanı sürükleyerek seç, içindeki oyuncu sayısı yazılır.",
  text: "Metin: eklemek istediğin yere dokun.", eraser: "Silgi: silmek istediğin şeye dokun.", ball: "Top: sahada bir yere dokunarak ekle.",
};

const BALL_STYLES = [
  { id: "ucl", label: "Mavi-Altın Top" },
  { id: "superlig", label: "Kırmızı-Siyah Top" },
  { id: "stars", label: "Yıldızlı Top" },
  { id: "classic", label: "Klasik Top" },
];

// measured from the reference grid image (vertical lane boundaries are not
// equal width: flank / half-space / centre / half-space / flank)
const POS_VLINES = [0.195, 0.364, 0.626, 0.800];
const POS_ROWS = 6;

// quick-insert tactical arrow patterns (drawn in portrait/data-space meters)
const PRESET_PATTERNS = [
  {
    id: "press", label: "Pres Tetikleyici",
    strokes: [
      { tool: "arrow", color: "#EAFF3D", points: [{ x: 20, y: 45 }, { x: 30, y: 30 }] },
      { tool: "arrow", color: "#EAFF3D", points: [{ x: 34, y: 42 }, { x: 34, y: 26 }] },
      { tool: "arrow", color: "#EAFF3D", points: [{ x: 48, y: 45 }, { x: 38, y: 30 }] },
    ],
  },
  {
    id: "lowblock", label: "Geri Kayma Bloğu",
    strokes: [
      { tool: "line", color: "#38BDF8", points: [{ x: 8, y: 78 }, { x: 60, y: 78 }] },
      { tool: "arrow", color: "#38BDF8", points: [{ x: 20, y: 55 }, { x: 20, y: 72 }] },
      { tool: "arrow", color: "#38BDF8", points: [{ x: 48, y: 55 }, { x: 48, y: 72 }] },
    ],
  },
  {
    id: "wingtriangle", label: "Kanat Üçgeni",
    strokes: [
      { tool: "arrow", color: "#F4F4F7", points: [{ x: 8, y: 50 }, { x: 8, y: 25 }] },
      { tool: "arrow", color: "#F4F4F7", points: [{ x: 20, y: 55 }, { x: 10, y: 30 }] },
      { tool: "line", color: "#F4F4F7", points: [{ x: 8, y: 25 }, { x: 34, y: 18 }] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

// Pitch data is authored in portrait metres (x across 0..W, y along 0..H).
// makeProjection turns a data point into a screen point: it optionally
// transposes (landscape), then applies a simple camera perspective so the far
// end of the pitch is narrower — straight lines stay straight, circles become
// ellipses. Pinv undoes it for pointer input.
function makeProjection(cfg, isLandscape, persp, fill = 0, band = null) {
  const { W, H } = cfg;
  const Uw = isLandscape ? H : W, Vh = isLandscape ? W : H;
  const t = persp ? 0.19 : 0, kY = persp ? 0.9 : 1;
  const P = (x, y) => {
    const u = isLandscape ? y : x, v = isLandscape ? W - x : y;
    const d = 1 + t * (1 - v / Vh);
    return { x: Uw / 2 + (u - Uw / 2) / d, y: Vh + (kY * (v - Vh)) / d, s: 1 / d };
  };
  const Pinv = (X, Y) => {
    const e = Y - Vh;
    const w = e / Math.max(0.05, kY + (e * t) / Vh);
    const d = 1 - (t * w) / Vh;
    const u = Uw / 2 + (X - Uw / 2) * d, v = Vh + w;
    return isLandscape ? { x: W - v, y: u } : { x: u, y: v };
  };
  const unit = W / 68;
  const gd = 2.4 * unit;
  const ya = band && band[0] > 0 ? band[0] : -gd, yb = band && band[1] < H ? band[1] : H + gd;
  const pts = (band ? [[0, ya], [W, ya], [0, yb], [W, yb]] : [[0, -gd], [W, -gd], [0, H + gd], [W, H + gd], [0, 0], [W, 0], [0, H], [W, H]]).map(([x, y]) => P(x, y));
  const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const mix = (a, b) => a + (b - a) * fill; // fill 0 = roomy margins, 1 = pitch fills the screen
  const padX = mix(3.6, 0.4), padT = mix(isLandscape ? 8.5 : 13, 1.2), padB = mix(5.2, 0.8);
  const vbW = maxX - minX + 2 * padX, vbH = maxY - minY + padT + padB;
  const viewBox = `${minX - padX} ${minY - padT} ${vbW} ${vbH}`;
  const clipPts = band ? [[-8, band[0] > 0 ? band[0] : -8], [W + 8, band[0] > 0 ? band[0] : -8], [W + 8, band[1] < H ? band[1] : H + 8], [-8, band[1] < H ? band[1] : H + 8]].map(([x, y]) => P(x, y)).map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ") : null;
  return { P, Pinv, viewBox, unit, vbW, vbH, clipPts };
}

function isLight(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16), g = parseInt(c.substring(2, 4), 16), b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 170;
}
// mix a colour toward black (amt < 0) or white (amt > 0)
function shade(hex, amt) {
  const c = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) => parseInt(c.substring(i, i + 2), 16));
  const target = amt < 0 ? 0 : 255, a = Math.abs(amt);
  return "#" + ch.map((v) => Math.round(v + (target - v) * a).toString(16).padStart(2, "0")).join("");
}
function svgPoint(evt, svg) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

// every closed loop (3 to 8 points, no shortcuts inside) in a graph gets a soft fill
function findCycles(adj) {
  const ids = Object.keys(adj).sort();
  const idx = {};
  ids.forEach((id, i) => { idx[id] = i; });
  const out = [];
  ids.forEach((start) => {
    const path = [start];
    const dfs = (cur) => {
      if (out.length > 80) return;
      adj[cur].forEach((nb) => {
        if (nb === start && path.length >= 3) {
          if (idx[path[1]] < idx[path[path.length - 1]]) {
            let ok = true;
            for (let i = 0; i < path.length && ok; i++) for (let j = i + 2; j < path.length; j++) {
              if (i === 0 && j === path.length - 1) continue;
              if (adj[path[i]].has(path[j])) { ok = false; break; }
            }
            if (ok) out.push([...path]);
          }
          return;
        }
        if (idx[nb] <= idx[start] || path.includes(nb) || path.length >= 8) return;
        path.push(nb); dfs(nb); path.pop();
      });
    };
    dfs(start);
  });
  return out;
}
function findLinkShapes(links) {
  const adj = {};
  links.forEach((l) => { (adj[l.a] = adj[l.a] || new Set()).add(l.b); (adj[l.b] = adj[l.b] || new Set()).add(l.a); });
  return findCycles(adj);
}
// drawn straight lines whose ends meet form closed shapes too
function findLineShapes(strokes) {
  const nodes = [], adj = {}, colors = {};
  const nodeFor = (p) => {
    let best = -1, bd = 2.2;
    nodes.forEach((n, i) => { const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < bd) { bd = d; best = i; } });
    if (best < 0) { nodes.push({ x: p.x, y: p.y }); return nodes.length - 1; }
    return best;
  };
  strokes.filter((s) => s.tool === "line" && !s.c).forEach((s) => {
    const a = `n${nodeFor(s.points[0])}`, b = `n${nodeFor(s.points[1])}`;
    if (a === b) return;
    (adj[a] = adj[a] || new Set()).add(b); (adj[b] = adj[b] || new Set()).add(a);
    colors[a] = colors[a] || s.color; colors[b] = colors[b] || s.color;
  });
  return findCycles(adj).map((ids) => ({ pts: ids.map((id) => nodes[Number(id.slice(1))]), color: colors[ids[0]] || "#FFFFFF" }));
}

function buildFormation(key, squad, prefix, mirror) {
  return FORMATIONS[key].map((slot, i) => ({
    id: `${prefix}${i}`, number: squad ? squad[i].number : "", name: squad ? squad[i].name : "",
    role: slot.role, x: slot.x, y: mirror ? 105 - slot.y : slot.y,
  }));
}
// 1..11 players: GK + rows of outfielders. y is given for the bottom half (GK at 100); mirror puts the team in the top half
function buildTeam(count, prefix, mirror, prev = []) {
  const m = count - 1;
  const ROWS = { 0: [], 1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [3, 2], 6: [3, 3], 7: [3, 3, 1], 8: [3, 3, 2], 9: [4, 3, 2], 10: [4, 3, 3] };
  const rows = ROWS[m];
  const out = [{ role: "GK", x: 34, y: 99 }];
  rows.forEach((k, r) => {
    const y = rows.length === 1 ? 82 : 84 - (r * 52) / (rows.length - 1);
    const role = rows.length === 1 ? "OS" : r === 0 ? "STP" : r === rows.length - 1 ? "F" : "OS";
    for (let i = 0; i < k; i++) out.push({ role, x: (68 * (i + 1)) / (k + 1), y });
  });
  return out.map((slot, i) => ({
    id: `${prefix}${i}`, number: prev[i] ? prev[i].number : "", name: prev[i] ? prev[i].name : "",
    role: slot.role, x: slot.x, y: mirror ? 105 - slot.y : slot.y,
  }));
}
function remapFormation(prev, key, squad, prefix, mirror) {
  return FORMATIONS[key].map((slot, i) => {
    const old = prev[i];
    return {
      id: `${prefix}${i}`, number: old ? old.number : (squad ? squad[i].number : ""), name: old ? old.name : (squad ? squad[i].name : ""),
      role: slot.role, x: slot.x, y: mirror ? 105 - slot.y : slot.y,
    };
  });
}

/* ------------------------------------------------------------------ */
/* GRASS + PITCH MARKINGS + ZONES (all drawn through the projection)    */
/* ------------------------------------------------------------------ */

const quadPts = (A, B, C, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, m = 1 - t; return { x: m * m * A.x + 2 * m * t * C.x + t * t * B.x, y: m * m * A.y + 2 * m * t * C.y + t * t * B.y }; });
const curveMid = (A, B, C) => ({ x: 0.25 * A.x + 0.5 * C.x + 0.25 * B.x, y: 0.25 * A.y + 0.5 * C.y + 0.25 * B.y });
const distToPoly = (p, pts) => {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    best = Math.min(best, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)));
  }
  return best;
};
const LINE_TOOLS = ["line", "arrow", "darrow"];

const polyStr = (P, arr) => arr.map(([x, y]) => { const q = P(x, y); return `${q.x.toFixed(2)},${q.y.toFixed(2)}`; }).join(" ");
const circPts = (cx, cy, r, n = 72) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const arcPts = (fn, a0, a1, n = 36) => Array.from({ length: n + 1 }, (_, i) => fn(a0 + ((a1 - a0) * i) / n));

const GrassLayer = React.memo(function GrassLayer({ proj, W, H, pattern, a, b }) {
  const P = proj.P;
  const M = 70, step = 8.75;
  const x0 = -M, x1 = W + M, y0 = -M * 0.8, y1 = H + M * 0.8;
  const els = [];
  const quad = (key, pts) => els.push(<polygon key={key} points={polyStr(P, pts)} fill={b} />);
  if (pattern === "grid") {
    // plaid: lighter odd columns (14 across) and darker odd rows (20 along), as in the reference footage
    const cw = W / 14, rh = H / 20;
    for (let j = Math.floor(x0 / cw); j * cw < x1; j++) if (((j % 2) + 2) % 2 === 1) els.push(<polygon key={`gc${j}`} points={polyStr(P, [[j * cw, y0], [(j + 1) * cw, y0], [(j + 1) * cw, y1], [j * cw, y1]])} fill="#BAED8D" fillOpacity={0.1} />);
    for (let i = Math.floor(y0 / rh); i * rh < y1; i++) if (((i % 2) + 2) % 2 === 1) els.push(<polygon key={`gr${i}`} points={polyStr(P, [[x0, i * rh], [x1, i * rh], [x1, (i + 1) * rh], [x0, (i + 1) * rh]])} fill="#000000" fillOpacity={0.038} />);
  } else if (pattern === "bands") {
    for (let k = Math.floor(y0 / step); k * step < y1; k++) if (k % 2 !== 0) quad(`b${k}`, [[x0, k * step], [x1, k * step], [x1, (k + 1) * step], [x0, (k + 1) * step]]);
  } else if (pattern === "lanes") {
    for (let k = Math.floor(x0 / step); k * step < x1; k++) if (k % 2 !== 0) quad(`l${k}`, [[k * step, y0], [(k + 1) * step, y0], [(k + 1) * step, y1], [k * step, y1]]);
  } else if (pattern === "checker") {
    for (let kx = Math.floor(x0 / step); kx * step < x1; kx++) for (let ky = Math.floor(y0 / step); ky * step < y1; ky++) {
      if ((kx + ky) % 2 !== 0) quad(`c${kx}_${ky}`, [[kx * step, ky * step], [(kx + 1) * step, ky * step], [(kx + 1) * step, (ky + 1) * step], [kx * step, (ky + 1) * step]]);
    }
  } else if (pattern === "diag") {
    const wd = step * 1.2, sh = (y1 - y0) * 0.7;
    for (let k = 0; x0 - sh + k * wd < x1; k++) if (k % 2 !== 0) {
      const u = x0 - sh + k * wd;
      quad(`d${k}`, [[u, y0], [u + wd, y0], [u + wd + sh, y1], [u + sh, y1]]);
    }
  } else if (pattern === "rings") {
    const rs = [];
    for (let r = 150; r > 0; r -= 7.5) rs.push(r);
    rs.forEach((r, i) => els.push(<polygon key={`r${i}`} points={polyStr(P, circPts(W / 2, H / 2, r, 90))} fill={i % 2 === 0 ? b : a} />));
  }
  return (
    <g>
      <rect x={-4000} y={-4000} width={8000} height={8000} fill={a} />
      {els}
    </g>
  );
});

const PitchMarkings = React.memo(function PitchMarkings({ proj, W, H, lineColor }) {
  const P = proj.P, k = W / 68;
  const boxW = 0.593 * W, boxD = 0.157 * H, sixW = 0.2694 * W, sixD = 0.0524 * H;
  const circleR = 0.1345 * W, spotY = 0.1048 * H, cornerR = 0.0147 * W, goalW = 0.1076 * W, goalD = 2.4 * k;
  const cx = W / 2;
  const s = { fill: "none", stroke: lineColor, strokeWidth: 0.24, strokeLinejoin: "round", strokeLinecap: "round" };
  const rect = (x, y, w, h, key, extra) => <polygon key={key} points={polyStr(P, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]])} {...s} {...extra} />;
  const m = (boxD - spotY) / circleR, a0 = Math.asin(m), a1 = Math.PI - Math.asin(m);
  const arcTop = arcPts((a) => [cx + circleR * Math.cos(a), spotY + circleR * Math.sin(a)], a0, a1);
  const arcBot = arcPts((a) => [cx + circleR * Math.cos(a), H - spotY - circleR * Math.sin(a)], a0, a1);
  const dot = (x, y, key) => { const q = P(x, y); return <circle key={key} cx={q.x} cy={q.y} r={0.3 * q.s} fill={lineColor} />; };
  const goal3d = (yLine, dir) => {
    const FL = P(cx - goalW / 2, yLine), FR = P(cx + goalW / 2, yLine);
    const BL = P(cx - goalW / 2, yLine + dir * goalD);
    return <GoalDraw FL={FL} FR={FR} BL={BL} color={lineColor} part="back" />;
  };
  return (
    <g>
      {goal3d(0, -1)}
      {rect(0, 0, W, H, "outer")}
      {goal3d(H, 1)}
      <polyline points={polyStr(P, [[0, H / 2], [W, H / 2]])} {...s} />
      <polygon points={polyStr(P, circPts(cx, H / 2, circleR))} {...s} />
      {dot(cx, H / 2, "c")}
      {rect(cx - boxW / 2, 0, boxW, boxD, "bt")}
      {rect(cx - sixW / 2, 0, sixW, sixD, "st")}
      {dot(cx, spotY, "pt")}
      <polyline points={polyStr(P, arcTop)} {...s} />
      {rect(cx - boxW / 2, H - boxD, boxW, boxD, "bb")}
      {rect(cx - sixW / 2, H - sixD, sixW, sixD, "sb")}
      {dot(cx, H - spotY, "pb")}
      <polyline points={polyStr(P, arcBot)} {...s} />
      <polyline points={polyStr(P, arcPts((a) => [cornerR * Math.cos(a), cornerR * Math.sin(a)], 0, Math.PI / 2, 10))} {...s} />
      <polyline points={polyStr(P, arcPts((a) => [W - cornerR * Math.cos(a), cornerR * Math.sin(a)], 0, Math.PI / 2, 10))} {...s} />
      <polyline points={polyStr(P, arcPts((a) => [cornerR * Math.cos(a), H - cornerR * Math.sin(a)], 0, Math.PI / 2, 10))} {...s} />
      <polyline points={polyStr(P, arcPts((a) => [W - cornerR * Math.cos(a), H - cornerR * Math.sin(a)], 0, Math.PI / 2, 10))} {...s} />
    </g>
  );
});

const ZoneHighlight = React.memo(function ZoneHighlight({ proj, pitchId, W }) {
  const band = HIGHLIGHTS[pitchId];
  if (!band) return null;
  const [y0, y1] = band;
  return <polygon points={polyStr(proj.P, [[0, y0], [W, y0], [W, y1], [0, y1]])} fill="#FFFFFF" fillOpacity={0.12} stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={0.22} strokeDasharray="1.2 1" />;
});

const ZoneOverlay = React.memo(function ZoneOverlay({ proj, W, H, mode }) {
  if (mode === "none") return null;
  const P = proj.P;
  const dash = { stroke: "#FFFFFF", strokeWidth: 0.18, strokeDasharray: "0.9 0.9", opacity: 0.75 };
  const hl = (y, key) => <polyline key={key} points={polyStr(P, [[0, y], [W, y]])} fill="none" {...dash} />;
  const vl = (x, key) => <polyline key={key} points={polyStr(P, [[x, 0], [x, H]])} fill="none" {...dash} />;
  if (mode === "thirds") return <g>{[1, 2].map((i) => hl((H * i) / 3, `h${i}`))}</g>;
  if (mode === "lanes") return <g>{[1, 2, 3, 4].map((i) => vl((W * i) / 5, `v${i}`))}</g>;
  if (mode === "lanesThirds") return <g>{[1, 2, 3, 4].map((i) => vl((W * i) / 5, `v${i}`))}{[1, 2].map((i) => hl((H * i) / 3, `h${i}`))}</g>;
  if (mode === "halfspaces") {
    const laneW = W / 5;
    return (
      <g>
        {[1, 2, 3, 4].map((i) => vl(laneW * i, `v${i}`))}
        {[1, 3].map((i) => <polygon key={`f${i}`} points={polyStr(P, [[laneW * i, 0], [laneW * (i + 1), 0], [laneW * (i + 1), H], [laneW * i, H]])} fill="#FFFFFF" fillOpacity={0.16} />)}
      </g>
    );
  }
  if (mode === "positional") {
    return (
      <g>
        {POS_VLINES.map((f, i) => vl(W * f, `v${i}`))}
        {Array.from({ length: POS_ROWS - 1 }, (_, j) => hl((H * (j + 1)) / POS_ROWS, `h${j}`))}
      </g>
    );
  }
  return null;
});

/* ---------------- 3D goal (used on the pitch and as a placeable item) ---------------- */

function GoalDraw({ FL, FR, BL, color = "#FFFFFF", part = "all" }) {
  // FL/FR = ground points of the two front posts, BL = ground point behind FL (gives where the net runs).
  // A real box: front frame (posts + crossbar), lower back frame, side nets, roof net and back net.
  const W = Math.hypot(FR.x - FL.x, FR.y - FL.y) || 1;
  let ux = BL.x - FL.x, uy = BL.y - FL.y;
  const ul = Math.hypot(ux, uy) || 1;
  const dl = Math.max(ul, W * 0.2);
  ux = (ux / ul) * dl; uy = (uy / ul) * dl;
  const hh = W * 0.34, hb = hh * 0.6; // front height, back height
  // posts stand exactly vertical (90°) on screen
  const up = (p, h) => ({ x: p.x, y: p.y - h });
  const add = (p, x, y) => ({ x: p.x + x, y: p.y + y });
  const TL = up(FL, hh), TR = up(FR, hh);
  const BLg = add(FL, ux, uy), BRg = add(FR, ux, uy);
  const BTL = up(BLg, hb), BTR = up(BRg, hb);
  const pts = (...ps) => ps.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const net = (key, ps, op) => <polygon key={key} points={pts(...ps)} fill="url(#netPat)" fillOpacity={op} stroke={color} strokeWidth={0.1} strokeOpacity={0.55} strokeLinejoin="round" />;
  const tube = (ps, w) => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={pts(...ps)} stroke="rgba(8,12,20,0.55)" strokeWidth={w + 0.3} />
      <polyline points={pts(...ps)} stroke={color} strokeWidth={w} />
      <polyline points={pts(...ps)} stroke="#fff" strokeOpacity={0.55} strokeWidth={w * 0.3} transform="translate(-0.06,-0.06)" />
    </g>
  );
  const back = (
    <g key="back">
      <polygon points={pts(FL, FR, BRg, BLg)} fill="#000" fillOpacity={0.2} />
      {net("n1", [BLg, BRg, BTR, BTL], 1)}
    </g>
  );
  // side + roof nets sit in front of anything inside the goal (a ball seen through the net), so they join the front layer
  const front = (
    <g key="front">
      {/* the back posts and rails stand above the ball: a ball that reaches the back post is seen under it */}
      {tube([BLg, BTL, BTR, BRg], 0.2)}
      {tube([TL, BTL], 0.2)}
      {tube([TR, BTR], 0.2)}
      {net("n2", [FL, BLg, BTL, TL], 0.6)}
      {net("n3", [FR, BRg, BTR, TR], 0.6)}
      {net("n4", [TL, TR, BTR, BTL], 0.5)}
      {tube([FL, TL, TR, FR], 0.42)}
    </g>
  );
  return <g>{part !== "front" && back}{part !== "back" && front}</g>;
}

function GoalFronts({ proj, W, H }) {
  const P = proj.P, k = W / 68, goalW = 0.1076 * W, goalD = 2.4 * k, cx = W / 2;
  const one = (yLine, dir, key) => <GoalDraw key={key} part="front" FL={P(cx - goalW / 2, yLine)} FR={P(cx + goalW / 2, yLine)} BL={P(cx - goalW / 2, yLine + dir * goalD)} />;
  return <g style={{ pointerEvents: "none" }}>{one(0, -1, "t")}{one(H, 1, "b")}</g>;
}

function GoalLocal({ w, d, ang = 0, part = "all" }) {
  const th = (ang * Math.PI) / 180, c = Math.cos(th), sn = Math.sin(th), sq = 0.75;
  const pt = (x, y) => ({ x: x * c - y * sn, y: (x * sn + y * c) * sq });
  return <GoalDraw FL={pt(-w / 2, d / 2)} FR={pt(w / 2, d / 2)} BL={pt(-w / 2, -d / 2)} part={part} />;
}

function Dummy({ c }) {
  // training mannequin copied from the reference: wide slatted plate with three columns of perforations,
  // carry loop on top, four thin legs, flat base slab. Drawn in 100-units-per-metre pixel coordinates.
  const dk = shade(c, -0.32), md = shade(c, -0.12), lt = shade(c, 0.28);
  const cols = [[128, 318], [244, 330], [346, 322]];
  const tube = (d, w) => (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={dk} strokeWidth={w + 5} />
      <path d={d} stroke={c} strokeWidth={w} />
      <path d={d} stroke={lt} strokeWidth={w * 0.3} transform="translate(-2,-1)" />
    </g>
  );
  return (
    <g transform="translate(-3,-6.55) scale(0.01)">
      <ellipse cx={385} cy={662} rx={200} ry={26} fill="#000" opacity="0.22" />
      {/* legs */}
      {tube("M 165,448 Q 215,545 272,612", 16)}
      {tube("M 262,452 L 322,612", 16)}
      {tube("M 352,452 L 415,612", 16)}
      {tube("M 458,440 Q 432,525 468,612", 16)}
      {/* base slab */}
      <polygon points="250,610 495,603 500,624 252,632" fill={lt} stroke={dk} strokeWidth={3} strokeLinejoin="round" />
      <polygon points="252,632 500,624 500,653 252,656" fill={c} stroke={dk} strokeWidth={3} strokeLinejoin="round" />
      {[272, 325, 416, 466].map((x) => <rect key={x} x={x - 9} y={604} width={18} height={20} rx={4} fill={md} stroke={dk} strokeWidth={2} />)}
      {/* loop handle */}
      {tube("M 205,288 Q 160,262 170,232 Q 190,208 245,208 Q 305,208 322,236 Q 330,262 312,288", 15)}
      {/* plate */}
      <path d="M 102,312 Q 92,288 128,284 L 410,284 Q 452,288 457,326 L 474,416 Q 476,446 438,448 L 188,452 Q 140,450 124,420 Z" fill={c} stroke={dk} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 110,300 Q 112,290 135,289 L 408,289 Q 440,292 446,312" fill="none" stroke={lt} strokeWidth={5} strokeLinecap="round" />
      {cols.map(([x0, w], ci) => (
        <g key={ci} fill={dk} opacity="1">
          {[0, 1, 2, 3].map((r) => Array.from({ length: 5 }, (_, k) => (
            <rect key={`${r}-${k}`} x={x0 + k * (ci === 1 ? 15 : 17) + r * 6} y={320 + r * 26 + (ci === 2 ? r * 2 : 0)} width={10} height={7} />
          )))}
        </g>
      ))}
    </g>
  );
}

function EquipGlyph({ type, rot = 0, ang, part = "all" }) {
  const A = ang != null ? ang : (rot || 0) * 90;
  if (CONE_COLORS[type]) {
    const c = CONE_COLORS[type];
    return (
      <g>
        <ellipse cx={0.2} cy={0.45} rx={1.25} ry={0.62} fill="#000" opacity="0.24" />
        <ellipse rx={1.15} ry={0.8} fill={c} stroke={shade(c, -0.3)} strokeWidth={0.14} />
        <ellipse cy={-0.08} rx={0.95} ry={0.55} fill={shade(c, 0.12)} opacity="0.55" />
        <ellipse cy={0.02} rx={0.42} ry={0.27} fill={shade(c, -0.22)} />
      </g>
    );
  }
  if (DUMMY_COLORS[type]) return <Dummy c={DUMMY_COLORS[type]} />;
  if (GOAL_SPECS[type]) { const g = GOAL_SPECS[type]; return <GoalLocal w={g.w} d={g.d} ang={A} part={part} />; }
  switch (type) {
    case "cone_tall": return (
      <g>
        <ellipse cx={0.2} cy={0.6} rx={1.3} ry={0.6} fill="#000" opacity="0.24" />
        <ellipse cy={0.45} rx={1.15} ry={0.62} fill="#D9731B" />
        <polygon points="-0.95,0.4 0,-2.3 0.95,0.4" fill="#F28C28" />
        <polygon points="0,-2.3 0.95,0.4 0.2,0.55" fill="#D9731B" opacity="0.7" />
        <polygon points="-0.55,-0.7 0.55,-0.7 0.7,-0.2 -0.7,-0.2" fill="#FFFFFF" opacity="0.92" />
      </g>
    );
    case "pole": return (
      <g>
        <ellipse cx={0.2} cy={0.5} rx={1.0} ry={0.5} fill="#000" opacity="0.24" />
        <ellipse cy={0.35} rx={0.9} ry={0.5} fill="#F6D60A" stroke="#B89D00" strokeWidth={0.12} />
        <line x1={0} y1={0.2} x2={0.4} y2={-3.6} stroke="#B89D00" strokeWidth={0.46} strokeLinecap="round" />
        <line x1={0} y1={0.2} x2={0.4} y2={-3.6} stroke="#F6D60A" strokeWidth={0.3} strokeLinecap="round" />
      </g>
    );
    case "hurdle": return (
      <g transform={`rotate(${A})`}>
        <rect x={-1.9} y={-0.1} width={3.8} height={0.9} rx={0.3} fill="#000" opacity="0.2" />
        <rect x={-1.7} y={0.2} width={0.4} height={1.0} rx={0.15} fill="#C9AE00" />
        <rect x={1.3} y={0.2} width={0.4} height={1.0} rx={0.15} fill="#C9AE00" />
        <rect x={-1.75} y={-1.2} width={0.34} height={1.5} rx={0.15} fill="#F6D60A" />
        <rect x={1.41} y={-1.2} width={0.34} height={1.5} rx={0.15} fill="#F6D60A" />
        <rect x={-1.75} y={-1.3} width={3.5} height={0.5} rx={0.2} fill="#F6D60A" stroke="#B89D00" strokeWidth={0.1} />
      </g>
    );
    case "ladder": return (
      <g transform={`rotate(${A})`}>
        <rect x={-1.3} y={-3.6} width={2.6} height={7.2} fill="#000" opacity="0.14" />
        <line x1={-1.1} y1={-3.5} x2={-1.1} y2={3.5} stroke="#F28C28" strokeWidth={0.34} strokeLinecap="round" />
        <line x1={1.1} y1={-3.5} x2={1.1} y2={3.5} stroke="#F28C28" strokeWidth={0.34} strokeLinecap="round" />
        {[-3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0].map((y) => <line key={y} x1={-1.1} y1={y} x2={1.1} y2={y} stroke="#FFFFFF" strokeWidth={0.22} />)}
      </g>
    );
    case "ring": return (
      <g>
        <ellipse cx={0.2} cy={0.45} rx={1.7} ry={1.15} fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth={0.4} />
        <ellipse rx={1.7} ry={1.15} fill="rgba(255,255,255,0.001)" stroke="#F28C28" strokeWidth={0.42} />
        <ellipse cy={-0.06} rx={1.5} ry={0.98} fill="none" stroke="#FFC27A" strokeWidth={0.12} opacity="0.8" />
      </g>
    );
    case "wall": return (
      <g>
        <ellipse cx={0.3} cy={0.6} rx={3.1} ry={0.6} fill="#000" opacity="0.2" />
        <polygon points="-2.7,-2.7 2.7,-2.7 2.7,0.2 -2.7,0.2" fill="url(#netPatY)" stroke="#F6D60A" strokeWidth={0.3} strokeLinejoin="round" />
        <line x1={-0.9} y1={-2.7} x2={-0.9} y2={0.2} stroke="#F6D60A" strokeWidth={0.2} />
        <line x1={0.9} y1={-2.7} x2={0.9} y2={0.2} stroke="#F6D60A" strokeWidth={0.2} />
        <rect x={-3.0} y={0.1} width={1.2} height={0.4} fill="#F6D60A" /><rect x={1.8} y={0.1} width={1.2} height={0.4} fill="#F6D60A" />
      </g>
    );
    case "flag": return (
      <g>
        <ellipse cx={0.2} cy={0.4} rx={0.8} ry={0.4} fill="#000" opacity="0.24" />
        <line x1={0} y1={0.3} x2={0} y2={-4} stroke="#F4F4F4" strokeWidth={0.28} strokeLinecap="round" />
        <polygon points="0,-4 2.2,-3.3 0,-2.5" fill="#E5484D" stroke="#B42318" strokeWidth={0.1} />
      </g>
    );
    default: return null;
  }
}

/* ---------------- ball glyphs (original stylised artwork, not photos) ------------- */
/* Real match-ball photos carry club/league/manufacturer trademarks (adidas,
   UEFA star device, "Trendyol Süper Lig" marks) that stay protected no matter
   how the app is used, so these are original recreations — same colour
   language, not a copy — plus a glossy shared shine so they read as "real"
   balls rather than flat icons. */


const CLASSIC_BALL_PNG = "data:image/png;base64,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";



/* ---------------- ball glyphs ----------------
   Realistic renders: each ball is a proper 3D-projected geometric sphere
   (a real truncated-icosahedron, i.e. actual 32-panel football geometry,
   computed and shaded — not a flat vector icon, not a copied photo). Colour
   schemes echo Champions League / Süper Lig without reproducing any
   trademarked logo or wordmark. */

function BallImage({ src, r = 1.55 }) {
  return <image href={src} x={-r} y={-r} width={r * 2} height={r * 2} preserveAspectRatio="xMidYMid meet" />;
}
/* original ball artwork: a classic 32-panel ball built from real sphere geometry,
   coloured with two team palettes (blue/gold and red/black/sky). */
const BALL_GEO = (() => {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const n3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const cyc = (a, b, c) => [[a, b, c], [c, a, b], [b, c, a]];
  const signs = (v) => { const out = []; [1, -1].forEach((x) => [1, -1].forEach((y) => [1, -1].forEach((z) => out.push([v[0] * x, v[1] * y, v[2] * z])))); return out; };
  const seen = new Set(), verts = [];
  [[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, 2 * PHI + 1]].forEach(([a, b, c]) => cyc(a, b, c).forEach((p) => signs(p).forEach((q) => {
    const k = q.map((t) => Math.round(t * 1000)).join(","); if (!seen.has(k)) { seen.add(k); verts.push(n3(q)); }
  })));
  const uniq = (arr) => { const m = new Set(), out = []; arr.forEach((q) => { const k = q.map((t) => Math.round(t * 1000)).join(","); if (!m.has(k)) { m.add(k); out.push(q); } }); return out; };
  const pentC = uniq(cyc(0, 1, PHI).flatMap(signs)).map(n3);
  const hexC = uniq([...signs([1, 1, 1]), ...cyc(1 / PHI, 0, PHI).flatMap(signs)]).map(n3);
  const faces = [];
  const build = (c, k, type) => {
    const near = verts.map((v) => ({ v, d: dot(v, c) })).sort((p, q) => q.d - p.d).slice(0, k).map((o) => o.v);
    const u = n3(cross(c, Math.abs(c[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0])), w = cross(c, u);
    near.sort((p, q) => Math.atan2(dot(p, w), dot(p, u)) - Math.atan2(dot(q, w), dot(q, u)));
    faces.push({ type, c, ring: near });
  };
  pentC.forEach((c) => build(c, 5, "p")); hexC.forEach((c) => build(c, 6, "h"));
  // view: a hexagon faces the camera, slightly tilted so it feels natural
  const h0 = n3([1, 1, 1]), e1 = n3(cross(h0, [0, 0, 1])), e2 = cross(h0, e1);
  const ax = 0.28, ay = -0.22;
  const view = (v) => {
    let x = dot(v, e1), y = dot(v, e2), z = dot(v, h0);
    let y2 = y * Math.cos(ax) - z * Math.sin(ax), z2 = y * Math.sin(ax) + z * Math.cos(ax);
    let x2 = x * Math.cos(ay) + z2 * Math.sin(ay), z3 = -x * Math.sin(ay) + z2 * Math.cos(ay);
    return [x2, y2, z3];
  };
  const edgePts = (ring, scale, c) => {
    const out = [];
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length];
      for (let t = 0; t < 6; t++) {
        const f = t / 6; let p = n3([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
        if (scale !== 1) p = n3([c[0] + (p[0] - c[0]) * scale, c[1] + (p[1] - c[1]) * scale, c[2] + (p[2] - c[2]) * scale]);
        out.push(view(p));
      }
    });
    return out;
  };
  return faces.map((f) => ({ type: f.type, z: view(f.c)[2], outer: edgePts(f.ring, 1, f.c), inner: edgePts(f.ring, 0.74, f.c) })).filter((f) => f.z > -0.3).sort((a, b) => a.z - b.z);
})();

const BALL_PALETTES = {
  ucl: { hex: ["#F6F3EA", "#EAF1F8"], pent: ["#2F8FE0", "#2F8FE0"], seam: "#C9A24B", seamW: 0.045, ring: "#1F2B4D", ringW: 0.03, ringOn: "p" },
  superlig: { hex: ["#FFFFFF", "#FFFFFF"], pent: ["#E5333F", "#17191F"], seam: "#17191F", seamW: 0.03, ring: "#8BC3E8", ringW: 0.04, ringOn: "h" },
};
function BallPalette({ id, r = 1.55 }) {
  const pal = BALL_PALETTES[id] || BALL_PALETTES.ucl;
  const path = (pts) => pts.map((p, i) => { const l = Math.hypot(p[0], p[1]), k = p[2] < 0 && l > 0 ? 1 / l : 1; return `${i ? "L" : "M"}${(p[0] * k).toFixed(3)} ${(p[1] * k).toFixed(3)}`; }).join(" ") + "Z";
  let pi = 0, hi = 0;
  return (
    <g transform={`scale(${r})`}>
      <defs>
        <clipPath id="ballClipU"><circle r={1} /></clipPath>
        <radialGradient id="ballRimU" cx="50%" cy="50%" r="50%"><stop offset="62%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.38" /></radialGradient>
        <radialGradient id="ballGlossU" cx="34%" cy="28%" r="46%"><stop offset="0%" stopColor="#fff" stopOpacity="0.7" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={0.14} cy={0.95} rx={0.95} ry={0.3} fill="#000" opacity="0.2" transform="scale(1,0.8)" />
      <circle r={1} fill={pal.hex[0]} />
      <g clipPath="url(#ballClipU)">
        {BALL_GEO.map((f, i) => {
          const fill = f.type === "p" ? pal.pent[pi++ % pal.pent.length] : pal.hex[hi++ % pal.hex.length];
          return (
            <g key={i}>
              <path d={path(f.outer)} fill={fill} stroke={pal.seam} strokeWidth={pal.seamW} strokeLinejoin="round" />
              {pal.ringOn === f.type && <path d={path(f.inner)} fill="none" stroke={pal.ring} strokeWidth={pal.ringW} strokeLinejoin="round" />}
            </g>
          );
        })}
        <circle r={1} fill="url(#ballRimU)" />
        <circle r={1} fill="url(#ballGlossU)" />
      </g>
      <circle r={1} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={0.05} />
    </g>
  );
}
function BallUCL({ r = 1.55 }) { return <BallPalette id="ucl" r={r} />; }
function BallSuperLig({ r = 1.55 }) { return <BallPalette id="superlig" r={r} />; }
/* own design: a plain white ball with navy stars scattered over the sphere at
   different angles (not tied to the panel layout) */
const STAR_BALL = (() => {
  const out = [], n = 13, golden = Math.PI * (3 - Math.sqrt(5)), ax = 0.35, ay = -0.3;
  const rot = (v) => {
    const y2 = v[1] * Math.cos(ax) - v[2] * Math.sin(ax), z2 = v[1] * Math.sin(ax) + v[2] * Math.cos(ax);
    return [v[0] * Math.cos(ay) + z2 * Math.sin(ay), y2, -v[0] * Math.sin(ay) + z2 * Math.cos(ay)];
  };
  const n3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), th = i * golden;
    const p = rot([rr * Math.cos(th), y, rr * Math.sin(th)]);
    if (p[2] < -0.2) continue;
    const t1 = n3(cross(p, [0.3, 1, 0.2])), t2 = cross(p, t1), spin = i * 1.9;
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const rho = k % 2 === 0 ? 0.4 : 0.17, a = spin + (k * Math.PI) / 5;
      const q = n3([p[0] + rho * (Math.cos(a) * t1[0] + Math.sin(a) * t2[0]), p[1] + rho * (Math.cos(a) * t1[1] + Math.sin(a) * t2[1]), p[2] + rho * (Math.cos(a) * t1[2] + Math.sin(a) * t2[2])]);
      pts.push(q);
    }
    out.push({ z: p[2], pts });
  }
  return out.sort((a, b) => a.z - b.z);
})();
function BallStars({ r = 1.55 }) {
  const path = (pts) => pts.map((p, i) => { const l = Math.hypot(p[0], p[1]), k = p[2] < 0 && l > 0 ? 1 / l : 1; return `${i ? "L" : "M"}${(p[0] * k).toFixed(3)} ${(p[1] * k).toFixed(3)}`; }).join(" ") + "Z";
  return (
    <g transform={`scale(${r})`}>
      <defs>
        <clipPath id="ballClipS"><circle r={1} /></clipPath>
        <radialGradient id="ballRimS" cx="50%" cy="50%" r="50%"><stop offset="62%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.34" /></radialGradient>
        <radialGradient id="ballGlossS" cx="34%" cy="28%" r="46%"><stop offset="0%" stopColor="#fff" stopOpacity="0.7" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={0.14} cy={0.95} rx={0.95} ry={0.3} fill="#000" opacity="0.2" transform="scale(1,0.8)" />
      <circle r={1} fill="#F7F7F4" />
      <g clipPath="url(#ballClipS)">
        {STAR_BALL.map((st, i) => <path key={i} d={path(st.pts)} fill="#1B2A5E" stroke="#1B2A5E" strokeWidth={0.02} strokeLinejoin="round" />)}
        <circle r={1} fill="url(#ballRimS)" />
        <circle r={1} fill="url(#ballGlossS)" />
      </g>
      <circle r={1} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={0.05} />
    </g>
  );
}
function BallClassic({ r = 1.55 }) { return <BallImage src={CLASSIC_BALL_PNG} r={r} />; }

function BallGlyph({ style }) {
  if (style === "superlig") return <BallSuperLig />;
  if (style === "classic") return <BallClassic />;
  if (style === "stars") return <BallStars />;
  return <BallUCL />;
}

/* ---------------- brand mark ---------------- */

function BrandMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="brand-mark-svg">
      <path d="M4 14 Q4 9 9 9 H31 Q36 9 36 14 V32 Q36 37 31 37 H9 Q4 37 4 32 Z" fill="#2E7D32" />
      <rect x="4" y="5" width="32" height="28" rx="6" fill="#4CAF50" />
      <path d="M9 10 H31 L33.5 28 H6.5 Z" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinejoin="round" opacity="0.95" />
      <line x1="7.6" y1="19" x2="32.4" y2="19" stroke="#fff" strokeWidth="1" opacity="0.9" />
      <ellipse cx="20" cy="19" rx="4.2" ry="3.2" fill="none" stroke="#fff" strokeWidth="1" opacity="0.9" />
      <path d="M12 26 C15 17 21 25 28 13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M24.6 12.2 L29.8 11.2 L28.6 16.2 Z" fill="#fff" />
      <circle cx="11.5" cy="26.5" r="2.1" fill="#fff" />
      <circle cx="11.5" cy="26.5" r="0.8" fill="#4CAF50" />
    </svg>
  );
}

/* ---------------- player disc (glossy token) + kit patterns ---------------- */

function KitPattern({ design, c2, R }) {
  const f = c2;
  const bands = (n, vertical) => Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 1).map((i) => {
    const h = (2 * R) / n;
    return vertical ? <rect key={i} x={-R + i * h} y={-R} width={h} height={2 * R} fill={f} /> : <rect key={i} x={-R} y={-R + i * h} width={2 * R} height={h} fill={f} />;
  });
  switch (design) {
    case "hoops": return <g>{bands(7, false)}</g>;
    case "thinhoops": return <g>{bands(13, false)}</g>;
    case "stripes": return <g>{bands(7, true)}</g>;
    case "thinstripes": return <g>{bands(13, true)}</g>;
    case "halves": return <rect x={0} y={-R} width={R} height={2 * R} fill={f} />;
    case "halvesH": return <rect x={-R} y={0} width={2 * R} height={R} fill={f} />;
    case "quarters": return <g><rect x={0} y={-R} width={R} height={R} fill={f} /><rect x={-R} y={0} width={R} height={R} fill={f} /></g>;
    case "sash": return <rect x={-R * 1.5} y={-R * 0.34} width={R * 3} height={R * 0.68} fill={f} transform="rotate(-45)" />;
    case "band": return <rect x={-R * 0.3} y={-R} width={R * 0.6} height={2 * R} fill={f} />;
    case "cross": return <g><rect x={-R * 0.26} y={-R} width={R * 0.52} height={2 * R} fill={f} /><rect x={-R} y={-R * 0.26} width={2 * R} height={R * 0.52} fill={f} /></g>;
    case "chevron": return <path d={`M ${-R} ${-R * 0.15} L 0 ${R * 0.6} L ${R} ${-R * 0.15} L ${R} ${R * 0.28} L 0 ${R * 1.03} L ${-R} ${R * 0.28} Z`} fill={f} />;
    case "checks": {
      const n = 4, h = (2 * R) / n, out = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2 === 1) out.push(<rect key={`${i}${j}`} x={-R + i * h} y={-R + j * h} width={h} height={h} fill={f} />);
      return <g>{out}</g>;
    }
    case "diag": return <g transform="rotate(-45)">{bands(9, true)}</g>;
    case "pinstripe": return <g>{[-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((k) => <rect key={k} x={R * k - R * 0.045} y={-R} width={R * 0.09} height={2 * R} fill={f} />)}</g>;
    case "plaid": {
      const ks = [-0.74, -0.37, 0, 0.37, 0.74];
      return (
        <g>
          {ks.map((k) => <rect key={`v${k}`} x={R * k - R * 0.1} y={-R} width={R * 0.2} height={2 * R} fill={f} fillOpacity={0.9} />)}
          {ks.map((k) => <rect key={`h${k}`} x={-R} y={R * k - R * 0.1} width={2 * R} height={R * 0.2} fill={f} fillOpacity={0.9} />)}
          {ks.map((k) => <rect key={`d${k}`} x={R * k + R * 0.16} y={-R} width={R * 0.07} height={2 * R} fill="#0B1B3A" fillOpacity={0.55} />)}
          {ks.map((k) => <rect key={`e${k}`} x={-R} y={R * k + R * 0.16} width={2 * R} height={R * 0.07} fill="#0B1B3A" fillOpacity={0.55} />)}
        </g>
      );
    }
    case "wide": return (
      <g>
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <rect x={sg * R * 0.52 - R * 0.2} y={-R} width={R * 0.4} height={2 * R} fill={f} />
            <rect x={sg * R * 0.52 - R * 0.27} y={-R} width={R * 0.06} height={2 * R} fill="#0B1B3A" />
            <rect x={sg * R * 0.52 + R * 0.21} y={-R} width={R * 0.06} height={2 * R} fill="#0B1B3A" />
          </g>
        ))}
      </g>
    );
    default: return null;
  }
}

function PlayerDisc({ color, c2, design = "plain", number, vest, R = DISC_R }) {
  const rim = shade(color, -0.55);
  const plainLight = design === "plain" && isLight(color);
  const numFill = plainLight ? "#0F172A" : "#FFFFFF";
  const numStroke = plainLight ? "rgba(255,255,255,0.7)" : "rgba(8,12,20,0.85)";
  const txt = String(number == null ? "" : number).slice(0, 3);
  const fs = txt.length >= 3 ? R * 0.72 : txt.length === 2 ? R * 0.92 : R * 1.02;
  return (
    <g>
      <ellipse cx={R * 0.1} cy={R * 0.92} rx={R * 0.98} ry={R * 0.4} fill="#000" opacity="0.28" />
      <circle r={R} fill={color} />
      {design !== "plain" && <g clipPath="url(#discClip)"><KitPattern design={design} c2={c2} R={R} /></g>}
      {vest && (
        <g clipPath="url(#discClip)">
          <rect x={-R * 0.74} y={-R} width={R * 1.48} height={2 * R} fill={vest} opacity="0.5" />
          {[-0.5, -0.17, 0.17, 0.5].map((k) => <rect key={k} x={R * k - R * 0.04} y={-R} width={R * 0.08} height={2 * R} fill={shade(vest, -0.5)} opacity="0.35" />)}
          <rect x={-R * 0.74} y={-R} width={R * 0.05} height={2 * R} fill={shade(vest, -0.45)} opacity="0.7" />
          <rect x={R * 0.69} y={-R} width={R * 0.05} height={2 * R} fill={shade(vest, -0.45)} opacity="0.7" />
          <path d={`M ${-R * 0.34} ${-R} Q 0 ${-R * 0.66} ${R * 0.34} ${-R} Z`} fill="#FFFFFF" opacity="0.85" />
        </g>
      )}
      <circle r={R} fill="url(#discShade)" />
      <circle r={R} fill="none" stroke={rim} strokeWidth={0.2} />
      {txt && (
        <text y={fs * 0.355} textAnchor="middle" fontFamily="Montserrat, 'Barlow Condensed', Inter, sans-serif" fontWeight="800" fontSize={fs}
          fill={numFill} style={{ paintOrder: "stroke", stroke: numStroke, strokeWidth: R * 0.2, strokeLinejoin: "round" }}>{txt}</text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN APP                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* ACCOUNTS (Supabase) — fill these in before publishing, see KURULUM.md */
/* ------------------------------------------------------------------ */

const SITE_NAME = "Masterclass Board";

const authConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
const SESSION_KEY = "mb_session_v1";
const readSession = () => { try { return JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; } };
const writeSession = (v) => { try { if (v) window.localStorage.setItem(SESSION_KEY, JSON.stringify(v)); else window.localStorage.removeItem(SESSION_KEY); } catch (e) {} };

const REDIR = () => "?redirect_to=" + encodeURIComponent(window.location.origin + window.location.pathname);
async function sbFetch(path, { method = "GET", body, token, prefer } = {}) {
  const headers = { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json", Authorization: `Bearer ${token || SUPABASE_ANON_KEY}` };
  if (prefer) headers.Prefer = prefer;
  let res;
  try { res = await fetch(SUPABASE_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { return { ok: false, status: 0, data: null }; }
  let data = null;
  try { const t = await res.text(); data = t ? JSON.parse(t) : null; } catch (e) { data = null; }
  return { ok: res.ok, status: res.status, data };
}
const toSession = (d) => (d && d.access_token ? {
  access_token: d.access_token, refresh_token: d.refresh_token,
  expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600), user: d.user,
} : null);
const displayNameOf = (u) => (u && ((u.user_metadata && u.user_metadata.username) || (u.email ? u.email.split("@")[0] : ""))) || "";
const authErrorText = (r) => {
  const d = r.data || {};
  const code = String(d.error_code || d.code || d.error || "");
  const msg = String(d.msg || d.message || d.error_description || "").toLowerCase();
  if (r.status === 0) return "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.";
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) return "E-posta adresin henüz doğrulanmadı.";
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (code === "user_already_exists" || msg.includes("already registered")) return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.";
  if (code === "weak_password" || msg.includes("password")) return "Şifre yeterince güçlü değil (en az 8 karakter olmalı).";
  if (r.status === 429 || code.includes("rate_limit")) return "Çok sık denendi. Birkaç dakika bekleyip tekrar dene.";
  if (msg.includes("valid email") || code === "validation_failed") return "Geçerli bir e-posta adresi gir.";
  return "Bir sorun oluştu. Biraz sonra tekrar dene.";
};

export default function App() {
  const [pitchId, setPitchId] = useState("full");
  const [formationKey, setFormationKey] = useState("4-3-3");
  const [players, setPlayers] = useState([]);
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);

  const [showOpponent, setShowOpponent] = useState(false);
  const [oppFormationKey, setOppFormationKey] = useState("4-4-2");
  const [oppPlayers, setOppPlayers] = useState([]);
  const [oppColor, setOppColor] = useState(TEAM_COLORS[2]);

  const [labelMode, setLabelMode] = useState("none");
  const [zoneMode, setZoneMode] = useState("none");
  const [grassColor, setGrassColor] = useState("green");
  const [grassPattern, setGrassPattern] = useState("grid");
  const [perspective, setPerspective] = useState(true);
  const [playerScale, setPlayerScale] = useState(1);
  const [ballScale, setBallScale] = useState(1);
  const [homeKit, setHomeKit] = useState({ design: "plain", c2: "#FFFFFF" });
  const [awayKit, setAwayKit] = useState({ design: "plain", c2: "#FFFFFF" });
  const [uiTheme, setUiTheme] = useState("dark"); // app chrome theme, separate from the pitch's own chalk/turf look
  const [tool, setTool] = useState("move");
  const [drawColor, setDrawColor] = useState("#FFFFFF");
  const [strokes, setStrokes] = useState([]);
  const [texts, setTexts] = useState([]);
  const [balls, setBalls] = useState([]);
  const [ballStyle, setBallStyle] = useState("classic");
  const [logos, setLogos] = useState([]);
  const [links, setLinks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [equipPick, setEquipPick] = useState("cone_white");
  const [equipEdit, setEquipEdit] = useState(null);
  const [linkFrom, setLinkFrom] = useState(null);
  const [liveOv, setLiveOv] = useState(null); // live positions while dragging / animating
  const [playLayer, setPlayLayer] = useState(null);
  const [tokenKey, setTokenKey] = useState(0);

  const [scenes, setScenes] = useState([]);
  const [activeScene, setActiveScene] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recLabel, setRecLabel] = useState("");
  const [playSpeed, setPlaySpeed] = useState(1);
  const playSpeedRef = useRef(1);
  const scrollRef = useRef(null);
  const [scenesMsg, setScenesMsg] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [panel, setPanel] = useState(null);
  const [colorTab, setColorTab] = useState("home");
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [textEditor, setTextEditor] = useState(null);

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authEmail, setAuthEmail] = useState(""); // e-mail a verification message was sent to
  const [userEmail, setUserEmail] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [showInfo, setShowInfo] = useState(null); // null | tab id
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [toast, setToast] = useState("");
  const sessionRef = useRef(null);

  const [saveName, setSaveName] = useState("");
  const [savedList, setSavedList] = useState([]);
  const [savesBusy, setSavesBusy] = useState(false);
  const [savesMsg, setSavesMsg] = useState("");

  const svgRef = useRef(null);
  const nodeRefs = useRef({});
  const dragState = useRef(null);
  const bendRef = useRef(null);
  const [ctx, setCtx] = useState(null); // right-click / long-press menu {x, y, id, label}
  const longPress = useRef({ t: null, fired: false, sx: 0, sy: 0 });
  const toolAtDown = useRef("move"); // tool when the press began (one-shot tools switch back to move before release)
  const drawingRef = useRef(null);
  const logoFileRef = useRef(null);
  const playCancelRef = useRef(false);
  const ballRotationRef = useRef({});
  const historyRef = useRef([]);
  const lastSnapRef = useRef(null);
  const lastDrawIdRef = useRef(null);
  const restoringRef = useRef(false);
  const lastPushTimeRef = useRef(0);
  const [historyLen, setHistoryLen] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;1,600;1,700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // desktop = landscape pitch (wide screens), mobile/tablet = portrait pitch
  const [autoLandscape, setIsLandscape] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 820 : true));
  const [orientPref, setOrientPref] = useState("auto"); // auto = landscape on desktop, portrait on phones; user can force either
  const isLandscape = orientPref === "auto" ? (HIGHLIGHTS[pitchId] ? false : autoLandscape) : orientPref === "landscape"; // zoomed zones read best upright
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 820px)");
    const handler = (e) => setIsLandscape(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler); else mq.addListener(handler);
    setIsLandscape(mq.matches);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", handler); else mq.removeListener(handler); };
  }, []);
  // opening any other panel cancels a pending tool, so stray taps never add things
  useEffect(() => {
    if (panel && panel !== "draw") setTool("move");
    else if (panel === "draw" && tool === "ball") setTool("move");
  }, [panel]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => { if (tool !== "link") setLinkFrom(null); }, [tool]);

  // keyboard shortcuts (desktop convenience) — ignored while typing in a field or a modal is open
  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (showNew || editingId || textEditor || showAuth || showAccount || showInfo || recoveryToken) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); undoLast(); return; }
      if (k === "?" || (k === "/" && e.shiftKey)) { setShowShortcuts((v) => !v); return; }
      const map = { v: "move", c: "link", p: "pen", l: "line", a: "arrow", d: "darrow", b: "curve", r: "rect", f: "frect", z: "zone", t: "text", e: "eraser" };
      if (map[k]) setTool(map[k]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNew, editingId, textEditor, showAuth]);

  const cfg = PITCH_PRESETS.find((p) => p.id === pitchId);
  const grass = GRASS_COLORS.find((g) => g.id === grassColor) || GRASS_COLORS[0];
  const proj = useMemo(() => makeProjection(cfg, isLandscape, perspective, 0, HIGHLIGHTS[pitchId] || null), [pitchId, isLandscape, perspective]); // eslint-disable-line react-hooks/exhaustive-deps
  const { P, Pinv, viewBox, unit: unit0, clipPts } = proj;
  // pitch fills more of the screen; tokens are scaled back so players keep the same on-screen size
  const unit = unit0;
  const placeAttr = (x, y, k = 1) => { const q = P(x, y); return `translate(${q.x.toFixed(3)},${q.y.toFixed(3)}) scale(${(q.s * k).toFixed(4)})`; };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const setterFor = (id) => {
    if (id.startsWith("h")) return setPlayers;
    if (id.startsWith("a")) return setOppPlayers;
    if (id.startsWith("t")) return setTexts;
    if (id.startsWith("b")) return setBalls;
    if (id.startsWith("g")) return setLogos;
    if (id.startsWith("e")) return setEquipment;
    return null;
  };

  /* ---------------- drag (direct-DOM, commits on release) ---------------- */

  const isPlayerId = (id) => id[0] === "h" || id[0] === "a";
  const tapLink = (id) => {
    if (!linkFrom) { setLinkFrom(id); return; }
    if (linkFrom === id) { setLinkFrom(null); return; }
    const a = linkFrom;
    setLinks((prev) => {
      const same = (l) => (l.a === a && l.b === id) || (l.a === id && l.b === a);
      return prev.some(same) ? prev.filter((l) => !same(l)) : [...prev, { id: `l${Date.now()}`, a, b: id, color: drawColor }];
    });
    setLinkFrom(null);
  };
  const pointerToData = (evt) => { const pt = svgPoint(evt, svgRef.current); return Pinv(pt.x, pt.y); };


  /* ---------------- right-click / long-press delete menu ---------------- */

  const CTX_LABELS = { line: "Çizgi", arrow: "Ok", darrow: "Kesik Ok", pen: "Çizim", rect: "Kutu", frect: "Dolu Kutu", zone: "Bölge" };
  const hitId = (cx, cy, target) => {
    const el = target && target.closest ? target.closest("[data-tid]") : null;
    if (el) return el.getAttribute("data-tid");
    if (!svgRef.current) return null;
    const sp = svgPoint({ clientX: cx, clientY: cy }, svgRef.current);
    const p = Pinv(sp.x, sp.y);
    let best = null, bestD = 2.4;
    const consider = (id, d) => { if (d < bestD) { bestD = d; best = id; } };
    strokes.forEach((s) => {
      const [a, b] = s.points;
      if (s.tool === "pen") consider(s.id, distToPoly(p, s.points));
      else if (LINE_TOOLS.includes(s.tool)) consider(s.id, distToPoly(p, s.c ? quadPts(a, b, s.c) : [a, b]));
      else if (s.tool === "rect" || s.tool === "frect" || s.tool === "zone") {
        const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
        const edge = distToPoly(p, [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }, { x: x0, y: y0 }]);
        const inside = p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
        consider(s.id, s.tool === "zone" && inside ? Math.min(edge, 1.9) : edge);
      }
    });
    links.forEach((l) => { const a = tokenPos(l.a), b = tokenPos(l.b); if (a && b) consider(l.id, distToPoly(p, [a, b])); });
    return best;
  };
  const openCtx = (cx, cy, id) => {
    if (!id || isPlayerId(id)) return false;
    let label = "Öğe";
    if (id[0] === "s") { const st = strokes.find((q) => q.id === id); label = (st && CTX_LABELS[st.tool]) || "Çizim"; }
    else if (id[0] === "t") label = "Metin"; else if (id[0] === "b") label = "Top"; else if (id[0] === "g") label = "Logo"; else if (id[0] === "l") label = "Bağlantı"; else if (id[0] === "e") label = "Malzeme";
    setCtx({ x: cx, y: cy, id, label });
    return true;
  };
  const onSvgContext = (e) => {
    if (isPlaying) return;
    const id = hitId(e.clientX, e.clientY, e.target);
    if (openCtx(e.clientX, e.clientY, id)) e.preventDefault();
  };
  const cancelLongPress = () => { if (longPress.current.t) { clearTimeout(longPress.current.t); longPress.current.t = null; } };
  const onSvgDownCapture = (e) => {
    longPress.current.fired = false;
    cancelLongPress();
    if (e.pointerType !== "touch" || tool !== "move" || isPlaying) return;
    const { clientX: cx, clientY: cy, target } = e;
    longPress.current.sx = cx; longPress.current.sy = cy;
    longPress.current.t = setTimeout(() => {
      longPress.current.t = null;
      if (dragState.current && dragState.current.moved) return;
      if (openCtx(cx, cy, hitId(cx, cy, target))) { longPress.current.fired = true; dragState.current = null; setLiveOv(null); }
    }, 550);
  };
  useEffect(() => {
    if (!ctx) return;
    const close = (e) => { if (e && e.target && e.target.closest && e.target.closest(".ctx-menu")) return; setCtx(null); };
    const esc = (e) => { if (e.key === "Escape") setCtx(null); };
    window.addEventListener("pointerdown", close); window.addEventListener("keydown", esc); window.addEventListener("resize", close);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); window.removeEventListener("resize", close); };
  }, [ctx]);

  const onTokenDown = (evt, id) => {
    if (evt.button > 0) return; // right-click opens the delete menu instead
    toolAtDown.current = tool;
    if (tool === "eraser") { evt.stopPropagation(); eraseToken(id); return; }
    if (tool === "link") { evt.stopPropagation(); if (isPlayerId(id)) tapLink(id); return; }
    if (tool !== "move") return;
    evt.stopPropagation();
    evt.target.setPointerCapture(evt.pointerId);
    dragState.current = { id, moved: false, x: 0, y: 0 };
  };

  const onSvgMove = (evt) => {
    if (longPress.current.t && Math.hypot(evt.clientX - longPress.current.sx, evt.clientY - longPress.current.sy) > 10) cancelLongPress();
    if (dragState.current) {
      const { x, y } = pointerToData(evt);
      const gm = dragState.current.id[0] === "b" || dragState.current.id[0] === "e" ? 2.6 * (cfg.W / 68) : 0;
      const bd = HIGHLIGHTS[pitchId];
      const cx = clamp(x, 1, cfg.W - 1), cy = clamp(y, bd && bd[0] > 0 ? bd[0] + 1 : 1 - gm, bd && bd[1] < cfg.H ? bd[1] - 1 : cfg.H - 1 + gm);
      dragState.current.x = cx; dragState.current.y = cy; dragState.current.moved = true;
      const node = nodeRefs.current[dragState.current.id];
      if (node) node.setAttribute("transform", placeAttr(cx, cy, Number(node.dataset.k) || 1));
      const fnode = nodeRefs.current[dragState.current.id + "~f"];
      if (fnode) fnode.setAttribute("transform", placeAttr(cx, cy, Number(fnode.dataset.k) || 1));
      if (isPlayerId(dragState.current.id)) setLiveOv({ [dragState.current.id]: { x: cx, y: cy } });
      return;
    }
    if (bendRef.current) {
      const { x, y } = pointerToData(evt);
      const id = bendRef.current.id;
      setStrokes((prev) => prev.map((s) => (s.id === id ? { ...s, c: { x: 2 * x - 0.5 * (s.points[0].x + s.points[1].x), y: 2 * y - 0.5 * (s.points[0].y + s.points[1].y) } } : s)));
      return;
    }
    if (drawingRef.current) {
      const { x, y } = pointerToData(evt);
      const d = drawingRef.current;
      if (d.tool === "pen") {
        d.points.push({ x, y });
        setStrokes((prev) => prev.map((s) => (s.id === d.id ? { ...s, points: [...d.points] } : s)));
      } else {
        d.points[1] = { x, y };
        let c;
        if (d.curve) {
          const a = d.points[0], dx = x - a.x, dy = y - a.y;
          c = { x: (a.x + x) / 2 - dy * 0.22, y: (a.y + y) / 2 + dx * 0.22 };
        }
        setStrokes((prev) => prev.map((s) => (s.id === d.id ? { ...s, points: [d.points[0], { x, y }], ...(c ? { c } : {}) } : s)));
      }
    }
  };

  const onTokenUp = (evt, id) => {
    cancelLongPress();
    if (longPress.current.fired) { longPress.current.fired = false; dragState.current = null; setLiveOv(null); return; }
    if (toolAtDown.current !== "move") return;
    const st = dragState.current;
    if (st && st.moved) {
      const setter = setterFor(id);
      if (setter) setter((prev) => prev.map((p) => (p.id === id ? { ...p, x: st.x, y: st.y } : p)));
    } else {
      if (id.startsWith("h") || id.startsWith("a")) setEditingId(id);
      else if (id.startsWith("e")) setEquipEdit(id);
      else if (id.startsWith("t")) {
        const t = texts.find((tt) => tt.id === id);
        if (t) setTextEditor({ mode: "edit", id, x: t.x, y: t.y, content: t.content, color: t.color, size: t.size });
      }
    }
    dragState.current = null;
    setLiveOv(null);
  };

  const onSvgDown = (evt) => {
    if (evt.button > 0) return;
    toolAtDown.current = tool;
    if (tool === "link") { setLinkFrom(null); return; }
    if (tool === "move" || tool === "eraser") return;
    const { x, y } = pointerToData(evt);
    if (tool === "text") { setTextEditor({ mode: "new", id: null, x, y, content: "", color: "#F4F4F7", size: 3 }); return; }
    if (tool === "equip") { setEquipment((prev) => [...prev, { id: `e${Date.now()}`, type: equipPick, x, y, rot: 0, sc: 1 }]); setTool("move"); return; }
    if (tool === "ball") { setBalls((prev) => [...prev, { id: `b${Date.now()}`, x, y, style: ballStyle }]); setTool("move"); return; }
    if (tool === "curve") {
      // grab an existing line/arrow (its middle dot or the line itself) to bend it
      let hit = null, hitD = 3.2;
      strokes.forEach((s) => {
        if (!LINE_TOOLS.includes(s.tool)) return;
        const [a, b] = s.points, c = s.c || { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const d = Math.min(Math.hypot(x - curveMid(a, b, c).x, y - curveMid(a, b, c).y), distToPoly({ x, y }, quadPts(a, b, c)));
        if (d < hitD) { hitD = d; hit = s; }
      });
      if (hit) { bendRef.current = { id: hit.id }; return; }
    }
    const id = `s${Date.now()}`;
    const newStroke = { id, tool: tool === "curve" ? "arrow" : tool, color: drawColor, points: tool === "pen" ? [{ x, y }] : [{ x, y }, { x, y }] };
    if (tool === "curve") newStroke.curve = true;
    drawingRef.current = newStroke;
    setStrokes((prev) => [...prev, newStroke]);
  };
  const onSvgUp = () => {
    cancelLongPress();
    const d = drawingRef.current;
    drawingRef.current = null;
    bendRef.current = null;
    if (d && d.curve) {
      const [a, b] = d.points;
      if (!b || Math.hypot(b.x - a.x, b.y - a.y) < 2) setStrokes((prev) => prev.filter((s) => s.id !== d.id));
    }
    if (d && d.tool === "zone") {
      setTool("move");
      const [a, b] = d.points;
      if (!b || Math.abs(b.x - a.x) < 1.5 || Math.abs(b.y - a.y) < 1.5) setStrokes((prev) => prev.filter((s) => s.id !== d.id));
    }
  };

  const eraseToken = (id) => {
    if (id.startsWith("s")) setStrokes((prev) => prev.filter((s) => s.id !== id));
    else if (id.startsWith("t")) setTexts((prev) => prev.filter((t) => t.id !== id));
    else if (id.startsWith("b")) setBalls((prev) => prev.filter((b) => b.id !== id));
    else if (id.startsWith("g")) setLogos((prev) => prev.filter((g) => g.id !== id));
    else if (id.startsWith("l")) setLinks((prev) => prev.filter((l) => l.id !== id));
    else if (id.startsWith("e")) setEquipment((prev) => prev.filter((x) => x.id !== id));
  };

  /* ---------------- actions ---------------- */

  const applyFormation = (key) => { setFormationKey(key); setPlayers((prev) => remapFormation(prev, key, null, "h", true)); };
  const applyOppFormation = (key) => { setOppFormationKey(key); setOppPlayers((prev) => remapFormation(prev, key, null, "a", false)); };
  const toggleOpponent = () => setShowOpponent((v) => !v);
  // Takım 1 = üst yarı saha, Takım 2 = alt yarı saha; count 0 removes the team
  const setTeamSize = (team, count) => {
    if (team === 1) setPlayers((prev) => (count > 0 ? buildTeam(count, "h", true, prev) : []));
    else { setOppPlayers((prev) => (count > 0 ? buildTeam(count, "a", false, prev) : [])); setShowOpponent(count > 0); }
  };

  const createNew = (preset) => {
    setPitchId(preset.id); setPlayers([]); setOppPlayers([]); setShowOpponent(false);
    setStrokes([]); setTexts([]); setBalls([]); setLogos([]); setLinks([]); setEquipment([]); setLinkFrom(null); setZoneMode("none"); setShowNew(false);
  };

  const clearStrokes = () => { setStrokes([]); setTexts([]); setBalls([]); setLogos([]); setLinks([]); setEquipment([]); };
  const selectEquip = (id) => { setEquipPick(id); setTool("equip"); setPanel(null); };

  const selectBallStyle = (id) => { setBallStyle(id); setTool("ball"); setPanel(null); };

  const applyPreset = (preset) => {
    const stamped = preset.strokes.map((s, i) => ({ ...s, id: `s${Date.now()}_${i}`, points: s.points.map((p) => ({ ...p })) }));
    setStrokes((prev) => [...prev, ...stamped]);
    setTool("move");
    setPanel(null);
  };

  const onLogoFile = (evt) => {
    const file = evt.target.files && evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogos((prev) => [...prev, { id: `g${Date.now()}`, x: cfg.W / 2, y: cfg.H / 2, src: reader.result, size: 8 }]);
      setPanel(null);
    };
    reader.readAsDataURL(file);
    evt.target.value = "";
  };

  const exportPNG = async () => {
    try {
      const vb = svgRef.current.viewBox.baseVal;
      const s = 3840 / Math.max(vb.width, vb.height); // long side = 3840 px (4K), drawn as sharp vector
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(vb.width * s); canvas.height = Math.round(vb.height * s);
      const ctx = canvas.getContext("2d");
      await snapBoard(canvas, ctx);
      const blob = await canvasToBlob(canvas, "image/png");
      const link = document.createElement("a");
      link.download = "taktik-tahtasi.png";
      link.href = URL.createObjectURL(blob);
      link.click();
    } catch (e) { showToast && showToast("Görsel oluşturulamadı."); }
  };

  const updatePlayerField = (id, field, value) => {
    const setter = setterFor(id);
    setter((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: field === "number" ? String(value).slice(0, 3) : value } : p)));
  };

  const saveTextEditor = () => {
    if (!textEditor) return;
    if (textEditor.mode === "new") {
      if (!textEditor.content.trim()) { setTextEditor(null); return; }
      setTexts((prev) => [...prev, { id: `t${Date.now()}`, x: textEditor.x, y: textEditor.y, content: textEditor.content, color: textEditor.color, size: textEditor.size }]);
    } else {
      setTexts((prev) => prev.map((t) => (t.id === textEditor.id ? { ...t, content: textEditor.content, color: textEditor.color, size: textEditor.size } : t)));
    }
    setTextEditor(null);
  };
  const deleteTextEditor = () => {
    if (textEditor && textEditor.id) setTexts((prev) => prev.filter((t) => t.id !== textEditor.id));
    setTextEditor(null);
  };

  const allTokens = [
    ...players.map((p) => ({ ...p, color: teamColor })),
    ...(showOpponent ? oppPlayers.map((p) => ({ ...p, color: oppColor })) : []),
  ];
  const editingPlayer = allTokens.find((p) => p.id === editingId);
  const boardFill = grass.a;
  const tokenIndex = {};
  allTokens.forEach((p) => { tokenIndex[p.id] = { x: p.x, y: p.y }; });
  const tokenPos = (id) => (liveOv && liveOv[id]) || tokenIndex[id];
  const viewLinks = playLayer ? playLayer.links : links;
  const viewStrokes = playLayer ? playLayer.strokes : strokes;
  const viewTexts = playLayer ? playLayer.texts : texts;
  const linkShapes = useMemo(() => findLinkShapes(viewLinks), [viewLinks]);
  const lineShapes = useMemo(() => findLineShapes(viewStrokes), [viewStrokes]);

  /* ---------------- auth ---------------- */

  const adopt = (sess) => {
    sessionRef.current = sess; writeSession(sess);
    setUser(sess ? displayNameOf(sess.user) : null); setUserEmail(sess && sess.user ? sess.user.email || "" : "");
  };
  const getToken = async () => {
    const sess = sessionRef.current;
    if (!sess) return null;
    if (sess.expires_at - Math.floor(Date.now() / 1000) > 60) return sess.access_token;
    const r = await sbFetch("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: sess.refresh_token } });
    const next = r.ok ? toSession(r.data) : null;
    if (!next) { adopt(null); return null; }
    adopt(next);
    return next.access_token;
  };
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 5000); };

  // on load: restore the saved sign-in, or finish an e-mail link (verification / password reset)
  useEffect(() => {
    if (!authConfigured()) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (hash.includes("access_token") || hash.includes("error_description")) {
      const q = new URLSearchParams(hash);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      if (q.get("error_description")) { showToast("Bağlantı geçersiz veya süresi dolmuş. Yeni bir e-posta iste."); return; }
      const sess = { access_token: q.get("access_token"), refresh_token: q.get("refresh_token"), expires_at: Number(q.get("expires_at")) || Math.floor(Date.now() / 1000) + Number(q.get("expires_in") || 3600), user: null };
      (async () => {
        const u = await sbFetch("/auth/v1/user", { token: sess.access_token });
        if (u.ok) sess.user = u.data;
        if (q.get("type") === "recovery") { sessionRef.current = sess; setRecoveryToken(sess.access_token); }
        else { adopt(sess); showToast("E-postan doğrulandı, hoş geldin!"); }
      })();
      return;
    }
    const saved = readSession();
    if (saved) { sessionRef.current = saved; setUser(displayNameOf(saved.user)); setUserEmail(saved.user && saved.user.email ? saved.user.email : ""); getToken(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async ({ email, password }) => {
    setAuthError("");
    if (!authConfigured()) { setAuthError("Üyelik sistemi henüz etkin değil."); return; }
    if (!email.trim() || !password) { setAuthError("E-posta ve şifre gerekli."); return; }
    setAuthBusy(true);
    const r = await sbFetch("/auth/v1/token?grant_type=password", { method: "POST", body: { email: email.trim(), password } });
    setAuthBusy(false);
    const sess = r.ok ? toSession(r.data) : null;
    if (!sess) { setAuthError(authErrorText(r)); if (String((r.data || {}).error_code) === "email_not_confirmed") setAuthEmail(email.trim()); return; }
    adopt(sess); setShowAuth(false);
  };
  const doRegister = async ({ username, email, password, password2, terms }) => {
    setAuthError("");
    if (!authConfigured()) { setAuthError("Üyelik sistemi henüz etkin değil."); return; }
    if (!username.trim() || !email.trim() || !password) { setAuthError("Tüm alanları doldur."); return; }
    if (password.length < 8) { setAuthError("Şifre en az 8 karakter olmalı."); return; }
    if (password !== password2) { setAuthError("Şifreler aynı değil."); return; }
    if (!terms) { setAuthError("Devam etmek için Kullanım Şartları ve Gizlilik Politikası'nı kabul etmelisin."); return; }
    setAuthBusy(true);
    const r = await sbFetch("/auth/v1/signup" + REDIR(), { method: "POST", body: { email: email.trim(), password, data: { username: username.trim() }, gotrue_meta_security: {} } });
    setAuthBusy(false);
    if (!r.ok) { setAuthError(authErrorText(r)); return; }
    const sess = toSession(r.data);
    if (sess) { adopt(sess); setShowAuth(false); return; } // project has e-mail confirmation turned off
    setAuthEmail(email.trim()); setAuthMode("sent");
  };
  const doResend = async (email) => {
    setAuthError("");
    setAuthBusy(true);
    const r = await sbFetch("/auth/v1/resend" + REDIR(), { method: "POST", body: { type: "signup", email } });
    setAuthBusy(false);
    if (!r.ok) { setAuthError(authErrorText(r)); return; }
    setAuthEmail(email); setAuthMode("sent"); showToast("Doğrulama e-postası tekrar gönderildi.");
  };
  const doForgot = async (email) => {
    setAuthError("");
    if (!email.trim()) { setAuthError("E-posta adresini yaz."); return; }
    setAuthBusy(true);
    const r = await sbFetch("/auth/v1/recover" + REDIR(), { method: "POST", body: { email: email.trim() } });
    setAuthBusy(false);
    if (!r.ok && r.status !== 0 && r.status !== 429) { /* do not reveal whether the address exists */ }
    else if (!r.ok) { setAuthError(authErrorText(r)); return; }
    setAuthEmail(email.trim()); setAuthMode("forgotSent");
  };
  const doNewPassword = async (password) => {
    const token = recoveryToken || (await getToken());
    if (!token) return "Oturum bulunamadı, işlemi baştan yap.";
    const r = await sbFetch("/auth/v1/user", { method: "PUT", token, body: { password } });
    if (!r.ok) return authErrorText(r);
    if (recoveryToken) { const sess = sessionRef.current; if (sess) adopt({ ...sess, user: r.data || sess.user }); setRecoveryToken(null); }
    showToast("Şifren güncellendi.");
    return "";
  };
  const doLogout = async () => {
    const token = sessionRef.current ? sessionRef.current.access_token : null;
    adopt(null); setSavedList([]); setShowAccount(false);
    if (token && authConfigured()) sbFetch("/auth/v1/logout", { method: "POST", token });
  };

  /* ---------------- save / load tactics ---------------- */

  const currentState = () => ({
    pitchId, formationKey, players, teamColor, showOpponent, oppFormationKey, oppPlayers, oppColor,
    labelMode, zoneMode, grassColor, grassPattern, perspective, playerScale, ballScale, homeKit, awayKit, strokes, texts, balls, logos, links, equipment,
  });

  const applySceneState = (d) => {
    setPitchId(d.pitchId); setFormationKey(d.formationKey); setPlayers(d.players); setTeamColor(d.teamColor);
    setShowOpponent(d.showOpponent); setOppFormationKey(d.oppFormationKey); setOppPlayers(d.oppPlayers); setOppColor(d.oppColor);
    setLabelMode(d.labelMode); setZoneMode(d.zoneMode);
    setGrassColor(d.grassColor || "green"); setGrassPattern(d.grassPattern || "grid"); setPerspective(d.perspective !== false); setPlayerScale(d.playerScale || 1); setBallScale(d.ballScale || 1);
    setHomeKit(d.homeKit || { design: "plain", c2: "#FFFFFF" }); setAwayKit(d.awayKit || { design: "plain", c2: "#FFFFFF" });
    setLinks(d.links || []); setEquipment(d.equipment || []);
    setStrokes(d.strokes || []); setTexts(d.texts || []); setBalls(d.balls || []); setLogos(d.logos || []);
  };

  // generic "undo last action": the whole board state is snapshotted before
  // every change, so Ctrl+Z / the Geri Al button reverts whatever the user did
  // last (move a player, add a ball, change a colour...). Rapid bursts of
  // changes (e.g. one pen stroke = many points) are merged into one step.
  useEffect(() => {
    if (isPlaying) { lastSnapRef.current = null; return; }
    const snap = JSON.stringify(currentState());
    if (restoringRef.current) { restoringRef.current = false; lastSnapRef.current = snap; return; }
    if (lastSnapRef.current !== null && lastSnapRef.current !== snap) {
      const now = Date.now();
      // the first change of a new drawing is saved (so undo removes just that drawing);
      // the rest of the same drag is merged into it
      const drawId = drawingRef.current ? drawingRef.current.id : null;
      const inBurst = drawId ? drawId === lastDrawIdRef.current : now - lastPushTimeRef.current < 400;
      if (drawId) lastDrawIdRef.current = drawId;
      if (!inBurst) {
        historyRef.current.push(lastSnapRef.current);
        if (historyRef.current.length > 30) historyRef.current.shift();
        setHistoryLen(historyRef.current.length);
      }
      lastPushTimeRef.current = now;
    }
    lastSnapRef.current = snap;
  });

  const undoLast = () => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    setHistoryLen(historyRef.current.length);
    restoringRef.current = true;
    applySceneState(JSON.parse(prev));
  };

  const refreshSavedList = async () => {
    if (!user) return;
    setSavesBusy(true);
    const token = await getToken();
    if (token) {
      const r = await sbFetch("/rest/v1/tactics?select=name&order=updated_at.desc", { token });
      if (r.ok && Array.isArray(r.data)) setSavedList(r.data.map((x) => x.name)); else setSavesMsg("Kayıtlar yüklenemedi.");
    }
    setSavesBusy(false);
  };

  const saveTactic = async () => {
    if (!user || !saveName.trim()) return;
    setSavesBusy(true); setSavesMsg("");
    const token = await getToken();
    if (!token) { setSavesMsg("Oturumun sona erdi, tekrar giriş yap."); setSavesBusy(false); return; }
    const r = await sbFetch("/rest/v1/tactics?on_conflict=user_id,name", {
      method: "POST", token, prefer: "resolution=merge-duplicates,return=minimal",
      body: { user_id: sessionRef.current.user.id, name: saveName.trim(), data: { ...currentState(), scenes }, updated_at: new Date().toISOString() },
    });
    setSavesMsg(r.ok ? "Kaydedildi." : "Kaydedilemedi, tekrar dene.");
    if (r.ok) setSaveName("");
    await refreshSavedList();
    setSavesBusy(false);
  };

  const loadTactic = async (name) => {
    if (!user) return;
    setSavesBusy(true); setSavesMsg("");
    const token = await getToken();
    const r = token ? await sbFetch(`/rest/v1/tactics?name=eq.${encodeURIComponent(name)}&select=data`, { token }) : null;
    if (r && r.ok && r.data && r.data[0]) {
      try { const d = r.data[0].data; applySceneState(d); setScenes(Array.isArray(d.scenes) ? d.scenes : []); setActiveScene(0); setSavesMsg(`"${name}" açıldı.`); setPanel(null); }
      catch (e) { setSavesMsg("Açma sırasında hata oluştu."); }
    } else setSavesMsg("Kayıt bulunamadı.");
    setSavesBusy(false);
  };

  const deleteTactic = async (name) => {
    if (!user) return;
    setSavesBusy(true);
    const token = await getToken();
    if (token) await sbFetch(`/rest/v1/tactics?name=eq.${encodeURIComponent(name)}`, { method: "DELETE", token });
    await refreshSavedList();
    setSavesBusy(false);
  };

  useEffect(() => { if (panel === "saves" && user) refreshSavedList(); }, [panel, user]);

  /* ---------------- scenes (slides) + animation / recording ---------------- */

  const addScene = () => { setScenes((prev) => [...prev, currentState()]); setActiveScene(scenes.length); };
  const updateSceneAt = (i) => setScenes((prev) => prev.map((s, idx) => (idx === i ? currentState() : s)));
  const loadSceneAt = (i) => { applySceneState(scenes[i]); setActiveScene(i); };
  const deleteSceneAt = (i) => setScenes((prev) => prev.filter((_, idx) => idx !== i));
  const moveSceneAt = (i, dir) => setScenes((prev) => {
    const arr = [...prev]; const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return arr;
  });

  const tween = (a, b, t) => a + (b - a) * t;
  const BALL_ROLL_RADIUS = 1.55; // same radius the ball image is drawn with (metres)
  const rollDegrees = (dist) => (dist / (2 * Math.PI * BALL_ROLL_RADIUS)) * 360;
  // signed spin (degrees, as seen on screen) for a ball moving from a to b
  const rollSigned = (a, b) => {
    const A = P(a.x, a.y), B = P(b.x, b.y);
    const sdx = B.x - A.x, sdy = B.y - A.y; // movement as seen on screen
    const dir = Math.abs(sdx) >= Math.abs(sdy) ? (Math.sign(sdx) || 1) : (Math.sign(sdy) || 1);
    return rollDegrees(Math.hypot(b.x - a.x, b.y - a.y)) * dir;
  };

  const buildPairs = (from, to) => {
    const pair = (fromArr, toArr, type) => fromArr.map((p) => ({ p, target: (toArr || []).find((x) => x.id === p.id), type }));
    const pairs = [...pair(from.players, to.players, "token"), ...pair(from.oppPlayers, to.oppPlayers, "token")];
    pairs.push(...pair(from.equipment || [], to.equipment || [], "equip"));
    if (from.balls && to.balls && from.balls.length === to.balls.length) {
      from.balls.forEach((b, i) => pairs.push({ p: b, target: to.balls[i], type: "ball" }));
    }
    return pairs;
  };

  const applyPairs = (pairs, t) => {
    const ov = {};
    pairs.forEach(({ p, target, type }) => {
      if (!target) return;
      const node = nodeRefs.current[p.id];
      if (!node) return;
      // ball: fast kick, then friction slows it down (constant deceleration); players keep a steady pace
      const te = type === "ball" ? 1 - (1 - t) * (1 - t) : t;
      const x = tween(p.x, target.x, te), y = tween(p.y, target.y, te);
      node.setAttribute("transform", placeAttr(x, y, Number(node.dataset.k) || 1));
      const fnode = nodeRefs.current[p.id + "~f"];
      if (fnode) fnode.setAttribute("transform", placeAttr(x, y, Number(fnode.dataset.k) || 1));
      if (type === "ball") {
        // rolling: spin in proportion to the distance travelled (arc length / radius)
        const visual = (ballRotationRef.current[p.id] || 0) + rollSigned(p, target) * te;
        const inner = node.querySelector("[data-ball-spin]");
        if (inner) inner.setAttribute("transform", `rotate(${visual})`);
      } else {
        ov[p.id] = { x, y };
      }
    });
    setLiveOv(ov);
  };

  const tweenSegment = (from, to, baseDuration) => new Promise((resolve) => {
    const start = performance.now();
    const duration = baseDuration / playSpeedRef.current;
    const pairs = buildPairs(from, to);
    function step(now) {
      if (playCancelRef.current) { resolve(); return; }
      const t = Math.min(1, (now - start) / duration);
      applyPairs(pairs, t);
      if (t < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });

  /* ---- high-quality capture: the board is drawn as a sharp vector image at the target pixel size ---- */
  const REC_FPS = 60;
  const REC_WIDTH = 1920;
  const nextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const canvasToBlob = (c, type, q) => new Promise((res) => c.toBlob(res, type, q));
  const snapBoard = async (canvas, ctx) => {
    const clone = svgRef.current.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", canvas.width); clone.setAttribute("height", canvas.height);
    clone.style.width = canvas.width + "px"; clone.style.height = canvas.height + "px";
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.src = url;
    try { await img.decode(); } finally { URL.revokeObjectURL(url); }
    ctx.fillStyle = boardFill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // plays the pre-rendered frames back at a steady 60 fps into the recorder
  const encodeFrames = async (frames, canvas, ctx) => {
    const stream = canvas.captureStream(REC_FPS);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 24000000 } : { videoBitsPerSecond: 24000000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.start();
    const cache = new Map();
    const want = (i) => { if (i < frames.length && !cache.has(i)) cache.set(i, createImageBitmap(frames[i])); };
    const t0 = performance.now();
    let last = -1;
    while (last < frames.length - 1 && !playCancelRef.current) {
      const idx = Math.min(frames.length - 1, Math.floor(((performance.now() - t0) * REC_FPS) / 1000));
      if (idx !== last) {
        for (let j = idx; j < idx + 12; j++) want(j);
        const bm = await cache.get(idx);
        ctx.drawImage(bm, 0, 0);
        cache.forEach((_, k) => { if (k <= idx) cache.delete(k); });
        last = idx;
      }
      await new Promise((r) => requestAnimationFrame(r));
    }
    await new Promise((r) => setTimeout(r, 250));
    const stopped = new Promise((res) => { rec.onstop = res; });
    rec.stop();
    await stopped;
    return new Blob(chunks, { type: "video/webm" });
  };

  // Preferred path: WebCodecs encodes every frame with an exact timestamp, so the video is a true 60 fps
  // no matter how slow the computer is. Fallback: pre-rendered frames replayed into MediaRecorder.
  const makeSink = async (canvas, ctx) => {
    if (typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined") {
      try {
        const w = canvas.width, h = canvas.height;
        let pick = null;
        // MP4 / H.264 first (plays everywhere: phones, WhatsApp, editors); WebM only if the browser cannot encode H.264
        for (const c of [
          { codec: "avc1.64002A", kind: "mp4", mc: "avc" },
          { codec: "vp09.00.50.08", kind: "webm", mc: "V_VP9" },
          { codec: "vp8", kind: "webm", mc: "V_VP8" },
        ]) {
          const r = await VideoEncoder.isConfigSupported({ codec: c.codec, width: w, height: h, bitrate: 16000000, framerate: REC_FPS });
          if (r && r.supported) { pick = c; break; }
        }
        if (pick) {
          const muxer = pick.kind === "mp4"
            ? new Mp4Muxer({ target: new Mp4Target(), video: { codec: pick.mc, width: w, height: h }, fastStart: "in-memory" })
            : new WebmMuxer({ target: new WebmTarget(), video: { codec: pick.mc, width: w, height: h, frameRate: REC_FPS } });
          let failed = null;
          const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failed = e; } });
          enc.configure({ codec: pick.codec, width: w, height: h, bitrate: 16000000, framerate: REC_FPS });
          let n = 0;
          const push = async () => {
            if (failed) throw failed;
            while (enc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 4));
            const vf = new VideoFrame(canvas, { timestamp: Math.round((n * 1e6) / REC_FPS), duration: Math.round(1e6 / REC_FPS) });
            enc.encode(vf, { keyFrame: n % REC_FPS === 0 });
            vf.close();
            n++;
          };
          return {
            grab: async () => { await snapBoard(canvas, ctx); await push(); },
            hold: async (k) => { for (let i = 0; i < k; i++) await push(); },
            ext: pick.kind === "mp4" ? "mp4" : "webm",
            finish: async () => { await enc.flush(); if (failed) throw failed; muxer.finalize(); return new Blob([muxer.target.buffer], { type: pick.kind === "mp4" ? "video/mp4" : "video/webm" }); },
          };
        }
      } catch (e) { /* fall through to the fallback */ }
    }
    const frames = [];
    return {
      grab: async () => { await snapBoard(canvas, ctx); frames.push(await canvasToBlob(canvas, "image/jpeg", 0.93)); },
      hold: async (k) => { const f = frames[frames.length - 1]; for (let i = 0; i < k; i++) frames.push(f); },
      ext: "webm",
      finish: async () => encodeFrames(frames, canvas, ctx),
    };
  };

  const playSequence = async (record) => {
    if (scenes.length < 2 || isPlaying) return;
    playCancelRef.current = false;
    ballRotationRef.current = {};
    setIsPlaying(true);
    setPanel(null); // get the panel out of the way
    setScenesMsg("");
    applySceneState(scenes[0]);
    await new Promise((r) => setTimeout(r, 70));

    let canvas, ctx, sink = null;
    if (record) {
      try {
        if (typeof MediaRecorder === "undefined") throw new Error("no recorder");
        const vb = svgRef.current.viewBox.baseVal;
        canvas = document.createElement("canvas");
        canvas.width = REC_WIDTH;
        const h = Math.round((REC_WIDTH * vb.height) / vb.width);
        canvas.height = h + (h % 2);
        ctx = canvas.getContext("2d");
        sink = await makeSink(canvas, ctx);
        setRecLabel("Video hazırlanıyor %0");
        setIsRecording(true);
      } catch (e) {
        setScenesMsg("Bu tarayıcıda video kaydı desteklenmiyor, sadece oynatılıyor.");
        record = false;
      }
    }

    const framesPer = (ms) => Math.max(2, Math.round((ms / playSpeedRef.current / 1000) * REC_FPS));
    const totalFrames = record ? (scenes.length - 1) * framesPer(1100) : 0;
    let done = 0;

    if (record) {
      setPlayLayer({ links: scenes[0].links || [], strokes: scenes[0].strokes || [], texts: scenes[0].texts || [] });
      await nextPaint();
      await sink.grab();
      await sink.hold(17); // short still at the start
    }

    for (let i = 0; i < scenes.length - 1; i++) {
      if (playCancelRef.current) break;
      setPlayLayer({ links: scenes[i].links || [], strokes: scenes[i].strokes || [], texts: scenes[i].texts || [] });
      if (record) {
        // frame-by-frame, so the video is smooth no matter how slow the computer is
        const pairs = buildPairs(scenes[i], scenes[i + 1]);
        const n = framesPer(1100);
        for (let k = 1; k <= n; k++) {
          if (playCancelRef.current) break;
          applyPairs(pairs, k / n);
          await nextPaint();
          await sink.grab();
          done++;
          if (done % 6 === 0) setRecLabel(`Video hazırlanıyor %${Math.min(99, Math.round((done / totalFrames) * 100))}`);
        }
      } else {
        await tweenSegment(scenes[i], scenes[i + 1], 1100);
      }
      const fromS = scenes[i], toS = scenes[i + 1];
      if (fromS.balls && toS.balls && fromS.balls.length === toS.balls.length) {
        fromS.balls.forEach((bl, idx) => {
          ballRotationRef.current[bl.id] = (ballRotationRef.current[bl.id] || 0) + rollSigned(bl, toS.balls[idx]);
        });
      }
    }

    if (record) {
      if (!playCancelRef.current && sink) {
        try {
          await sink.hold(30); // short still at the end
          setRecLabel("Video tamamlanıyor…");
          const blob = await sink.finish();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "taktik-animasyon." + sink.ext;
          link.click();
          setScenesMsg("Video indirildi.");
        } catch (e) { setScenesMsg("Video oluşturulamadı."); }
      }
      setIsRecording(false);
    }

    if (!playCancelRef.current) {
      applySceneState(scenes[scenes.length - 1]);
      setActiveScene(scenes.length - 1);
    } else {
      setTokenKey((k) => k + 1); // rebuild tokens so they sit where the state says
    }
    setPlayLayer(null);
    setLiveOv(null);
    setIsPlaying(false);
  };

  const stopPlayback = () => { playCancelRef.current = true; };

  return (
    <div className="app-root" data-theme={uiTheme}>
      <style>{CSS}</style>

      <header className="header">
        <div className="brand">
          <BrandMark />
          <div className="brand-text"><span className="brand-title">MASTERCLASS BOARD</span><span className="brand-sub">Taktik Tahtası</span></div>
        </div>
        <div className="header-actions">
          {user ? (
            <button className="btn btn-ghost user-chip" data-tour="account" onClick={() => setShowAccount(true)} title="Hesabım">
              <span className="user-dot">{user.charAt(0).toUpperCase()}</span> <span className="hide-sm">{user}</span>
            </button>
          ) : (
            <button className="btn btn-ghost" data-tour="account" onClick={() => { setShowAuth(true); setAuthMode("login"); setAuthError(""); }}>
              <LogIn size={16} /> <span className="hide-sm">Giriş</span>
            </button>
          )}
          <button className="btn btn-ghost" data-tour="help" onClick={() => window.dispatchEvent(new Event("mb-tour-start"))} title="Rehber: siteyi adım adım öğren"><HelpCircle size={16} /></button>
          <button className="btn btn-ghost" data-tour="info" onClick={() => setShowInfo("about")} title="Hakkında ve yasal bilgiler"><Info size={16} /></button>
          <button className="btn btn-ghost" data-tour="theme" onClick={() => setUiTheme((t) => (t === "dark" ? "light" : "dark"))} title="Açık / Koyu tema">
            {uiTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-ghost" data-tour="undo" disabled={historyLen === 0} onClick={undoLast} title="Son işlemi geri al (Ctrl+Z)"><Undo2 size={16} /></button>
          <button className="btn btn-ghost" data-tour="new" onClick={() => setShowNew(true)}><Plus size={16} /> <span className="hide-sm">Yeni</span></button>
          <button className="btn btn-accent" data-tour="export" onClick={exportPNG}><Download size={16} /> <span className="hide-sm">Aktar</span></button>
        </div>
      </header>

      <div className="app-body">
        {/* ---------------- toolbar (left rail on desktop, bottom bar on phones) ---------------- */}
        <nav className="toolbar">
          <ToolbarButton icon={Users} label="Diziliş" active={panel === "formation"} onClick={() => setPanel(panel === "formation" ? null : "formation")} />
          <ToolbarButton icon={UserCog} label="Kadro" active={panel === "roster"} onClick={() => setPanel(panel === "roster" ? null : "roster")} />
          <ToolbarButton icon={Palette} label="Forma" active={panel === "color"} onClick={() => setPanel(panel === "color" ? null : "color")} />
          <ToolbarButton icon={Tag} label="Etiket" active={panel === "labels"} onClick={() => setPanel(panel === "labels" ? null : "labels")} />
          <ToolbarButton icon={Grid3x3} label="Saha" active={panel === "zones"} onClick={() => setPanel(panel === "zones" ? null : "zones")} />
          <ToolbarButton icon={PenTool} label="Çizim" active={panel === "draw"} onClick={() => setPanel(panel === "draw" ? null : "draw")} />
          <ToolbarButton icon={Flag} label="Malzeme" active={panel === "equip"} onClick={() => setPanel(panel === "equip" ? null : "equip")} />
          <ToolbarButton icon={CircleDot} label="Top" active={panel === "balls"} onClick={() => setPanel(panel === "balls" ? null : "balls")} />
          <ToolbarButton icon={Upload} label="Logo" active={panel === "logo"} onClick={() => setPanel(panel === "logo" ? null : "logo")} />
          <ToolbarButton icon={Layers} label="Sahneler" active={panel === "scenes"} onClick={() => setPanel(panel === "scenes" ? null : "scenes")} />
          <ToolbarButton icon={Save} label="Kayıtlar" active={panel === "saves"} onClick={() => setPanel(panel === "saves" ? null : "saves")} />
          <ToolbarButton icon={Keyboard} label="Kısayollar" active={showShortcuts} onClick={() => setShowShortcuts((v) => !v)} />
        </nav>

        <main className={`stage ${panel ? "panel-open" : ""}`} style={{ background: grass.a }}>
          {isPlaying && (
            <div className="play-bar">
              <span>{isRecording ? "● " + recLabel : "Oynatılıyor"}</span>
              <button className="chip" onClick={() => { const v = Math.max(0.25, playSpeedRef.current - 0.25); setPlaySpeed(v); playSpeedRef.current = v; }}>−</button>
              <b>{playSpeed}x</b>
              <button className="chip" onClick={() => { const v = Math.min(3, playSpeedRef.current + 0.25); setPlaySpeed(v); playSpeedRef.current = v; }}>+</button>
              <button className="chip chip-active" onClick={stopPlayback}><X size={13} /> Durdur</button>
            </div>
          )}
          <div className="pitch-scroll" ref={scrollRef}>
          <svg ref={svgRef} viewBox={viewBox} className="pitch-svg"  preserveAspectRatio="xMidYMid meet" onPointerMove={onSvgMove} onPointerDown={onSvgDown} onPointerDownCapture={onSvgDownCapture} onPointerUp={onSvgUp} onPointerLeave={onSvgUp} onContextMenu={onSvgContext}>
            <defs>
              {ARROW_COLORS.map((c) => (
                <marker key={c} id={`arrow-${c.replace("#", "")}`} viewBox="0 0 6 6" markerWidth="5.4" markerHeight="5.4" refX="4.8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L6,3 L0,6 Z" fill={c} />
                </marker>
              ))}
              <linearGradient id="discShade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="45%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.26" />
              </linearGradient>
              <clipPath id="discClip"><circle r={DISC_R} /></clipPath>
              <pattern id="netPatY" width="0.7" height="0.7" patternUnits="userSpaceOnUse">
                <rect width="0.7" height="0.7" fill="#F6D60A" fillOpacity="0.14" />
                <path d="M0 0L0.7 0.7M0.7 0L0 0.7" stroke="#F6D60A" strokeWidth="0.1" strokeOpacity="0.9" />
              </pattern>
              <pattern id="netPat" width="0.7" height="0.7" patternUnits="userSpaceOnUse">
                <rect width="0.7" height="0.7" fill="#fff" fillOpacity="0.1" />
                <path d="M0 0L0.7 0.7M0.7 0L0 0.7" stroke="#fff" strokeWidth="0.09" strokeOpacity="0.7" />
              </pattern>
              {clipPts && <clipPath id="cropClip"><polygon points={clipPts} /></clipPath>}
            </defs>

            <g clipPath={clipPts ? "url(#cropClip)" : undefined}>
            <GrassLayer proj={proj} W={cfg.W} H={cfg.H} pattern={grassPattern} a={grass.a} b={grass.b} />
            {!cfg.noLines && <PitchMarkings proj={proj} W={cfg.W} H={cfg.H} lineColor={grass.line} />}
            <ZoneOverlay proj={proj} W={cfg.W} H={cfg.H} mode={zoneMode} />

            {/* soft fill for closed 3/4-player loops, then the link lines themselves */}
            {linkShapes.map((ids) => {
              const pts = ids.map((id) => tokenPos(id)).filter(Boolean).map((p) => P(p.x, p.y));
              if (pts.length !== ids.length) return null;
              const col = (viewLinks.find((l) => ids.includes(l.a) && ids.includes(l.b)) || {}).color || "#FFFFFF";
              return <polygon key={ids.join("|")} points={pts.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ")} fill={col} fillOpacity={0.26} style={{ pointerEvents: "none" }} />;
            })}
            {lineShapes.map((sh, i) => (
              <polygon key={`ls${i}`} points={sh.pts.map((pt) => { const q = P(pt.x, pt.y); return `${q.x.toFixed(2)},${q.y.toFixed(2)}`; }).join(" ")} fill={sh.color} fillOpacity={0.26} style={{ pointerEvents: "none" }} />
            ))}
            {viewLinks.map((l) => {
              const a = tokenPos(l.a), b = tokenPos(l.b);
              if (!a || !b) return null;
              const A = P(a.x, a.y), B = P(b.x, b.y);
              return (
                <g key={l.id}>
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={l.color} strokeWidth={0.48} strokeLinecap="round" style={{ pointerEvents: "none" }} />
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="transparent" strokeWidth={2.2} strokeLinecap="round"
                    onPointerDown={(e) => { if (tool === "eraser") { e.stopPropagation(); eraseToken(l.id); } }}
                    style={{ pointerEvents: tool === "eraser" ? "stroke" : "none", cursor: "pointer" }} />
                </g>
              );
            })}

            {viewStrokes.map((s) => {
              const pp = s.points.map((pt) => P(pt.x, pt.y));
              const common = {
                stroke: s.color, strokeWidth: LINE_W, fill: "none", strokeLinecap: "round", strokeLinejoin: "round",
                onPointerDown: (e) => { e.stopPropagation(); if (tool === "eraser") eraseToken(s.id); },
                style: { cursor: tool === "eraser" ? "pointer" : "default", pointerEvents: tool === "eraser" ? "stroke" : "none" },
              };
              const corners = (a, b) => [[a.x, a.y], [b.x, a.y], [b.x, b.y], [a.x, b.y]];
              if (s.tool === "pen") return <path key={s.id} d={pp.map((q, i) => `${i === 0 ? "M" : "L"} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join(" ")} {...common} />;
              if (s.tool === "zone") {
                const [a, b] = s.points;
                const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
                const inside = (p) => p && p.x >= x0 && p.x <= x0 + w && p.y >= y0 && p.y <= y0 + h;
                const homeN = players.filter((p) => inside(tokenPos(p.id))).length;
                const awayN = showOpponent ? oppPlayers.filter((p) => inside(tokenPos(p.id))).length : 0;
                const c = P(x0 + w / 2, y0 + h / 2);
                return (
                  <g key={s.id}>
                    <polygon points={polyStr(P, corners({ x: x0, y: y0 }, { x: x0 + w, y: y0 + h }))} fill={s.color} fillOpacity={0.24}
                      stroke={s.color} strokeWidth={LINE_W} strokeDasharray="1.2 0.9" strokeLinejoin="round"
                      onPointerDown={(e) => { e.stopPropagation(); if (tool === "eraser") eraseToken(s.id); }}
                      style={{ cursor: tool === "eraser" ? "pointer" : "default", pointerEvents: tool === "eraser" ? "all" : "none" }} />
                    {(homeN > 0 || awayN > 0) && (
                      <g transform={`translate(${c.x},${c.y}) scale(${c.s})`} style={{ pointerEvents: "none" }}>
                        <text textAnchor="middle" dominantBaseline="central" fontFamily="'Barlow Condensed', Oswald, sans-serif" fontStyle="italic" fontWeight="700"
                          fontSize={Math.max(2.6, Math.min(5.2, Math.min(w, h) * 0.36))}
                          fill="#FFFFFF" style={{ paintOrder: "stroke", stroke: "rgba(8,12,20,0.7)", strokeWidth: 0.6, strokeLinejoin: "round" }}>
                          {homeN}v{awayN}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }
              if (s.tool === "frect") {
                const [a, b] = s.points;
                return <polygon key={s.id} points={polyStr(P, corners(a, b))} {...common} fill={s.color} fillOpacity={0.3} stroke="#FFFFFF" strokeWidth={LINE_W * 1.3} style={{ cursor: tool === "eraser" ? "pointer" : "default", pointerEvents: tool === "eraser" ? "all" : "none" }} />;
              }
              if (s.tool === "rect") {
                const [a, b] = s.points;
                return <polygon key={s.id} points={polyStr(P, corners(a, b))} {...common} />;
              }
              const [A, B] = pp;
              const isArrow = s.tool === "arrow" || s.tool === "darrow";
              const dashed = s.tool === "darrow" ? { strokeDasharray: "1 0.8", strokeLinecap: "butt" } : {};
              if (s.c) {
                const cp = quadPts(s.points[0], s.points[1], s.c).map((pt) => P(pt.x, pt.y));
                const m = P(curveMid(s.points[0], s.points[1], s.c).x, curveMid(s.points[0], s.points[1], s.c).y);
                return (
                  <g key={s.id}>
                    <path d={cp.map((q, i) => `${i === 0 ? "M" : "L"} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join(" ")} markerEnd={isArrow ? `url(#arrow-${s.color.replace("#", "")})` : undefined} {...common} {...dashed} />
                    {tool === "curve" && <circle cx={m.x} cy={m.y} r={0.9 * m.s} fill="#FFFFFF" fillOpacity={0.9} stroke="rgba(8,12,20,0.6)" strokeWidth={0.2} style={{ pointerEvents: "none" }} />}
                  </g>
                );
              }
              return (
                <g key={s.id}>
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} markerEnd={isArrow ? `url(#arrow-${s.color.replace("#", "")})` : undefined} {...common} {...dashed} />
                  {tool === "curve" && <circle cx={(A.x + B.x) / 2} cy={(A.y + B.y) / 2} r={0.9 * ((A.s + B.s) / 2)} fill="#FFFFFF" fillOpacity={0.9} stroke="rgba(8,12,20,0.6)" strokeWidth={0.2} style={{ pointerEvents: "none" }} />}
                </g>
              );
            })}

            {equipment.map((e) => {
              const eb = equipBase(e.type);
              const k = unit * eb * (e.sc || 1);
              return (
                <g key={e.id + tokenKey} ref={(el) => { if (el) nodeRefs.current[e.id] = el; }} transform={placeAttr(e.x, e.y, k)} data-k={k} data-tid={e.id}
                  onPointerDown={(ev) => onTokenDown(ev, e.id)} onPointerUp={(ev) => onTokenUp(ev, e.id)}
                  style={{ cursor: tool === "move" ? "grab" : tool === "eraser" ? "pointer" : "default" }}>
                  <circle r={GOAL_SPECS[e.type] ? GOAL_SPECS[e.type].w / 2 + 0.6 : 1.7 / eb} fill="rgba(255,255,255,0.001)" />
                  <EquipGlyph type={e.type} rot={e.rot || 0} ang={e.ang} part={GOAL_SPECS[e.type] ? "back" : "all"} />
                </g>
              );
            })}

            {logos.map((g) => (
              <g key={g.id + tokenKey} ref={(el) => { if (el) nodeRefs.current[g.id] = el; }} transform={placeAttr(g.x, g.y, 1)} data-k={1} data-tid={g.id}
                onPointerDown={(e) => onTokenDown(e, g.id)} onPointerUp={(e) => onTokenUp(e, g.id)}
                style={{ cursor: tool === "move" ? "grab" : tool === "eraser" ? "pointer" : "default" }}>
                <image href={g.src} x={-g.size / 2} y={-g.size / 2} width={g.size} height={g.size} preserveAspectRatio="xMidYMid meet" />
              </g>
            ))}

            {viewTexts.map((t) => (
              <g key={t.id + tokenKey} ref={(el) => { if (el) nodeRefs.current[t.id] = el; }} transform={placeAttr(t.x, t.y, 1)} data-k={1} data-tid={t.id}
                onPointerDown={(e) => onTokenDown(e, t.id)} onPointerUp={(e) => onTokenUp(e, t.id)}
                style={{ cursor: tool === "move" ? "grab" : tool === "eraser" ? "pointer" : "default" }}>
                <text textAnchor="middle" fontFamily="'Barlow Condensed', Oswald, sans-serif" fontStyle="italic" fontWeight="700" fontSize={t.size} fill={t.color} style={{ paintOrder: "stroke", stroke: "rgba(8,12,20,0.75)", strokeWidth: t.size * 0.12, strokeLinejoin: "round" }}>
                  {t.content}
                </text>
              </g>
            ))}

            {allTokens.map((p) => {
              const gk = p.role === "GK";
              const isHome = p.id[0] === "h";
              const kit = isHome ? homeKit : awayKit;
              return (
                <g key={p.id + tokenKey} ref={(el) => { if (el) nodeRefs.current[p.id] = el; }} transform={placeAttr(p.x, p.y, unit * PLAYER_BASE * playerScale)} data-k={unit * PLAYER_BASE * playerScale}
                  onPointerDown={(e) => onTokenDown(e, p.id)} onPointerUp={(e) => onTokenUp(e, p.id)}
                  style={{ cursor: tool === "move" ? "grab" : tool === "link" ? "pointer" : "default" }}>
                  <PlayerDisc color={gk ? GK_COLOR : p.color} c2={kit.c2} design={gk ? "plain" : kit.design} number={p.number} vest={p.vest} />
                  {linkFrom === p.id && <circle r={DISC_R + 0.9} fill="none" stroke="#FFFFFF" strokeWidth={0.34} strokeDasharray="0.9 0.7" />}
                  {labelMode !== "none" && (labelMode === "names" ? p.name : p.role) && (
                    <text y={DISC_R + 1.3 / PLAYER_BASE} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize={1.4 / PLAYER_BASE}
                      fill="#FFFFFF" style={{ paintOrder: "stroke", stroke: "rgba(8,12,20,0.7)", strokeWidth: 0.38 / PLAYER_BASE, strokeLinejoin: "round", pointerEvents: "none" }}>
                      {labelMode === "names" ? p.name : p.role}
                    </text>
                  )}
                </g>
              );
            })}
            {/* balls are drawn over the players, so a ball at a player's feet never disappears under the disc */}
            {balls.map((b) => (
              <g key={b.id + tokenKey} ref={(el) => { if (el) nodeRefs.current[b.id] = el; }} transform={placeAttr(b.x, b.y, unit * BALL_BASE * ballScale)} data-k={unit * BALL_BASE * ballScale} data-tid={b.id}
                onPointerDown={(e) => onTokenDown(e, b.id)} onPointerUp={(e) => onTokenUp(e, b.id)}
                style={{ cursor: tool === "move" ? "grab" : tool === "eraser" ? "pointer" : "default" }}>
                <circle r={2.4} cy={-1.5} fill="rgba(255,255,255,0.001)" />
                <ellipse cx={0.25} cy={0} rx={1.4} ry={0.5} fill="#000" opacity="0.28" />
                <g transform="translate(0,-1.45)"><g data-ball-spin="1">
                  <BallGlyph style={b.style} />
                </g></g>
              </g>
            ))}

            {/* front frames of placed goals: drawn above balls and players so they really sit inside the goal */}
            {equipment.filter((e) => GOAL_SPECS[e.type]).map((e) => {
              const k = unit * (e.sc || 1);
              return (
                <g key={e.id + "~f" + tokenKey} ref={(el) => { if (el) nodeRefs.current[e.id + "~f"] = el; }} transform={placeAttr(e.x, e.y, k)} data-k={k} style={{ pointerEvents: "none" }}>
                  <EquipGlyph type={e.type} rot={e.rot || 0} ang={e.ang} part="front" />
                </g>
              );
            })}
            {!cfg.noLines && <GoalFronts proj={proj} W={cfg.W} H={cfg.H} />}
            </g>
          </svg>
          </div>

          {/* floating quick tools */}
          <div className="quickbar">
            {DRAW_TOOLS.map((t) => (
              <button key={t.id} className={`qb ${tool === t.id ? "qb-active" : ""}`} title={t.label} onClick={() => setTool(t.id)}>
                <t.icon size={17} /><span className="qb-label">{t.label}</span>
              </button>
            ))}
            <button className={`qb ${tool === "equip" ? "qb-active" : ""}`} title="Malzeme ekle" onClick={() => setPanel(panel === "equip" ? null : "equip")}><Flag size={17} /><span className="qb-label">Malzeme</span></button>
            <button className={`qb ${tool === "ball" ? "qb-active" : ""}`} title="Top ekle" onClick={() => setPanel(panel === "balls" ? null : "balls")}><CircleDot size={17} /><span className="qb-label">Top</span></button>
            <button className="qb qb-color" title="Çizim rengi" onClick={() => setPanel(panel === "draw" ? null : "draw")}><span style={{ background: drawColor }} /></button>
          </div>
          {tool !== "move" && TOOL_HINTS[tool] && (
            <div className="tool-hint"><span>{TOOL_HINTS[tool]}</span><button onClick={() => setTool("move")}>Bitir</button></div>
          )}
        </main>
      </div>

      {panel && (
        <div className="panel-backdrop" onClick={() => setPanel(null)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head"><span>{PANEL_TITLES[panel]}</span><button className="icon-btn" onClick={() => setPanel(null)}><X size={16} /></button></div>

            {panel === "formation" && (
              <div>
                <div className="grid-list">{Object.keys(FORMATIONS).map((k) => <button key={k} className={`chip ${formationKey === k ? "chip-active" : ""}`} onClick={() => applyFormation(k)}>{k}</button>)}</div>
                <div className="panel-divider"><Shield size={14} /> <span>Rakip Takım</span></div>
                <button className="chip chip-icon chip-block" onClick={toggleOpponent}>{showOpponent ? "Rakip Takımı Kaldır" : "Rakip Takımı Ekle"}</button>
                {showOpponent && <div className="grid-list" style={{ marginTop: 8 }}>{Object.keys(FORMATIONS).map((k) => <button key={k} className={`chip ${oppFormationKey === k ? "chip-active" : ""}`} onClick={() => applyOppFormation(k)}>{k}</button>)}</div>}
              </div>
            )}

            {panel === "roster" && <RosterPanel players={players} oppPlayers={oppPlayers} showOpponent={showOpponent} setTeamSize={setTeamSize} onChange={updatePlayerField} playerScale={playerScale} setPlayerScale={setPlayerScale} ballScale={ballScale} setBallScale={setBallScale} />}

            {panel === "color" && (() => {
              const away = colorTab === "away" && showOpponent;
              const kit = away ? awayKit : homeKit, setKit = away ? setAwayKit : setHomeKit;
              const col = away ? oppColor : teamColor, setCol = away ? setOppColor : setTeamColor;
              return (
                <div>
                  {showOpponent && (
                    <div className="tab-row">
                      <button className={`tab ${!away ? "tab-active" : ""}`} onClick={() => setColorTab("home")}>Ev Sahibi</button>
                      <button className={`tab ${away ? "tab-active" : ""}`} onClick={() => setColorTab("away")}>Rakip</button>
                    </div>
                  )}
                  <div className="sec-title">Forma Deseni</div>
                  <div className="kit-grid">
                    {KIT_DESIGNS.map((d) => (
                      <button key={d.id} className={`kit-card ${kit.design === d.id ? "kit-card-active" : ""}`} onClick={() => setKit({ ...kit, design: d.id })}>
                        <svg viewBox="-2.4 -2.4 4.8 5.2" width="44" height="48"><PlayerDisc color={col} c2={kit.c2} design={d.id} number="9" /></svg>
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="sec-title">Ana Renk</div>
                  <ColorSwatches value={col} onChange={setCol} />
                  <div className="sec-title">İkinci Renk (desenli formalar için)</div>
                  <ColorSwatches value={kit.c2} onChange={(c) => setKit({ ...kit, c2: c })} />
                </div>
              );
            })()}

            {panel === "labels" && (
              <div className="option-row">
                {[{ id: "none", label: "Etiketleri Gizle" }, { id: "names", label: "İsimleri Göster" }, { id: "roles", label: "Pozisyonları Göster" }].map((o) => (
                  <button key={o.id} className={`chip ${labelMode === o.id ? "chip-active" : ""}`} onClick={() => setLabelMode(o.id)}>{o.label}</button>
                ))}
              </div>
            )}

            {panel === "zones" && (
              <div>
                <div className="sec-title">Çimen Deseni</div>
                <div className="option-row">{GRASS_PATTERNS.map((g) => <button key={g.id} className={`chip ${grassPattern === g.id ? "chip-active" : ""}`} onClick={() => setGrassPattern(g.id)}>{g.label}</button>)}</div>
                <div className="sec-title">Çimen Rengi</div>
                <div className="swatch-row swatch-wrap">
                  {GRASS_COLORS.map((g) => <button key={g.id} title={g.label} className={`swatch ${grassColor === g.id ? "swatch-active" : ""}`} style={{ background: `linear-gradient(135deg, ${g.a} 50%, ${g.b} 50%)` }} onClick={() => setGrassColor(g.id)} />)}
                </div>
                <div className="sec-title">Saha Yönü</div>
                <div className="option-row">
                  {[{ id: "auto", label: "Otomatik" }, { id: "landscape", label: "Yatay" }, { id: "portrait", label: "Dikey" }].map((o) => (
                    <button key={o.id} className={`chip ${orientPref === o.id ? "chip-active" : ""}`} onClick={() => setOrientPref(o.id)}>{o.label}</button>
                  ))}
                </div>
                <div className="sec-title">Bakış Açısı</div>
                <div className="option-row">
                  <button className={`chip ${perspective ? "chip-active" : ""}`} onClick={() => setPerspective(true)}>Perspektif (3D)</button>
                  <button className={`chip ${!perspective ? "chip-active" : ""}`} onClick={() => setPerspective(false)}>Düz (kuş bakışı)</button>
                </div>
                <div className="sec-title">Saha Tasarımı</div>
                <div className="option-row">{ZONE_MODES.map((z) => <button key={z.id} className={`chip ${zoneMode === z.id ? "chip-active" : ""}`} onClick={() => setZoneMode(z.id)}>{z.label}</button>)}</div>
              </div>
            )}

            {panel === "draw" && (
              <div className="draw-panel">
                <div className="option-row">{DRAW_TOOLS.map((t) => <button key={t.id} className={`chip chip-icon ${tool === t.id ? "chip-active" : ""}`} onClick={() => setTool(t.id)}><t.icon size={14} /> {t.label}</button>)}</div>
                <div className="swatch-row">{DRAW_COLORS.map((c) => <button key={c} className={`swatch ${drawColor === c ? "swatch-active" : ""}`} style={{ background: c }} onClick={() => setDrawColor(c)} />)}</div>
                <div className="option-row">
                  <button className="chip chip-icon" onClick={undoLast}><Undo2 size={14} /> Geri Al</button>
                  <button className="chip chip-icon" onClick={clearStrokes}><Trash2 size={14} /> Tümünü Temizle</button>
                </div>
                <p className="hint-text">Bağla aracıyla bir oyuncuya, sonra başka bir oyuncuya dokun: aralarına çizgi çekilir. Üç ya da dört oyuncu bir çevre oluşturursa içi hafifçe boyanır. Çizginin rengi yukarıdaki seçili renktir.</p>
                <p className="hint-text">Bölge aracıyla sahada bir alanı sürükleyerek seç: kesik çizgili çerçeve ve hafif boya gelir, içindeki oyunculara göre 2v1 gibi yazar. Rengi yukarıdaki renklerden seç.</p>
                <p className="hint-text">Metin eklemek için "Metin" aracını seçip sahaya dokun. Silmek için "Silgi" aracıyla üzerine dokun.</p>
                <div className="panel-divider"><Layers size={14} /> <span>Hazır Şablonlar</span></div>
                <div className="option-row">{PRESET_PATTERNS.map((p) => <button key={p.id} className="chip" onClick={() => applyPreset(p)}>{p.label}</button>)}</div>
                <p className="hint-text">Bir şablon sahaya birkaç ok/çizgi ekler, sonra istediğin gibi taşıyıp düzenleyebilirsin.</p>
              </div>
            )}

            {panel === "equip" && (
              <div>
                <div className="sec-title">Antrenman Malzemeleri ve Kale</div>
                <div className="kit-grid">
                  {EQUIP_TYPES.map((t) => (
                    <button key={t.id} className={`kit-card ${equipPick === t.id && tool === "equip" ? "kit-card-active" : ""}`} onClick={() => selectEquip(t.id)}>
                      <svg viewBox={t.vb || "-4.4 -4.4 8.8 8.8"} width="58" height="58"><EquipGlyph type={t.id} rot={0} /></svg>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
                <p className="hint-text">Birini seç, sonra sahada istediğin yere dokun. Eklediğin malzemeye dokunarak döndürebilir (kale hangi yöne baksın), büyütüp küçültebilir veya silebilirsin. Sürükleyerek taşıyabilirsin.</p>
              </div>
            )}

            {panel === "logo" && (
              <div>
                <input ref={logoFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onLogoFile} />
                <button className="btn btn-accent chip-block" onClick={() => logoFileRef.current && logoFileRef.current.click()}><Upload size={14} /> Görsel Yükle</button>
                <p className="hint-text">Kulüp logosu, forma ya da başka bir görsel yükle — sahanın ortasına eklenir, sürükleyip taşıyabilir, silgiyle kaldırabilirsin.</p>
                {logos.length > 0 && (
                  <div className="saved-list">
                    {logos.map((g, i) => (
                      <div className="saved-row" key={g.id}>
                        <span className="saved-name">Logo {i + 1}</span>
                        <div className="saved-actions">
                          <button className="icon-btn" onClick={() => setLogos((prev) => prev.map((x) => (x.id === g.id ? { ...x, size: Math.max(3, x.size - 2) } : x)))}>−</button>
                          <button className="icon-btn" onClick={() => setLogos((prev) => prev.map((x) => (x.id === g.id ? { ...x, size: Math.min(30, x.size + 2) } : x)))}>+</button>
                          <button className="icon-btn danger" onClick={() => setLogos((prev) => prev.filter((x) => x.id !== g.id))}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {panel === "scenes" && (
              <div className="saves-panel">
                <div className="option-row">
                  <button className="btn btn-accent" onClick={addScene}><Plus size={14} /> Mevcut Durumu Sahne Olarak Ekle</button>
                </div>
                <p className="hint-text">Her sahne, o anki saha düzeninin bir fotoğrafıdır. Birkaç sahne ekleyip oynat dediğinde oyuncular sırayla bir sahneden diğerine kayarak hareket eder.</p>
                <div className="saved-list">
                  {scenes.map((s, i) => (
                    <div className="saved-row" key={i}>
                      <span className="saved-name">{i === activeScene ? "● " : ""}Sahne {i + 1}</span>
                      <div className="saved-actions">
                        <button className="icon-btn" onClick={() => moveSceneAt(i, -1)}><ArrowUp size={14} /></button>
                        <button className="icon-btn" onClick={() => moveSceneAt(i, 1)}><ArrowDown size={14} /></button>
                        <button className="chip chip-icon" onClick={() => loadSceneAt(i)}>Aç</button>
                        <button className="chip chip-icon" onClick={() => updateSceneAt(i)}>Güncelle</button>
                        <button className="icon-btn danger" onClick={() => deleteSceneAt(i)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {scenes.length === 0 && <p className="hint-text">Henüz sahne yok.</p>}
                </div>
                <div className="panel-divider"><Play size={14} /> <span>Oynatma</span></div>
                <div className="roster-group-title">Oynatma / Kayıt Hızı: {playSpeed}x</div>
                <input type="range" min={0.25} max={3} step={0.25} value={playSpeed} onChange={(e) => { const v = Number(e.target.value); setPlaySpeed(v); playSpeedRef.current = v; }} style={{ width: "100%", accentColor: "var(--accent)" }} />
                <div className="option-row" style={{ marginBottom: 8 }}>
                  {[0.5, 1, 1.5, 2].map((v) => <button key={v} className={`chip ${playSpeed === v ? "chip-active" : ""}`} onClick={() => { setPlaySpeed(v); playSpeedRef.current = v; }}>{v}x</button>)}
                </div>
                <div className="option-row">
                  {!isPlaying ? (
                    <>
                      <button className="chip chip-icon" disabled={scenes.length < 2} onClick={() => playSequence(false)}><Play size={14} /> Oynat</button>
                      <button className="chip chip-icon" disabled={scenes.length < 2} onClick={() => playSequence(true)}><Video size={14} /> Oynat ve Kaydet (video)</button>
                    </>
                  ) : (
                    <button className="chip chip-icon" onClick={stopPlayback}><X size={14} /> Durdur</button>
                  )}
                </div>
                {isRecording && <p className="hint-text">Kaydediliyor… animasyon bitince video otomatik inecek.</p>}
                {scenesMsg && <p className="hint-text">{scenesMsg}</p>}
                <p className="hint-text">Not: sahneler arasında diziliş/rakip takım aynıysa oyuncular akıcı kayar; farklıysa o geçişte anında değişir.</p>
              </div>
            )}

            {panel === "balls" && (
              <div>
                <div className="ball-grid">
                  {BALL_STYLES.map((b) => (
                    <button key={b.id} className={`ball-card ${ballStyle === b.id ? "ball-card-active" : ""}`} onClick={() => selectBallStyle(b.id)}>
                      <svg viewBox="-2.2 -2.2 4.4 4.4" width="72" height="72"><BallGlyph style={b.id} /></svg>
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
                <p className="hint-text">Gerçek maç toplarının fotoğrafları adidas/UEFA/Süper Lig'e ait tescilli logolar taşıyor, o yüzden bunlar birebir fotoğraf değil — aynı renk/his ile çizdiğim özgün toplar (artı parlaklık efekti eklendi). Bir topu seçtiğinde yerleştirme aracı otomatik açılır — sahaya dokunarak ekle, silgiyle kaldır.</p>
              </div>
            )}

            {panel === "saves" && (
              <div className="saves-panel">
                {!user ? (
                  <div className="saves-locked">
                    <p>{authConfigured() ? "Taktikleri kaydetmek ve açmak için giriş yapmalısın." : "Üyelik sistemi henüz etkin değil."}</p>
                    <button className="btn btn-accent" onClick={() => { setPanel(null); setShowAuth(true); setAuthMode("login"); }}><LogIn size={14} /> Giriş Yap</button>
                  </div>
                ) : (
                  <>
                    <div className="save-row">
                      <input className="save-input" placeholder="Taktik adı" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
                      <button className="btn btn-accent" disabled={!saveName.trim() || savesBusy} onClick={saveTactic}><Save size={14} /> Kaydet</button>
                    </div>
                    {savesMsg && <p className="hint-text">{savesMsg}</p>}
                    <div className="panel-divider"><FolderOpen size={14} /> <span>Kayıtlı Taktikler</span></div>
                    {savesBusy && <p className="hint-text">Yükleniyor…</p>}
                    {!savesBusy && savedList.length === 0 && <p className="hint-text">Henüz kayıt yok.</p>}
                    <div className="saved-list">
                      {savedList.map((name) => (
                        <div className="saved-row" key={name}>
                          <span className="saved-name">{name}</span>
                          <div className="saved-actions">
                            <button className="chip chip-icon" onClick={() => loadTactic(name)}>Aç</button>
                            <button className="icon-btn danger" onClick={() => deleteTactic(name)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- new file modal ---------------- */}
      {showNew && (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Yeni Taktik Tahtası</h2>
            <p className="modal-sub">Saha tipini seçin</p>
            <div className="pitch-grid">{PITCH_PRESETS.map((p) => <button key={p.id} className="pitch-option" onClick={() => createNew(p)}><span>{p.label}</span><ChevronRight size={14} /></button>)}</div>
            <button className="btn btn-ghost modal-cancel" onClick={() => setShowNew(false)}>İptal</button>
          </div>
        </div>
      )}

      {/* ---------------- quick player edit modal ---------------- */}
      {editingPlayer && (
        <div className="modal-backdrop" onClick={() => setEditingId(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2>Oyuncuyu Düzenle</h2>
            <PlayerEditForm player={editingPlayer} onSave={(id, number, name, vest) => { updatePlayerField(id, "number", number); updatePlayerField(id, "name", name); updatePlayerField(id, "vest", vest); setEditingId(null); }} onCancel={() => setEditingId(null)} />
          </div>
        </div>
      )}

      {/* ---------------- text editor modal ---------------- */}
      {textEditor && (
        <div className="modal-backdrop" onClick={() => setTextEditor(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2>{textEditor.mode === "new" ? "Metin Ekle" : "Metni Düzenle"}</h2>
            <div className="edit-form">
              <label>Metin<input type="text" autoFocus value={textEditor.content} onChange={(e) => setTextEditor({ ...textEditor, content: e.target.value })} /></label>
              <label>Renk
                <div className="swatch-row">{TEAM_COLORS.map((c) => <button key={c} className={`swatch ${textEditor.color === c ? "swatch-active" : ""}`} style={{ background: c, border: c === "#1F2430" ? "1px solid #4B5563" : undefined }} onClick={() => setTextEditor({ ...textEditor, color: c })} />)}</div>
              </label>
              <label>Boyut
                <div className="option-row">{TEXT_SIZES.map((sz, i) => <button key={sz} className={`chip ${textEditor.size === sz ? "chip-active" : ""}`} onClick={() => setTextEditor({ ...textEditor, size: sz })}>{["S", "M", "L", "XL"][i]}</button>)}</div>
              </label>
              <div className="edit-actions">
                {textEditor.mode === "edit" && <button className="icon-btn danger" onClick={deleteTextEditor}><Trash2 size={16} /></button>}
                <div style={{ flex: 1 }} />
                <button className="btn btn-ghost" onClick={() => setTextEditor(null)}><X size={14} /> İptal</button>
                <button className="btn btn-accent" onClick={saveTextEditor}><Check size={14} /> Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- equipment editor ---------------- */}
      {equipEdit && (() => {
        const it = equipment.find((x) => x.id === equipEdit);
        if (!it) return null;
        const meta = EQUIP_TYPES.find((t) => t.id === it.type) || {};
        const upd = (patch) => setEquipment((prev) => prev.map((x) => (x.id === it.id ? { ...x, ...patch } : x)));
        const curAng = Math.round((((it.ang != null ? it.ang : (it.rot || 0) * 90) % 360) + 360) % 360);
        return (
          <div className="modal-backdrop" onClick={() => setEquipEdit(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <h2>{meta.label || "Malzeme"}</h2>
              <div className="option-row" style={{ marginTop: 10 }}>
                {meta.rot && <button className="chip chip-icon" onClick={() => upd({ ang: (curAng + 45) % 360 })}><RotateCw size={14} /> 45° Döndür</button>}
                <button className="chip chip-icon" onClick={() => upd({ sc: Math.min(2.2, (it.sc || 1) + 0.2) })}><Plus size={14} /> Büyüt</button>
                <button className="chip chip-icon" onClick={() => upd({ sc: Math.max(0.5, (it.sc || 1) - 0.2) })}><Minus size={14} /> Küçült</button>
              </div>
              {meta.rot && (
                <div style={{ marginTop: 14 }}>
                  <div className="roster-group-title">Yön: {curAng}°</div>
                  <input type="range" min={0} max={359} value={curAng} onChange={(e) => upd({ ang: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--accent)" }} />
                </div>
              )}
              <div className="edit-actions" style={{ marginTop: 16 }}>
                <button className="icon-btn danger" onClick={() => { setEquipment((prev) => prev.filter((x) => x.id !== it.id)); setEquipEdit(null); }}><Trash2 size={16} /></button>
                <div style={{ flex: 1 }} />
                <button className="btn btn-accent" onClick={() => setEquipEdit(null)}><Check size={14} /> Tamam</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ---------------- auth modal ---------------- */}
      {showAuth && <AuthModal mode={authMode} setMode={(m) => { setAuthMode(m); setAuthError(""); }} error={authError} busy={authBusy} email={authEmail} configured={authConfigured()}
        onLogin={doLogin} onRegister={doRegister} onForgot={doForgot} onResend={doResend} onInfo={(t) => setShowInfo(t)} onClose={() => setShowAuth(false)} />}
      {showAccount && <AccountModal name={user} email={userEmail} onLogout={doLogout} onNewPassword={doNewPassword} onInfo={(t) => { setShowAccount(false); setShowInfo(t); }} onClose={() => setShowAccount(false)} />}
      {recoveryToken && <NewPasswordModal onSubmit={doNewPassword} onClose={() => { setRecoveryToken(null); sessionRef.current = null; }} />}
      {showInfo && <InfoModal tab={showInfo} setTab={setShowInfo} onClose={() => setShowInfo(null)} />}
      {toast && <div className="toast">{toast}</div>}

      {/* ---------------- keyboard shortcuts modal ---------------- */}
      {ctx && (
        <div className="ctx-menu" style={{ left: Math.max(8, Math.min(ctx.x, (typeof window !== "undefined" ? window.innerWidth : 800) - 178)), top: Math.max(8, Math.min(ctx.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 96)) }}
          onContextMenu={(e) => e.preventDefault()}>
          <div className="ctx-title">{ctx.label}</div>
          <button className="ctx-item" onClick={() => { eraseToken(ctx.id); setCtx(null); }}><Trash2 size={15} /> Sil</button>
        </div>
      )}
      {showShortcuts && (
        <div className="modal-backdrop" onClick={() => setShowShortcuts(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2>Klavye Kısayolları</h2>
            <div className="shortcut-list">
              {[["V", "Taşı"], ["C", "Bağla (oyuncuları birleştir)"], ["P", "Kalem"], ["L", "Çizgi"], ["A", "Ok"], ["D", "Kesik Ok"], ["B", "Eğri Ok / çizgiyi eğ"], ["R", "Kutu"], ["Z", "Bölge"], ["T", "Metin"], ["E", "Silgi"], ["Ctrl/Cmd + Z", "Geri Al"], ["?", "Bu pencere"]].map(([k, l]) => (
                <div className="shortcut-row" key={k}><kbd>{k}</kbd><span>{l}</span></div>
              ))}
            </div>
            <p className="hint-text">Sadece bilgisayarda, bir yazı kutusuna tıklı değilken çalışır.</p>
            <button className="btn btn-ghost modal-cancel" onClick={() => setShowShortcuts(false)}>Kapat</button>
          </div>
        </div>
      )}
      <Tour />
    </div>
  );
}

const PANEL_TITLES = {
  formation: "Diziliş Seç", roster: "Kadro", color: "Forma", labels: "Etiketler",
  zones: "Saha Görünümü", equip: "Malzemeler", draw: "Çizim Aracı", balls: "Top Seç", logo: "Logo Ekle", 
  scenes: "Sahneler ve Animasyon", saves: "Kayıtlı Taktikler",
};

function ToolbarButton({ icon: Icon, label, active, onClick }) {
  return <button className={`tb-btn ${active ? "tb-btn-active" : ""}`} onClick={onClick}><Icon size={19} /><span>{label}</span></button>;
}

function ColorSwatches({ value, onChange }) {
  return (
    <div className="swatch-row swatch-wrap">
      {TEAM_COLORS.map((c) => <button key={c} className={`swatch ${value === c ? "swatch-active" : ""}`} style={{ background: c, border: c === "#1F2430" ? "1px solid #4B5563" : undefined }} onClick={() => onChange(c)} />)}
      <label className="swatch swatch-custom" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <Plus size={14} />
      </label>
    </div>
  );
}

function RosterPanel({ players, oppPlayers, showOpponent, setTeamSize, onChange, playerScale, setPlayerScale, ballScale, setBallScale }) {
  return (
    <div className="roster">
      <div className="roster-group-title">Oyuncu Boyutu: %{Math.round(playerScale * 100)}</div>
      <input type="range" min={60} max={160} step={5} value={Math.round(playerScale * 100)} onChange={(e) => setPlayerScale(Number(e.target.value) / 100)} style={{ width: "100%", accentColor: "var(--accent)" }} />
      <button className="chip" style={{ alignSelf: "flex-start" }} onClick={() => setPlayerScale(1)}>Varsayılan (%100)</button>
      <div className="roster-group-title" style={{ marginTop: 6 }}>Top Boyutu: %{Math.round(ballScale * 100)}</div>
      <input type="range" min={50} max={200} step={5} value={Math.round(ballScale * 100)} onChange={(e) => setBallScale(Number(e.target.value) / 100)} style={{ width: "100%", accentColor: "var(--accent)" }} />
      <button className="chip" style={{ alignSelf: "flex-start" }} onClick={() => setBallScale(1)}>Varsayılan (%100)</button>
      {[{ n: 1, list: players, label: "Takım 1 (üst yarı saha)" }, { n: 2, list: oppPlayers, label: "Takım 2 (alt yarı saha)" }].map((t) => (
        <div key={t.n} className="team-add">
          <div className="roster-group-title">{t.label}</div>
          <div className="option-row">
            {Array.from({ length: 11 }, (_, i) => i + 1).map((c) => (
              <button key={c} className={`chip ${t.list.length === c ? "chip-active" : ""}`} style={{ minWidth: 34 }} onClick={() => setTeamSize(t.n, c)}>{c}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, margin: "4px 0 6px" }}>{t.list.length ? `${t.list.length} oyuncu sahada (1 = sadece kaleci).` : "Oyuncu sayısını seçerek takımı sahaya ekle."}</div>
          {t.list.length > 0 && <button className="chip" onClick={() => setTeamSize(t.n, 0)}>Takımı Kaldır</button>}
        </div>
      ))}
      <div className="roster-group-title">Takım 1</div>
      {players.map((p) => (
        <div className="roster-row" key={p.id}>
          <input className="roster-num" type="text" maxLength={3} placeholder="No" value={p.number} onChange={(e) => onChange(p.id, "number", e.target.value)} />
          <input className="roster-name" type="text" placeholder="İsim" value={p.name} onChange={(e) => onChange(p.id, "name", e.target.value)} />
        </div>
      ))}
      {oppPlayers.length > 0 && (
        <>
          <div className="roster-group-title" style={{ marginTop: 10 }}>Takım 2</div>
          {oppPlayers.map((p) => (
            <div className="roster-row" key={p.id}>
              <input className="roster-num" type="text" maxLength={3} placeholder="No" value={p.number} onChange={(e) => onChange(p.id, "number", e.target.value)} />
              <input className="roster-name" type="text" placeholder="İsim" value={p.name} onChange={(e) => onChange(p.id, "name", e.target.value)} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function PlayerEditForm({ player, onSave, onCancel }) {
  const [number, setNumber] = useState(player.number);
  const [name, setName] = useState(player.name);
  const [vest, setVest] = useState(player.vest || null);
  return (
    <div className="edit-form">
      <label>Forma Numarası (en çok 3 karakter)<input type="text" maxLength={3} value={number} onChange={(e) => setNumber(e.target.value.slice(0, 3))} /></label>
      <label>İsim<input type="text" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="sec-title" style={{ marginTop: 4 }}>Yelek</div>
      <div className="option-row">
        <button className={`chip ${vest ? "chip-active" : ""}`} onClick={() => setVest(vest ? null : "#4C63C9")}>{vest ? "Yeleği Kaldır" : "Yelek Ekle"}</button>
      </div>
      {vest && <ColorSwatches value={vest} onChange={setVest} />}
      <div className="edit-actions">
        <button className="btn btn-ghost" onClick={onCancel}><X size={14} /> İptal</button>
        <button className="btn btn-accent" onClick={() => onSave(player.id, String(number).slice(0, 3), name, vest)}><Check size={14} /> Kaydet</button>
      </div>
    </div>
  );
}

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

function AuthModal({ mode, setMode, error, busy, email: sentTo, configured, onLogin, onRegister, onForgot, onResend, onInfo, onClose }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [terms, setTerms] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const err = localErr || error;
  const guard = (fn) => () => { setLocalErr(""); if (mode !== "register" || true) { if ((mode === "login" || mode === "register" || mode === "forgot") && !validEmail(email)) { setLocalErr("Geçerli bir e-posta adresi gir."); return; } } fn(); };
  const tabs = mode === "login" || mode === "register";
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        {tabs && (
          <div className="tab-row">
            <button className={`tab ${mode === "login" ? "tab-active" : ""}`} onClick={() => { setLocalErr(""); setMode("login"); }}>Giriş Yap</button>
            <button className={`tab ${mode === "register" ? "tab-active" : ""}`} onClick={() => { setLocalErr(""); setMode("register"); }}>Kayıt Ol</button>
          </div>
        )}
        {!configured && <p className="auth-error" style={{ margin: "10px 0 0" }}>Üyelik sistemi henüz etkin değil (site yöneticisi ayarları tamamlamalı).</p>}

        {mode === "sent" && (
          <div className="edit-form">
            <h3 className="auth-title">E-postanı kontrol et</h3>
            <p className="hint-text"><b>{sentTo}</b> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıklayınca hesabın açılır. Mesajı göremiyorsan gereksiz (spam) klasörüne bak.</p>
            {err && <p className="auth-error">{err}</p>}
            <div className="edit-actions">
              <button className="btn btn-ghost" disabled={busy} onClick={() => onResend(sentTo)}>Tekrar gönder</button>
              <button className="btn btn-accent" onClick={onClose}><Check size={14} /> Tamam</button>
            </div>
          </div>
        )}

        {mode === "forgotSent" && (
          <div className="edit-form">
            <h3 className="auth-title">Şifre sıfırlama</h3>
            <p className="hint-text">Bu adres kayıtlıysa <b>{sentTo}</b> adresine şifreni yenilemen için bir bağlantı gönderdik. Gelmezse gereksiz (spam) klasörüne bak.</p>
            <div className="edit-actions"><button className="btn btn-accent" onClick={() => setMode("login")}><Check size={14} /> Girişe dön</button></div>
          </div>
        )}

        {mode === "forgot" && (
          <div className="edit-form">
            <h3 className="auth-title">Şifremi unuttum</h3>
            <label>E-posta<input type="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            {err && <p className="auth-error">{err}</p>}
            <div className="edit-actions">
              <button className="btn btn-ghost" onClick={() => setMode("login")}>Geri</button>
              <button className="btn btn-accent" disabled={busy || !configured} onClick={guard(() => onForgot(email))}>Bağlantı Gönder</button>
            </div>
          </div>
        )}

        {mode === "login" && (
          <div className="edit-form">
            <label>E-posta<input type="email" autoCapitalize="none" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Şifre<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") guard(() => onLogin({ email, password }))(); }} /></label>
            {err && <p className="auth-error">{err}</p>}
            {sentTo && err && err.includes("doğrulanmadı") && <button className="auth-link" onClick={() => onResend(sentTo)}>Doğrulama e-postasını tekrar gönder</button>}
            <button className="auth-link" onClick={() => setMode("forgot")}>Şifremi unuttum</button>
            <div className="edit-actions">
              <button className="btn btn-ghost" onClick={onClose}><X size={14} /> İptal</button>
              <button className="btn btn-accent" disabled={busy || !configured} onClick={guard(() => onLogin({ email, password }))}><Check size={14} /> Giriş Yap</button>
            </div>
          </div>
        )}

        {mode === "register" && (
          <div className="edit-form">
            <label>Kullanıcı Adı<input type="text" autoCapitalize="none" maxLength={30} value={username} onChange={(e) => setUsername(e.target.value)} /></label>
            <label>E-posta<input type="email" autoCapitalize="none" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Şifre (en az 8 karakter)<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            <label>Şifre (tekrar)<input type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} /></label>
            <label className="terms-row">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span><button type="button" className="auth-link inline" onClick={() => onInfo("terms")}>Kullanım Şartları</button> ve <button type="button" className="auth-link inline" onClick={() => onInfo("privacy")}>Gizlilik Politikası</button>'nı okudum, kabul ediyorum.</span>
            </label>
            {err && <p className="auth-error">{err}</p>}
            <div className="edit-actions">
              <button className="btn btn-ghost" onClick={onClose}><X size={14} /> İptal</button>
              <button className="btn btn-accent" disabled={busy || !configured} onClick={guard(() => onRegister({ username, email, password, password2, terms }))}><Check size={14} /> Kayıt Ol</button>
            </div>
            <p className="hint-text">Kayıttan sonra e-posta adresine bir doğrulama bağlantısı göndereceğiz.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewPasswordModal({ onSubmit, onClose }) {
  const [p1, setP1] = useState(""); const [p2, setP2] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const go = async () => {
    if (p1.length < 8) { setErr("Şifre en az 8 karakter olmalı."); return; }
    if (p1 !== p2) { setErr("Şifreler aynı değil."); return; }
    setBusy(true); const e = await onSubmit(p1); setBusy(false); if (e) setErr(e);
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="edit-form">
          <h3 className="auth-title">Yeni şifre belirle</h3>
          <label>Yeni şifre<input type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} /></label>
          <label>Yeni şifre (tekrar)<input type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} /></label>
          {err && <p className="auth-error">{err}</p>}
          <div className="edit-actions">
            <button className="btn btn-ghost" onClick={onClose}>İptal</button>
            <button className="btn btn-accent" disabled={busy} onClick={go}><Check size={14} /> Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountModal({ name, email, onLogout, onNewPassword, onInfo, onClose }) {
  const [p1, setP1] = useState(""); const [p2, setP2] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const change = async () => {
    if (p1.length < 8) { setMsg("Şifre en az 8 karakter olmalı."); return; }
    if (p1 !== p2) { setMsg("Şifreler aynı değil."); return; }
    setBusy(true); const e = await onNewPassword(p1); setBusy(false);
    setMsg(e || "Şifren güncellendi."); if (!e) { setP1(""); setP2(""); }
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="edit-form">
          <h3 className="auth-title">Hesabım</h3>
          <p className="hint-text"><b>{name}</b><br />{email}</p>
          <div className="sec-title">Şifre Değiştir</div>
          <label>Yeni şifre<input type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} /></label>
          <label>Yeni şifre (tekrar)<input type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} /></label>
          {msg && <p className="hint-text">{msg}</p>}
          <button className="btn btn-ghost" disabled={busy} onClick={change}>Şifreyi Güncelle</button>
          <p className="hint-text">Hesabının ve verilerinin silinmesini istersen <b>{CONTACT_EMAIL}</b> adresine kayıtlı e-postandan yaz; <button className="auth-link inline" onClick={() => onInfo("kvkk")}>KVKK Aydınlatma Metni</button>'ne bak.</p>
          <div className="edit-actions">
            <button className="btn btn-ghost" onClick={onClose}>Kapat</button>
            <button className="btn btn-accent" onClick={onLogout}><LogOut size={14} /> Çıkış Yap</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const INFO_TABS = [
  { id: "about", label: "Hakkında" }, { id: "privacy", label: "Gizlilik" }, { id: "terms", label: "Kullanım Şartları" },
  { id: "kvkk", label: "KVKK" }, { id: "contact", label: "İletişim" },
];

function InfoModal({ tab, setTab, onClose }) {
  const P = ({ children }) => <p>{children}</p>;
  const body = {
    about: (
      <>
        <h3>{SITE_NAME}</h3>
        <P>{SITE_NAME}, antrenör ve oyuncular için ücretsiz bir futbol taktik tahtasıdır. Diziliş kurabilir, oyuncuları ve malzemeleri sürükleyebilir, ok ve çizgilerle hareketleri anlatabilir, sahneleri animasyon olarak oynatıp video olarak kaydedebilirsin.</P>
        <P>Üye olmadan kullanabilirsin. Üye olursan taktiklerini kaydedip başka cihazdan da açabilirsin.</P>
      </>
    ),
    privacy: (
      <>
        <h3>Gizlilik Politikası</h3>
        <P><b>Hangi bilgileri topluyoruz?</b> Üye olurken verdiğin e-posta adresi, kullanıcı adı ve şifren (şifre yalnızca şifrelenmiş olarak saklanır) ile kaydettiğin taktikler. Üye olmadan kullandığında senden hiçbir kişisel bilgi istenmez.</P>
        <P><b>Bu bilgileri neden kullanıyoruz?</b> Hesabını oluşturmak, e-posta adresini doğrulamak, şifreni sıfırlamak ve taktiklerini sana göstermek için. Başka hiçbir amaçla kullanmaz, satmaz ve reklam için paylaşmayız.</P>
        <P><b>Nerede saklanıyor?</b> Hesap ve taktik verileri, hizmet aldığımız bulut veritabanı sağlayıcısında (Supabase) saklanır. E-posta doğrulama mesajları bu sağlayıcı üzerinden gönderilir. Sağlayıcının sunucuları Türkiye dışında olabilir.</P>
        <P><b>Çerezler ve tarayıcı belleği.</b> Giriş yaptığında oturumunu açık tutmak için tarayıcının yerel belleğine bir oturum bilgisi yazılır; çıkış yapınca silinir. Reklam veya takip çerezi kullanmıyoruz.</P>
        <P><b>Ne kadar saklıyoruz?</b> Hesabını sildirene kadar. Silme isteği için <b>{CONTACT_EMAIL}</b> adresine yazabilirsin.</P>
        <P><b>Hakların.</b> Verilerine erişme, düzeltme ve sildirme hakkına sahipsin. Ayrıntılar için KVKK Aydınlatma Metni'ne bak.</P>
      </>
    ),
    terms: (
      <>
        <h3>Kullanım Şartları</h3>
        <P>{SITE_NAME}'i kullanarak bu şartları kabul etmiş olursun.</P>
        <P><b>1. Hizmet.</b> Site ücretsizdir ve olduğu gibi sunulur. Kesintisiz veya hatasız çalışacağını garanti etmeyiz; özellikleri değiştirebilir veya sonlandırabiliriz.</P>
        <P><b>2. Hesap.</b> Verdiğin bilgilerin doğru olması ve şifreni güvende tutman senin sorumluluğundadır. Hesabın üzerinden yapılan işlemlerden sen sorumlusun.</P>
        <P><b>3. İçerik.</b> Yüklediğin logolar, yazdığın metinler ve kaydettiğin taktikler sana aittir. Başkalarının haklarını ihlal eden veya yasa dışı içerik yüklememelisin.</P>
        <P><b>4. Yasaklı kullanım.</b> Siteyi veya diğer kullanıcıları zarara uğratacak, sistemi aşırı yoracak veya yetkisiz erişim deneyecek kullanımlar yasaktır. Bu durumda hesabı kapatma hakkımız saklıdır.</P>
        <P><b>5. Sorumluluk.</b> Sitenin kullanımından doğabilecek dolaylı zararlardan, veri kaybından sorumlu değiliz. Önemli taktiklerini ayrıca dışa aktarıp (PNG/video) saklamanı öneririz.</P>
        <P><b>6. Değişiklik.</b> Bu şartları güncelleyebiliriz; güncel hali bu sayfada yer alır.</P>
        <P><b>7. İletişim.</b> {CONTACT_EMAIL}</P>
      </>
    ),
    kvkk: (
      <>
        <h3>KVKK Aydınlatma Metni</h3>
        <P>6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi gereğince bilgilendirme:</P>
        <P><b>Veri sorumlusu:</b> {OWNER_NAME}. İletişim: {CONTACT_EMAIL}</P>
        <P><b>İşlenen veriler:</b> e-posta adresi, kullanıcı adı, şifre (şifrelenmiş), kayıtlı taktik içerikleri, oturum bilgisi.</P>
        <P><b>Amaç ve hukuki sebep:</b> Üyelik hizmetini sunmak, e-posta doğrulaması ve şifre yenileme yapmak, taktiklerini saklamak. Hukuki sebep: bir sözleşmenin kurulması ve ifasıyla doğrudan ilgili olması ve açık rızan.</P>
        <P><b>Aktarım:</b> Veriler, barındırma ve e-posta hizmeti aldığımız sağlayıcıya (Supabase) aktarılır; bu aktarım yurt dışına yapılabilir. Başka üçüncü kişilerle paylaşılmaz.</P>
        <P><b>Toplama yöntemi:</b> Üyelik formu aracılığıyla, elektronik ortamda.</P>
        <P><b>Hakların (md. 11):</b> Verinin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarar halinde tazminat talep etme. Başvuru için {CONTACT_EMAIL} adresine yazabilirsin.</P>
      </>
    ),
    contact: (
      <>
        <h3>İletişim</h3>
        <P>Soru, öneri, hata bildirimi veya hesap silme talebi için:</P>
        <P><b>{CONTACT_EMAIL}</b></P>
        <P>Hesabınla ilgili bir talepte, hesabına kayıtlı e-posta adresinden yazman işlemi hızlandırır.</P>
      </>
    ),
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tab-row info-tabs">
          {INFO_TABS.map((t) => <button key={t.id} className={`tab ${tab === t.id ? "tab-active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        <div className="legal-body">{body[tab] || body.about}</div>
        <div className="edit-actions"><button className="btn btn-accent" onClick={onClose}>Kapat</button></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CSS                                                                  */
/* ------------------------------------------------------------------ */

const CSS = `
:root{ --ink:#141313; --panel:#232222; --panel-border:#3A3838; --surface:#2D2C2C; --accent:#4CBF52; --accent-2:#68D86D; --on-accent:#0C170D; --text:#F4F4F4; --text-dim:#A6A3A3; --danger:#F0524F;
  --bar-bg:#1A1919; --glass:rgba(26,25,25,0.82); --header-h:58px; --rail-w:78px; }
.app-root[data-theme="light"]{ --ink:#E9ECE9; --panel:#FFFFFF; --panel-border:#D8DCD8; --surface:#F3F5F3; --accent:#2F9C37; --accent-2:#43B34B; --on-accent:#FFFFFF; --text:#161816; --text-dim:#667066; --danger:#D93A36;
  --bar-bg:#FFFFFF; --glass:rgba(255,255,255,0.86); }
*{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
html,body{margin:0; background:#141313;}
.app-root{ width:100%; height:100vh; height:100dvh; display:flex; flex-direction:column; overflow:hidden; background:var(--ink); color:var(--text); font-family:'Inter',sans-serif; }
.header{ flex:none; height:var(--header-h); display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 14px; background:var(--bar-bg); border-bottom:1px solid var(--panel-border); z-index:20; }
.brand{display:flex; align-items:center; gap:10px; flex-shrink:0; min-width:0;}
.brand-mark-svg{flex-shrink:0; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));}
.brand-text{display:flex; flex-direction:column; line-height:1; min-width:0;}
.brand-title{font-family:'Barlow Condensed','Oswald',sans-serif; font-style:italic; font-weight:700; font-size:21px; letter-spacing:0.4px; white-space:nowrap;}
.brand-sub{font-size:10.5px; color:var(--accent); font-weight:600; letter-spacing:0.4px; margin-top:3px;}
.header-actions{display:flex; gap:6px; align-items:center;}
.btn{display:flex; align-items:center; gap:6px; padding:9px 12px; border-radius:10px; border:1px solid var(--panel-border); background:var(--surface); color:var(--text); font-size:12.5px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; touch-action:manipulation; user-select:none; transition:transform 0.06s ease, background 0.12s ease; white-space:nowrap; flex-shrink:0;}
.btn:hover:not(:disabled){background:var(--panel-border);}
.btn:active{transform:scale(0.95);}
.btn:disabled{opacity:0.4; cursor:default;}
.btn-accent{background:var(--accent); color:var(--on-accent); border-color:var(--accent);}
.btn-accent:hover:not(:disabled){background:var(--accent-2);}
.btn-ghost{background:transparent;}
.user-chip{gap:7px;}
.user-dot{width:20px; height:20px; border-radius:50%; background:var(--accent); color:var(--on-accent); font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center;}
.app-body{flex:1; min-height:0; display:flex; flex-direction:column;}
.stage{flex:1; min-height:0; position:relative; order:1; overflow:hidden;}
.pitch-scroll{position:absolute; inset:0; overflow:hidden;}
.pitch-svg{position:relative; width:100%; height:100%; display:block; touch-action:none; user-select:none; -webkit-user-select:none;}
.toolbar{order:2; flex:none; display:flex; gap:2px; overflow-x:auto; background:var(--bar-bg); border-top:1px solid var(--panel-border); padding:6px 6px calc(6px + env(safe-area-inset-bottom)); z-index:30; scrollbar-width:none;}
.toolbar::-webkit-scrollbar{display:none;}
.tb-btn{display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background:none; border:none; color:var(--text-dim); font-size:10px; font-weight:600; padding:7px 11px; border-radius:11px; cursor:pointer; font-family:'Inter',sans-serif; flex-shrink:0; touch-action:manipulation; user-select:none; transition:transform 0.06s ease, background 0.12s ease, color 0.12s ease;}
.tb-btn:hover{color:var(--text); background:var(--surface);}
.tb-btn:active{transform:scale(0.92);}
.tb-btn-active{color:var(--accent) !important; background:var(--surface);}
.quickbar{position:absolute; top:10px; left:50%; transform:translateX(-50%); max-width:calc(100% - 16px); display:flex; gap:2px; padding:4px; border-radius:15px; background:var(--glass); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid var(--panel-border); box-shadow:0 8px 26px rgba(0,0,0,0.28); overflow-x:auto; scrollbar-width:none; z-index:6;}
.quickbar::-webkit-scrollbar{display:none;}
.qb{display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; min-width:42px; height:42px; padding:0 8px; border:none; border-radius:11px; background:transparent; color:var(--text-dim); cursor:pointer; flex-shrink:0; touch-action:manipulation; transition:background 0.12s ease, color 0.12s ease, transform 0.06s ease;}
.qb:hover{background:var(--surface); color:var(--text);}
.qb:active{transform:scale(0.92);}
.qb-active{background:var(--accent) !important; color:var(--on-accent) !important;}
.qb-label{display:none; font-size:9px; font-weight:600; line-height:1;}
.qb-color span{display:block; width:20px; height:20px; border-radius:50%; border:2px solid var(--text); box-shadow:0 0 0 2px var(--panel);}
.ctx-menu{position:fixed; z-index:60; min-width:160px; padding:6px; border-radius:12px; background:var(--panel); border:1px solid var(--panel-border); box-shadow:0 12px 34px rgba(0,0,0,0.42);}
.ctx-title{font-family:'Barlow Condensed','Oswald',sans-serif; font-style:italic; font-weight:700; font-size:12.5px; letter-spacing:0.5px; text-transform:uppercase; color:var(--text-dim); padding:4px 8px 6px;}
.ctx-item{display:flex; align-items:center; gap:8px; width:100%; border:none; background:transparent; color:#FF6B6B; font-size:14px; font-weight:700; padding:10px 10px; border-radius:9px; cursor:pointer; touch-action:manipulation;}
.ctx-item:hover{background:rgba(255,107,107,0.14);}
.play-bar{position:absolute; left:50%; bottom:14px; transform:translateX(-50%); display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:14px; background:var(--glass); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid var(--panel-border); font-size:12px; box-shadow:0 8px 26px rgba(0,0,0,0.28); z-index:8; white-space:nowrap;}
.play-bar b{min-width:34px; text-align:center;}
.auth-title{margin:2px 0 0; font-family:'Barlow Condensed',sans-serif; font-style:italic; font-weight:700; font-size:22px;}
.auth-link{background:none; border:none; padding:0; color:var(--accent); font-size:12.5px; cursor:pointer; text-align:left; text-decoration:underline;}
.auth-link.inline{display:inline; font-size:inherit;}
.terms-row{flex-direction:row !important; align-items:flex-start; gap:8px; font-size:12.5px; line-height:1.4;}
.terms-row input{width:auto; margin-top:2px;}
.info-modal{max-width:560px; width:calc(100% - 24px); max-height:86vh; display:flex; flex-direction:column; gap:10px;}
.info-tabs{flex-wrap:wrap;}
.legal-body{overflow:auto; font-size:13.5px; line-height:1.55; padding:2px 4px; max-height:60vh;}
.legal-body h3{margin:4px 0 8px; font-family:'Barlow Condensed',sans-serif; font-style:italic; font-size:22px;}
.legal-body p{margin:0 0 10px;}
.toast{position:fixed; left:50%; bottom:22px; transform:translateX(-50%); background:var(--glass); border:1px solid var(--panel-border); padding:10px 16px; border-radius:12px; font-size:13px; z-index:60; box-shadow:0 8px 26px rgba(0,0,0,0.3); backdrop-filter:blur(10px);}
.tool-hint{position:absolute; left:50%; bottom:12px; transform:translateX(-50%); max-width:calc(100% - 24px); display:flex; align-items:center; gap:10px; padding:8px 10px 8px 14px; border-radius:14px; background:var(--glass); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid var(--panel-border); font-size:12px; line-height:1.35; box-shadow:0 8px 26px rgba(0,0,0,0.28); z-index:6;}
.tool-hint button{flex:none; border:none; background:var(--accent); color:var(--on-accent); font-weight:700; font-size:11.5px; padding:6px 12px; border-radius:9px; cursor:pointer;}
.panel-backdrop{position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:40; display:flex; align-items:flex-end; justify-content:center;}
.panel{width:100%; max-width:640px; max-height:78vh; overflow-y:auto; background:var(--panel); border:1px solid var(--panel-border); border-bottom:none; border-radius:20px 20px 0 0; padding:16px; padding-bottom:calc(16px + env(safe-area-inset-bottom)); animation:slideUp 0.16s ease-out;}
@keyframes slideUp{from{transform:translateY(14px); opacity:0;} to{transform:translateY(0); opacity:1;}}
.panel-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-family:'Barlow Condensed','Oswald',sans-serif; font-style:italic; font-weight:700; font-size:21px; text-transform:uppercase; letter-spacing:0.3px; position:sticky; top:-16px; padding-top:2px; background:var(--panel); z-index:2;}
.icon-btn{background:none; border:none; color:var(--text-dim); cursor:pointer; touch-action:manipulation; transition:transform 0.06s ease; padding:4px;}
.icon-btn:hover{color:var(--text);}
.icon-btn:active{transform:scale(0.9);}
.icon-btn.danger{color:var(--danger);}
.sec-title{font-family:'Barlow Condensed','Oswald',sans-serif; font-style:italic; font-weight:700; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text); margin:16px 0 8px;}
.sec-title:first-child{margin-top:4px;}
.grid-list{display:grid; grid-template-columns:repeat(3,1fr); gap:8px;}
.option-row{display:flex; flex-wrap:wrap; gap:8px;}
.chip{padding:9px 13px; border-radius:10px; border:1px solid var(--panel-border); background:var(--surface); color:var(--text); font-size:13px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; touch-action:manipulation; user-select:none; transition:transform 0.06s ease, background 0.12s ease;}
.chip:hover:not(:disabled){background:var(--panel-border);}
.chip:disabled{opacity:0.4;}
.chip:active{transform:scale(0.95);}
.chip-icon{display:flex; align-items:center; gap:6px;}
.chip-block{width:100%; justify-content:center; margin-top:4px;}
.chip-active, .chip-active:hover{background:var(--accent) !important; color:var(--on-accent); border-color:var(--accent);}
.panel-divider{display:flex; align-items:center; gap:6px; margin-top:14px; padding-top:12px; border-top:1px solid var(--panel-border); font-size:12.5px; color:var(--text-dim); font-weight:600;}
.swatch-row{display:flex; gap:10px; margin:8px 0; flex-wrap:wrap;}
.swatch{width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.14); cursor:pointer; flex-shrink:0; touch-action:manipulation; transition:transform 0.06s ease;}
.swatch:active{transform:scale(0.9);}
.swatch-active{border-color:var(--text); box-shadow:0 0 0 2px var(--accent);}
.swatch-custom{position:relative; display:flex; align-items:center; justify-content:center; color:#0A0F1E; border:2px dashed var(--panel-border); overflow:hidden;}
.swatch-custom input{position:absolute; inset:0; opacity:0; cursor:pointer;}
.tab-row{display:flex; gap:6px; margin-bottom:10px;}
.tab{flex:1; padding:9px; border-radius:10px; border:1px solid var(--panel-border); background:var(--surface); color:var(--text-dim); font-weight:600; font-size:12.5px; cursor:pointer; touch-action:manipulation; font-family:'Inter',sans-serif;}
.tab-active{background:var(--accent); color:var(--on-accent); border-color:var(--accent);}
.draw-panel{display:flex; flex-direction:column; gap:4px;}
.hint-text{font-size:11.5px; color:var(--text-dim); margin:8px 0 0; line-height:1.5;}
.kit-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(82px,1fr)); gap:8px;}
.kit-card{display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 4px 6px; background:var(--surface); border:1px solid var(--panel-border); border-radius:12px; cursor:pointer; touch-action:manipulation; color:var(--text); transition:transform 0.06s ease;}
.kit-card:active{transform:scale(0.95);}
.kit-card span{font-size:10.5px; font-weight:600; text-align:center; line-height:1.15;}
.kit-card-active{border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) inset;}
.ball-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(104px,1fr)); gap:10px;}
.ball-card{display:flex; flex-direction:column; align-items:center; gap:8px; padding:14px 8px; background:var(--surface); border:1px solid var(--panel-border); border-radius:14px; cursor:pointer; touch-action:manipulation; transition:transform 0.06s ease; color:var(--text);}
.ball-card:active{transform:scale(0.96);}
.ball-card span{font-size:11.5px; font-weight:600; text-align:center;}
.ball-card-active{border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) inset;}
.roster{display:flex; flex-direction:column; gap:8px; max-height:56vh; overflow-y:auto;}
.roster-group-title{font-family:'Barlow Condensed','Oswald',sans-serif; font-style:italic; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-dim); margin-bottom:2px;}
.roster-row{display:flex; gap:8px;}
.roster-num{width:58px; background:var(--surface); border:1px solid var(--panel-border); border-radius:9px; padding:8px; color:var(--text); font-size:14px; font-weight:700; font-family:'Barlow Condensed','Oswald',sans-serif;}
.roster-name{flex:1; background:var(--surface); border:1px solid var(--panel-border); border-radius:9px; padding:8px 10px; color:var(--text); font-size:13px; font-family:'Inter',sans-serif;}
.saves-panel{display:flex; flex-direction:column;}
.saves-locked{display:flex; flex-direction:column; gap:10px; align-items:flex-start;}
.save-row{display:flex; gap:8px;}
.save-input{flex:1; background:var(--surface); border:1px solid var(--panel-border); border-radius:9px; padding:9px 10px; color:var(--text); font-size:13px; font-family:'Inter',sans-serif;}
.saved-list{display:flex; flex-direction:column; gap:6px; margin-top:8px;}
.saved-row{display:flex; align-items:center; justify-content:space-between; background:var(--surface); border:1px solid var(--panel-border); border-radius:10px; padding:8px 10px;}
.saved-name{font-size:13px; font-weight:600;}
.saved-actions{display:flex; align-items:center; gap:10px;}
.modal-backdrop{position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:50; display:flex; align-items:center; justify-content:center; padding:20px;}
.modal{width:100%; max-width:400px; max-height:85vh; overflow-y:auto; background:var(--panel); border:1px solid var(--panel-border); border-radius:18px; padding:20px; box-shadow:0 24px 70px rgba(0,0,0,0.5);}
.modal-sm{max-width:320px;}
.modal h2{font-family:'Barlow Condensed','Oswald',sans-serif; font-style:italic; font-weight:700; text-transform:uppercase; font-size:24px; margin:0 0 4px; letter-spacing:0.3px;}
.modal-sub{color:var(--text-dim); font-size:12px; margin:0 0 14px;}
.pitch-grid{display:flex; flex-direction:column; gap:8px; max-height:50vh; overflow-y:auto;}
.pitch-option{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background:var(--surface); border:1px solid var(--panel-border); border-radius:11px; color:var(--text); font-size:13px; font-weight:600; cursor:pointer; touch-action:manipulation;}
.pitch-option:hover{border-color:var(--accent);}
.modal-cancel{width:100%; justify-content:center; margin-top:14px;}
.edit-form{display:flex; flex-direction:column; gap:12px;}
.edit-form label{display:flex; flex-direction:column; gap:5px; font-size:12px; color:var(--text-dim); font-weight:600;}
.edit-form input{background:var(--surface); border:1px solid var(--panel-border); border-radius:9px; padding:9px 10px; color:var(--text); font-size:14px; font-family:'Inter',sans-serif;}
.edit-actions{display:flex; gap:8px; align-items:center; justify-content:flex-end; margin-top:4px;}
.auth-error{color:var(--danger); font-size:12px; margin:0;}
.shortcut-list{display:flex; flex-direction:column; gap:8px; margin:12px 0;}
.shortcut-row{display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:13px;}
.shortcut-row kbd{background:var(--surface); border:1px solid var(--panel-border); border-bottom-width:2px; border-radius:7px; padding:3px 9px; font-family:'Barlow Condensed','Oswald',sans-serif; font-weight:700; font-size:13px; color:var(--accent);}
@media (max-width: 560px){ .hide-sm{display:none;} .header{padding:0 8px; gap:6px;} .brand{gap:0; flex-shrink:1;} .brand-text{display:none;} .header-actions{gap:3px; flex:1; min-width:0; justify-content:flex-end;} .header-actions .btn{padding:9px 8px; gap:4px;} }
@media (max-width: 350px){ .header-actions .btn{padding:9px 6px;} .header-actions{gap:2px;} }
@media (min-width: 820px){
  .app-body{flex-direction:row;}
  .toolbar{order:0; flex-direction:column; width:var(--rail-w); overflow-x:hidden; overflow-y:auto; border-top:none; border-right:1px solid var(--panel-border); padding:10px 6px; gap:4px; justify-content:flex-start;}
  .tb-btn{width:100%; padding:10px 4px;}
  .qb{min-width:54px; padding:0 8px;}
  .qb-label{display:block;}
  .qb-color{min-width:46px;}
  .stage.panel-open .quickbar{left:calc(370px + (100% - 370px) / 2); max-width:calc(100% - 386px);}
  .panel-backdrop{background:transparent; pointer-events:none; inset:auto; top:calc(var(--header-h) + 10px); left:calc(var(--rail-w) + 10px); bottom:10px; align-items:flex-start; justify-content:flex-start;}
  .panel{pointer-events:auto; width:350px; max-width:350px; max-height:100%; border-bottom:1px solid var(--panel-border); border-radius:18px; box-shadow:0 22px 60px rgba(0,0,0,0.5); animation:popIn 0.16s ease-out;}
  @keyframes popIn{from{transform:translateX(-8px); opacity:0;} to{transform:translateX(0); opacity:1;}}
}
`;
