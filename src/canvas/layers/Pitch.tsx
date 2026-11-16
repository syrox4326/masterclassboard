import React from "react";
import { POS_ROWS, POS_VLINES } from "../../model/constants";
import type { GrassPattern, ZoneMode } from "../../model/types";
import { arcPts, circPts } from "../../lib/geometry";
import { polyStr, type Projection } from "../projection";
import { GoalFrame } from "./Goal";

type P = Projection["P"];

/* Grass: a base colour and a mowing pattern drawn through the projection, so the stripes
   converge with the pitch. The pattern runs well past the touchlines to fill the window. */
export const Grass = React.memo(function Grass({ P, W, H, pattern, a, b }: { P: P; W: number; H: number; pattern: GrassPattern; a: string; b: string }) {
  const M = 70, step = 8.75;
  const x0 = -M, x1 = W + M, y0 = -M * 0.8, y1 = H + M * 0.8;
  const els: React.ReactNode[] = [];
  const quad = (key: string, pts: number[][], fill = b, op?: number) =>
    els.push(<polygon key={key} points={polyStr(P, pts)} fill={fill} fillOpacity={op} />);
  if (pattern === "grid") {
    const cw = W / 14, rh = H / 20;
    for (let j = Math.floor(x0 / cw); j * cw < x1; j++) if (((j % 2) + 2) % 2 === 1) quad(`gc${j}`, [[j * cw, y0], [(j + 1) * cw, y0], [(j + 1) * cw, y1], [j * cw, y1]], "#BAED8D", 0.1);
    for (let i = Math.floor(y0 / rh); i * rh < y1; i++) if (((i % 2) + 2) % 2 === 1) quad(`gr${i}`, [[x0, i * rh], [x1, i * rh], [x1, (i + 1) * rh], [x0, (i + 1) * rh]], "#000000", 0.038);
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
    const rs: number[] = [];
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

/* Markings to FIFA proportions, scaled to the pitch size. */
export const Markings = React.memo(function Markings({ P, W, H, color }: { P: P; W: number; H: number; color: string }) {
  const k = W / 68;
  const boxW = 0.593 * W, boxD = 0.157 * H, sixW = 0.2694 * W, sixD = 0.0524 * H;
  const circleR = 0.1345 * W, spotY = 0.1048 * H, cornerR = 0.0147 * W, goalW = 0.1076 * W, goalD = 2.4 * k;
  const cx = W / 2;
  const s = { fill: "none", stroke: color, strokeWidth: 0.24, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const rect = (x: number, y: number, w: number, h: number) => <polygon points={polyStr(P, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]])} {...s} />;
  const m = (boxD - spotY) / circleR, a0 = Math.asin(m), a1 = Math.PI - Math.asin(m);
  const arcTop = arcPts((a) => [cx + circleR * Math.cos(a), spotY + circleR * Math.sin(a)], a0, a1);
  const arcBot = arcPts((a) => [cx + circleR * Math.cos(a), H - spotY - circleR * Math.sin(a)], a0, a1);
  const dot = (x: number, y: number) => { const q = P(x, y); return <circle cx={q.x} cy={q.y} r={0.3 * q.s} fill={color} />; };
  const corner = (fx: (a: number) => [number, number]) => <polyline points={polyStr(P, arcPts(fx, 0, Math.PI / 2, 10))} {...s} />;
  const goal = (yLine: number, dir: number) => (
    <GoalFrame FL={P(cx - goalW / 2, yLine)} FR={P(cx + goalW / 2, yLine)} BL={P(cx - goalW / 2, yLine + dir * goalD)} color={color} part="back" />
  );
  return (
    <g>
      {goal(0, -1)}
      {goal(H, 1)}
      {rect(0, 0, W, H)}
      <polyline points={polyStr(P, [[0, H / 2], [W, H / 2]])} {...s} />
      <polygon points={polyStr(P, circPts(cx, H / 2, circleR))} {...s} />
      {dot(cx, H / 2)}
      {rect(cx - boxW / 2, 0, boxW, boxD)}
      {rect(cx - sixW / 2, 0, sixW, sixD)}
      {dot(cx, spotY)}
      <polyline points={polyStr(P, arcTop)} {...s} />
      {rect(cx - boxW / 2, H - boxD, boxW, boxD)}
      {rect(cx - sixW / 2, H - sixD, sixW, sixD)}
      {dot(cx, H - spotY)}
      <polyline points={polyStr(P, arcBot)} {...s} />
      {corner((a) => [cornerR * Math.cos(a), cornerR * Math.sin(a)])}
      {corner((a) => [W - cornerR * Math.cos(a), cornerR * Math.sin(a)])}
      {corner((a) => [cornerR * Math.cos(a), H - cornerR * Math.sin(a)])}
      {corner((a) => [W - cornerR * Math.cos(a), H - cornerR * Math.sin(a)])}
    </g>
  );
});

// the front of the two pitch goals sits above players and balls
export function PitchGoalFronts({ P, W, H, color }: { P: P; W: number; H: number; color: string }) {
  const k = W / 68, goalW = 0.1076 * W, goalD = 2.4 * k, cx = W / 2;
  const one = (yLine: number, dir: number) => (
    <GoalFrame part="front" color={color} FL={P(cx - goalW / 2, yLine)} FR={P(cx + goalW / 2, yLine)} BL={P(cx - goalW / 2, yLine + dir * goalD)} />
  );
  return <g pointerEvents="none">{one(0, -1)}{one(H, 1)}</g>;
}

export const Zones = React.memo(function Zones({ P, W, H, mode }: { P: P; W: number; H: number; mode: ZoneMode }) {
  if (mode === "none") return null;
  const dash = { stroke: "#FFFFFF", strokeWidth: 0.18, strokeDasharray: "0.9 0.9", opacity: 0.78, fill: "none" };
  const hl = (y: number, key: string) => <polyline key={key} points={polyStr(P, [[0, y], [W, y]])} {...dash} />;
  const vl = (x: number, key: string) => <polyline key={key} points={polyStr(P, [[x, 0], [x, H]])} {...dash} />;
  const lanes = [1, 2, 3, 4].map((i) => vl((W * i) / 5, `v${i}`));
  const thirds = [1, 2].map((i) => hl((H * i) / 3, `h${i}`));
  if (mode === "thirds") return <g pointerEvents="none">{thirds}</g>;
  if (mode === "lanes") return <g pointerEvents="none">{lanes}</g>;
  if (mode === "lanesThirds") return <g pointerEvents="none">{lanes}{thirds}</g>;
  if (mode === "halfspaces") {
    const lw = W / 5;
    return (
      <g pointerEvents="none">
        {[1, 3].map((i) => <polygon key={`f${i}`} points={polyStr(P, [[lw * i, 0], [lw * (i + 1), 0], [lw * (i + 1), H], [lw * i, H]])} fill="#FFFFFF" fillOpacity={0.15} />)}
        {lanes}
      </g>
    );
  }
  return (
    <g pointerEvents="none">
      {POS_VLINES.map((f, i) => vl(W * f, `v${i}`))}
      {Array.from({ length: POS_ROWS - 1 }, (_, j) => hl((H * (j + 1)) / POS_ROWS, `h${j}`))}
    </g>
  );
});
