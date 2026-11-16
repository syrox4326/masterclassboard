import React from "react";
import type { BallStyle } from "../../model/types";

/* Balls are real 3D geometry, not pictures: a truncated icosahedron (the 32-panel
   football) projected and shaded. During playback a rotation matrix is applied so the
   pattern really tumbles in the direction of travel. Colour schemes are original and
   carry no league, club or maker marks. */

export type Mat3 = number[][];
type V3 = [number, number, number];

const matVec = (M: Mat3, v: V3): V3 => [
  M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
  M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
  M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
];
export const matMul = (A: Mat3, B: Mat3): Mat3 => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
// rotation by `th` about the in-plane axis (ax, ay, 0)
export const rotAxis = (ax: number, ay: number, th: number): Mat3 => {
  const c = Math.cos(th), s = Math.sin(th), t = 1 - c, x = ax, y = ay, z = 0;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
};

const n3 = (v: number[]): V3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: number[], b: number[]): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

type Face = { idx: number; type: "p" | "h"; z: number; outer: V3[]; inner: V3[] };

const ballGeometry = (() => {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const cyc = (a: number, b: number, c: number) => [[a, b, c], [c, a, b], [b, c, a]];
  const signs = (v: number[]) => {
    const out: number[][] = [];
    [1, -1].forEach((x) => [1, -1].forEach((y) => [1, -1].forEach((z) => out.push([v[0] * x, v[1] * y, v[2] * z]))));
    return out;
  };
  const key = (q: number[]) => q.map((t) => Math.round(t * 1000)).join(",");
  const seen = new Set<string>(), verts: V3[] = [];
  [[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, 2 * PHI + 1]].forEach(([a, b, c]) =>
    cyc(a, b, c).forEach((p) => signs(p).forEach((q) => { const k = key(q); if (!seen.has(k)) { seen.add(k); verts.push(n3(q)); } })));
  const uniq = (arr: number[][]) => { const m = new Set<string>(), out: number[][] = []; arr.forEach((q) => { const k = key(q); if (!m.has(k)) { m.add(k); out.push(q); } }); return out; };
  const pentC = uniq(cyc(0, 1, PHI).flatMap(signs)).map(n3);
  const hexC = uniq([...signs([1, 1, 1]), ...cyc(1 / PHI, 0, PHI).flatMap(signs)]).map(n3);
  const faces: { idx: number; type: "p" | "h"; c: V3; ring: V3[] }[] = [];
  const build = (c: V3, k: number, type: "p" | "h") => {
    const near = verts.map((v) => ({ v, d: dot(v, c) })).sort((p, q) => q.d - p.d).slice(0, k).map((o) => o.v);
    const u = n3(cross(c, Math.abs(c[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0])), w = cross(c, u);
    near.sort((p, q) => Math.atan2(dot(p, w), dot(p, u)) - Math.atan2(dot(q, w), dot(q, u)));
    faces.push({ idx: faces.length, type, c, ring: near });
  };
  pentC.forEach((c) => build(c, 5, "p"));
  hexC.forEach((c) => build(c, 6, "h"));
  // a hexagon faces the camera, tilted slightly so the ball reads as round
  const h0 = n3([1, 1, 1]), e1 = n3(cross(h0, [0, 0, 1])), e2 = cross(h0, e1);
  const ax = 0.28, ay = -0.22;
  const view = (v: V3): V3 => {
    const x = dot(v, e1), y = dot(v, e2), z = dot(v, h0);
    const y2 = y * Math.cos(ax) - z * Math.sin(ax), z2 = y * Math.sin(ax) + z * Math.cos(ax);
    const x2 = x * Math.cos(ay) + z2 * Math.sin(ay), z3 = -x * Math.sin(ay) + z2 * Math.cos(ay);
    return [x2, y2, z3];
  };
  const edgePts = (ring: V3[], scale: number, c: V3, vw: (v: V3) => V3) => {
    const out: V3[] = [];
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length];
      for (let t = 0; t < 6; t++) {
        const f = t / 6;
        let p = n3([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
        if (scale !== 1) p = n3([c[0] + (p[0] - c[0]) * scale, c[1] + (p[1] - c[1]) * scale, c[2] + (p[2] - c[2]) * scale]);
        out.push(vw(p));
      }
    });
    return out;
  };
  return (R: Mat3 | null): Face[] => {
    const vw = R ? (v: V3) => matVec(R, view(v)) : view;
    return faces
      .map((f) => ({ idx: f.idx, type: f.type, z: vw(f.c)[2], outer: edgePts(f.ring, 1, f.c, vw), inner: edgePts(f.ring, 0.74, f.c, vw) }))
      .filter((f) => f.z > -0.3)
      .sort((a, b) => a.z - b.z);
  };
})();
const BALL_STILL = ballGeometry(null);

type Palette = { hex: string[]; pent: string[]; seam: string; seamW: number; ring: string; ringW: number; ringOn: "p" | "h" | "none" };
const PALETTES: Record<Exclude<BallStyle, "stars">, Palette> = {
  ucl: { hex: ["#F6F3EA", "#EAF1F8"], pent: ["#2F8FE0"], seam: "#C9A24B", seamW: 0.045, ring: "#1F2B4D", ringW: 0.03, ringOn: "p" },
  classic: { hex: ["#FBFBF8"], pent: ["#15171D"], seam: "#9CA3AB", seamW: 0.035, ring: "#000", ringW: 0, ringOn: "none" },
  superlig: { hex: ["#FFFFFF"], pent: ["#E5333F", "#17191F"], seam: "#17191F", seamW: 0.03, ring: "#8BC3E8", ringW: 0.04, ringOn: "h" },
};

// points behind the horizon are pushed onto the rim so panels wrap around the edge
const spherePath = (pts: V3[]) =>
  pts.map((p, i) => { const l = Math.hypot(p[0], p[1]), k = p[2] < 0 && l > 0 ? 1 / l : 1; return `${i ? "L" : "M"}${(p[0] * k).toFixed(3)} ${(p[1] * k).toFixed(3)}`; }).join(" ") + "Z";

function paletteMarkup(style: Exclude<BallStyle, "stars">, R: Mat3 | null): string {
  const pal = PALETTES[style];
  const geo = R ? ballGeometry(R) : BALL_STILL;
  return geo.map((f) => {
    const fill = f.type === "p" ? pal.pent[f.idx % pal.pent.length] : pal.hex[f.idx % pal.hex.length];
    let out = `<path d="${spherePath(f.outer)}" fill="${fill}" stroke="${pal.seam}" stroke-width="${pal.seamW}" stroke-linejoin="round"/>`;
    if (pal.ringOn === f.type) out += `<path d="${spherePath(f.inner)}" fill="none" stroke="${pal.ring}" stroke-width="${pal.ringW}" stroke-linejoin="round"/>`;
    return out;
  }).join("");
}

// white ball with navy stars spread over the sphere (golden-angle spiral)
const starGeometry = (R: Mat3 | null) => {
  const out: { z: number; pts: V3[] }[] = [], n = 13, golden = Math.PI * (3 - Math.sqrt(5)), ax = 0.35, ay = -0.3;
  const rot = (v: V3): V3 => {
    const y2 = v[1] * Math.cos(ax) - v[2] * Math.sin(ax), z2 = v[1] * Math.sin(ax) + v[2] * Math.cos(ax);
    return [v[0] * Math.cos(ay) + z2 * Math.sin(ay), y2, -v[0] * Math.sin(ay) + z2 * Math.cos(ay)];
  };
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), th = i * golden;
    const p0 = rot([rr * Math.cos(th), y, rr * Math.sin(th)]), p = R ? matVec(R, p0) : p0;
    if (p[2] < -0.2) continue;
    const t1 = n3(cross(p, [0.3, 1, 0.2])), t2 = cross(p, t1), spin = i * 1.9;
    const pts: V3[] = [];
    for (let k = 0; k < 10; k++) {
      const rho = k % 2 === 0 ? 0.4 : 0.17, a = spin + (k * Math.PI) / 5;
      pts.push(n3([p[0] + rho * (Math.cos(a) * t1[0] + Math.sin(a) * t2[0]), p[1] + rho * (Math.cos(a) * t1[1] + Math.sin(a) * t2[1]), p[2] + rho * (Math.cos(a) * t1[2] + Math.sin(a) * t2[2])]));
    }
    out.push({ z: p[2], pts });
  }
  return out.sort((a, b) => a.z - b.z);
};
const STARS_STILL = starGeometry(null);
const starsMarkup = (R: Mat3 | null) =>
  (R ? starGeometry(R) : STARS_STILL).map((st) => `<path d="${spherePath(st.pts)}" fill="#1B2A5E" stroke="#1B2A5E" stroke-width="0.02" stroke-linejoin="round"/>`).join("");

export const ballFacesMarkup = (style: BallStyle, R: Mat3 | null) => (style === "stars" ? starsMarkup(R) : paletteMarkup(style, R));

/* One ball, radius 1 local unit scaled by r. data-ball-faces lets playback redraw the
   panels in place each frame without re-rendering React. */
export const BallGlyph = React.memo(function BallGlyph({ style, r = 1.55, rot = null }: { style: BallStyle; r?: number; rot?: Mat3 | null }) {
  const base = style === "stars" ? "#F7F7F4" : PALETTES[style].hex[0];
  return (
    <g transform={`scale(${r})`}>
      <ellipse cx={0.14} cy={0.95} rx={0.95} ry={0.3} fill="#000" opacity={0.2} transform="scale(1,0.8)" />
      <circle r={1} fill={base} />
      <g clipPath="url(#ballClip)">
        <g data-ball-faces={style} dangerouslySetInnerHTML={{ __html: ballFacesMarkup(style, rot) }} />
        <circle r={1} fill="url(#ballRim)" />
        <circle r={1} fill="url(#ballGloss)" />
      </g>
      <circle r={1} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={0.05} />
    </g>
  );
});

// shared defs used by every ball; rendered once inside each <svg> that shows balls
export function BallDefs() {
  return (
    <>
      <clipPath id="ballClip"><circle r={1} /></clipPath>
      <radialGradient id="ballRim" cx="50%" cy="50%" r="50%"><stop offset="62%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.36" /></radialGradient>
      <radialGradient id="ballGloss" cx="34%" cy="28%" r="46%"><stop offset="0%" stopColor="#fff" stopOpacity="0.7" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
    </>
  );
}
