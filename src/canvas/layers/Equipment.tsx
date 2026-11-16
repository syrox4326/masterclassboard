import React from "react";
import { CONE_COLORS, DUMMY_COLORS, GOAL_SPECS } from "../../model/constants";
import type { EquipType } from "../../model/types";
import { shade } from "../../lib/color";
import { GoalLocal } from "./Goal";

/* Training equipment, drawn for the camera the pitch is seen through.
   Origin = the point where the object touches the grass. Anything that stands
   (mannequins, poles, flags, cones) stays exactly vertical; anything that lies
   on the grass (ladder, hoop, footprints) is squashed by `sq`, the same
   foreshortening the pitch has, and turned by `ang` on the ground plane. */

type GlyphProps = { sq: number; ang?: number; part?: "all" | "back" | "front" };

const id = (s: string) => s.replace(/[^a-z0-9]/gi, "");

// horizontal light → dark shading for round bodies (cones, poles, mannequins)
function Cyl({ gid, c }: { gid: string; c: string }) {
  return (
    <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={shade(c, 0.32)} />
      <stop offset="0.38" stopColor={c} />
      <stop offset="1" stopColor={shade(c, -0.34)} />
    </linearGradient>
  );
}

const Shadow = ({ rx, ry, dx = 0.18, op = 0.24 }: { rx: number; ry: number; dx?: number; op?: number }) => (
  <ellipse cx={dx} cy={ry * 0.25} rx={rx} ry={ry} fill="#000" opacity={op} />
);

// flat training disc ("şapka")
function Saucer({ c, sq }: { c: string; sq: number }) {
  const R = 1.45, r = 0.6, h = 0.62, g = `eqS${id(c)}`;
  const dk = shade(c, -0.4);
  return (
    <g>
      <defs><Cyl gid={g} c={c} /></defs>
      <Shadow rx={R * 1.1} ry={R * sq * 1.1} />
      <ellipse cy={0.06} rx={R} ry={R * sq} fill={dk} />
      <path d={`M ${-R} 0 L ${-r} ${-h} A ${r} ${r * sq} 0 0 1 ${r} ${-h} L ${R} 0 A ${R} ${R * sq} 0 0 1 ${-R} 0 Z`} fill={`url(#${g})`} stroke={dk} strokeWidth={0.05} strokeLinejoin="round" />
      <ellipse cy={-h} rx={r} ry={r * sq} fill={shade(c, 0.18)} stroke={dk} strokeWidth={0.04} />
      <ellipse cy={-h + 0.02} rx={r * 0.46} ry={r * 0.46 * sq} fill={shade(c, -0.5)} />
      <path d={`M ${-R * 0.82} ${-0.1} A ${R * 0.82} ${R * 0.82 * sq} 0 0 0 ${-R * 0.25} ${R * 0.8 * sq - 0.08}`} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={0.08} strokeLinecap="round" />
    </g>
  );
}

// tall traffic cone with a reflective band
function TallCone({ sq }: { sq: number }) {
  const c = "#F28C28", g = "eqTall", dk = shade(c, -0.4);
  const H = 3.3, b = 0.98, t = 0.13;
  const wAt = (y: number) => b - ((b - t) * (y - 0.08)) / (H - 0.08);
  const band = (y1: number, y2: number) => {
    const w1 = wAt(y1), w2 = wAt(y2);
    return `M ${-w1} ${-y1} A ${w1} ${w1 * sq} 0 0 0 ${w1} ${-y1} L ${w2} ${-y2} A ${w2} ${w2 * sq} 0 0 1 ${-w2} ${-y2} Z`;
  };
  return (
    <g>
      <defs><Cyl gid={g} c={c} /></defs>
      <Shadow rx={1.5} ry={1.5 * sq} />
      <ellipse cy={0.08} rx={1.25} ry={1.25 * sq} fill={shade(c, -0.55)} />
      <ellipse cy={-0.04} rx={1.25} ry={1.25 * sq} fill={shade(c, -0.25)} />
      <path d={`M ${-b} -0.08 L ${-t} ${-H} A ${t} ${t * sq} 0 0 1 ${t} ${-H} L ${b} -0.08 A ${b} ${b * sq} 0 0 1 ${-b} -0.08 Z`} fill={`url(#${g})`} stroke={dk} strokeWidth={0.05} strokeLinejoin="round" />
      <path d={band(1.15, 1.75)} fill="#F4F6F8" />
      <path d={band(2.25, 2.6)} fill="#F4F6F8" opacity={0.92} />
    </g>
  );
}

function Flag({ sq }: { sq: number }) {
  const c = "#F2552C";
  return (
    <g>
      <Shadow rx={0.75} ry={0.75 * sq} />
      <ellipse rx={0.42} ry={0.42 * sq} fill="#3B3F46" />
      <rect x={-0.08} y={-4.4} width={0.16} height={4.4} rx={0.08} fill="#E9EBEE" stroke="#8C939C" strokeWidth={0.03} />
      <path d="M 0.08 -4.3 C 0.75 -4.62 1.35 -3.98 2.25 -4.24 L 2.25 -2.96 C 1.35 -2.7 0.75 -3.34 0.08 -3.02 Z" fill={c} stroke={shade(c, -0.35)} strokeWidth={0.04} strokeLinejoin="round" />
      <path d="M 0.08 -3.66 C 0.75 -3.98 1.35 -3.34 2.25 -3.6 L 2.25 -2.96 C 1.35 -2.7 0.75 -3.34 0.08 -3.02 Z" fill={shade(c, -0.18)} />
      <circle cy={-4.44} r={0.14} fill="#F6C90A" />
    </g>
  );
}

function Pole({ sq }: { sq: number }) {
  const c = "#F6C90A", g = "eqPole";
  return (
    <g>
      <defs><Cyl gid={g} c={c} /></defs>
      <Shadow rx={0.95} ry={0.95 * sq} />
      <ellipse cy={0.08} rx={0.82} ry={0.82 * sq} fill="#25282D" />
      <ellipse cy={-0.06} rx={0.82} ry={0.82 * sq} fill="#3D4148" />
      <rect x={-0.13} y={-5} width={0.26} height={5} rx={0.13} fill={`url(#${g})`} stroke={shade(c, -0.45)} strokeWidth={0.03} />
      {[-4.1, -3.3].map((y) => <rect key={y} x={-0.13} y={y} width={0.26} height={0.32} fill="#1E2227" />)}
      <ellipse cy={-5} rx={0.13} ry={0.13 * sq} fill={shade(c, 0.4)} />
    </g>
  );
}

function Ring({ sq }: { sq: number }) {
  const c = "#F28C28", R = 1.55;
  return (
    <g>
      <ellipse cx={0.14} cy={0.12} rx={R} ry={R * sq} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={0.42} />
      <ellipse rx={R} ry={R * sq} fill="rgba(255,255,255,0.001)" stroke={shade(c, -0.25)} strokeWidth={0.38} />
      <ellipse cy={-0.04} rx={R} ry={R * sq} fill="none" stroke={c} strokeWidth={0.26} />
      <path d={`M ${-R} -0.06 A ${R} ${R * sq} 0 0 1 ${-R * 0.2} ${-R * sq - 0.05}`} fill="none" stroke="#FFD0A0" strokeWidth={0.07} strokeLinecap="round" />
    </g>
  );
}

// projection of a ground point (local metres) turned by the item's angle
const ground = (ang: number, sq: number) => {
  const th = (ang * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  return (x: number, y: number) => ({ x: x * c - y * s, y: (x * s + y * c) * sq });
};
const path = (ps: { x: number; y: number }[]) => ps.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(" ");

function Ladder({ sq, ang = 0 }: { sq: number; ang?: number }) {
  const g = ground(ang, sq), L = 3.6, w = 0.85;
  const rungs = Array.from({ length: 9 }, (_, i) => -L + (i * 2 * L) / 8);
  return (
    <g strokeLinecap="round">
      <path d={path([g(-w - 0.15, -L - 0.1), g(w + 0.15, -L - 0.1), g(w + 0.15, L + 0.1), g(-w - 0.15, L + 0.1)]) + "Z"} fill="#000" opacity={0.12} transform="translate(0.12,0.1)" />
      {rungs.map((y) => <path key={y} d={path([g(-w, y), g(w, y)])} stroke="#B38F00" strokeWidth={0.3} transform="translate(0,0.05)" />)}
      {rungs.map((y) => <path key={`r${y}`} d={path([g(-w, y), g(w, y)])} stroke="#F6C90A" strokeWidth={0.24} />)}
      {[-w, w].map((x) => <path key={x} d={path([g(x, -L), g(x, L)])} stroke="#22262B" strokeWidth={0.14} />)}
    </g>
  );
}

function Hurdle({ sq, ang = 0 }: { sq: number; ang?: number }) {
  const g = ground(ang, sq), w = 1.3, h = 1.15, d = 0.42;
  const c = "#F6C90A", dk = shade(c, -0.42);
  const L = g(-w, 0), R = g(w, 0);
  const up = (p: { x: number; y: number }) => ({ x: p.x, y: p.y - h });
  const tube = (ps: { x: number; y: number }[], sw: number, col: string) => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={path(ps)} stroke={dk} strokeWidth={sw + 0.08} />
      <path d={path(ps)} stroke={col} strokeWidth={sw} />
    </g>
  );
  return (
    <g>
      <path d={path([g(-w - 0.2, -d), g(w + 0.2, -d), g(w + 0.2, d), g(-w - 0.2, d)]) + "Z"} fill="#000" opacity={0.16} />
      {tube([g(-w, -d), g(-w, d)], 0.16, shade(c, -0.15))}
      {tube([g(w, -d), g(w, d)], 0.16, shade(c, -0.15))}
      {tube([L, up(L)], 0.16, c)}
      {tube([R, up(R)], 0.16, c)}
      {tube([up(L), up(R)], 0.24, c)}
      <path d={path([up(L), up(R)])} stroke="#fff" strokeOpacity={0.5} strokeWidth={0.06} transform="translate(0,-0.06)" />
    </g>
  );
}

// free-kick mannequin: front-facing, perfectly upright, on a weighted base
function Dummy({ c, sq }: { c: string; sq: number }) {
  const g = `eqD${id(c)}`, dk = shade(c, -0.42), lt = shade(c, 0.4);
  const body = "M -0.62 -1.55 Q -0.74 -1.56 -0.76 -1.74 L -1.0 -3.86 Q -1.08 -4.5 -0.5 -4.6 L -0.26 -4.66 L 0.26 -4.66 L 0.5 -4.6 Q 1.08 -4.5 1.0 -3.86 L 0.76 -1.74 Q 0.74 -1.56 0.62 -1.55 Z";
  return (
    <g>
      <defs>
        <Cyl gid={g} c={c} />
        <linearGradient id="eqMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C9CED4" /><stop offset="0.5" stopColor="#8E959D" /><stop offset="1" stopColor="#5D646C" />
        </linearGradient>
      </defs>
      <Shadow rx={1.3} ry={1.3 * sq} />
      <ellipse cy={0.08} rx={1.08} ry={1.08 * sq} fill="#22252A" />
      <ellipse cy={-0.06} rx={1.08} ry={1.08 * sq} fill="#3A3E45" />
      <rect x={-0.12} y={-1.7} width={0.24} height={1.66} fill="url(#eqMetal)" />
      <path d={body} fill={`url(#${g})`} stroke={dk} strokeWidth={0.06} strokeLinejoin="round" />
      <path d="M -0.66 -3.95 Q -0.72 -4.36 -0.38 -4.44" fill="none" stroke={lt} strokeOpacity={0.8} strokeWidth={0.1} strokeLinecap="round" />
      <path d="M -0.82 -2.7 L 0.82 -2.7" stroke={dk} strokeOpacity={0.35} strokeWidth={0.05} />
      <rect x={-0.17} y={-4.9} width={0.34} height={0.28} fill={shade(c, -0.2)} />
      <circle cy={-5.28} r={0.46} fill={`url(#${g})`} stroke={dk} strokeWidth={0.06} />
      <circle cx={-0.16} cy={-5.44} r={0.12} fill="#fff" opacity={0.45} />
    </g>
  );
}

// a wall of four mannequins standing side by side along the item's angle
function Wall({ sq, ang = 0 }: { sq: number; ang?: number }) {
  const g = ground(ang, sq);
  const c = DUMMY_COLORS.dummy_yellow as string;
  const spots = [-3.2, -1.07, 1.07, 3.2].map((x) => g(x, 0)).sort((a, b) => a.y - b.y);
  return (
    <g>
      {spots.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(3)},${p.y.toFixed(3)}) scale(0.9)`}><Dummy c={c} sq={sq} /></g>
      ))}
    </g>
  );
}

export const EquipGlyph = React.memo(function EquipGlyph({ type, sq, ang = 0, part = "all" }: GlyphProps & { type: EquipType }) {
  const cone = CONE_COLORS[type];
  if (cone) return <Saucer c={cone} sq={sq} />;
  const dummy = DUMMY_COLORS[type];
  if (dummy) return <Dummy c={dummy} sq={sq} />;
  const goal = GOAL_SPECS[type];
  if (goal) return <GoalLocal w={goal.w} d={goal.d} ang={ang} sq={sq} part={part} />;
  switch (type) {
    case "cone_tall": return <TallCone sq={sq} />;
    case "flag": return <Flag sq={sq} />;
    case "pole": return <Pole sq={sq} />;
    case "ring": return <Ring sq={sq} />;
    case "ladder": return <Ladder sq={sq} ang={ang} />;
    case "hurdle": return <Hurdle sq={sq} ang={ang} />;
    case "wall": return <Wall sq={sq} ang={ang} />;
    default: return null;
  }
});

// view box that frames each item in a picker tile
export const EQUIP_THUMB_VB: Partial<Record<EquipType, string>> = {
  goal: "-4.4 -3.6 8.8 6", goal5: "-3.2 -2.7 6.4 4.4", mini: "-2 -1.6 4 2.8",
  cone_tall: "-2 -3.7 4 4.6", flag: "-1.2 -4.9 4 5.6", pole: "-1.6 -5.4 3.2 6.2",
  dummy_yellow: "-1.8 -6 3.6 6.8", dummy_blue: "-1.8 -6 3.6 6.8", dummy_red: "-1.8 -6 3.6 6.8",
  wall: "-5 -5.8 10 6.8", ladder: "-4.1 -1.6 8.2 3.2", hurdle: "-1.9 -1.9 3.8 2.8", ring: "-2 -1.4 4 2.6",
};
export const equipThumbVB = (t: EquipType) => EQUIP_THUMB_VB[t] || "-2 -1.6 4 2.6";
// how a thumbnail shows rotatable items: the ladder runs across the tile, goals face the viewer
export const EQUIP_THUMB_ANG: Partial<Record<EquipType, number>> = { ladder: 90, goal: -18, goal5: -18, mini: -18, hurdle: -12, wall: -10 };
