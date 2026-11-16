import type { PitchPreset } from "../model/constants";

export type ScreenPt = { x: number; y: number; s: number };
export type Projection = {
  P: (x: number, y: number) => ScreenPt;
  Pinv: (X: number, Y: number) => { x: number; y: number };
  viewBox: string;
  unit: number;
  clipPts: string | null;
  landscape: boolean;
  persp: boolean;
};

/* Pitch data lives in portrait metres (x across 0..W, y along 0..H).
   The projection optionally turns the pitch on its side (landscape), then applies a
   camera perspective: the far touchline is narrower, straight lines stay straight and
   circles become ellipses. Pinv undoes it for pointer input. */
export function makeProjection(cfg: PitchPreset, landscape: boolean, persp: boolean): Projection {
  const { W, H } = cfg;
  const band = cfg.band || null;
  const Uw = landscape ? H : W, Vh = landscape ? W : H;
  const t = persp ? 0.19 : 0, kY = persp ? 0.9 : 1;
  const P = (x: number, y: number): ScreenPt => {
    const u = landscape ? y : x, v = landscape ? W - x : y;
    const d = 1 + t * (1 - v / Vh);
    return { x: Uw / 2 + (u - Uw / 2) / d, y: Vh + (kY * (v - Vh)) / d, s: 1 / d };
  };
  const Pinv = (X: number, Y: number) => {
    const e = Y - Vh;
    const w = e / Math.max(0.05, kY + (e * t) / Vh);
    const d = 1 - (t * w) / Vh;
    const u = Uw / 2 + (X - Uw / 2) * d, v = Vh + w;
    return landscape ? { x: W - v, y: u } : { x: u, y: v };
  };
  const unit = W / 68;
  const gd = 2.4 * unit;
  const ya = band && band[0] > 0 ? band[0] : -gd, yb = band && band[1] < H ? band[1] : H + gd;
  const corners = band
    ? [[0, ya], [W, ya], [0, yb], [W, yb]]
    : [[0, -gd], [W, -gd], [0, H + gd], [W, H + gd], [0, 0], [W, 0], [0, H], [W, H]];
  const pts = corners.map(([x, y]) => P(x, y));
  const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const padX = 3.6, padT = landscape ? 8.5 : 13, padB = 5.2;
  const vbW = maxX - minX + 2 * padX, vbH = maxY - minY + padT + padB;
  const viewBox = `${(minX - padX).toFixed(3)} ${(minY - padT).toFixed(3)} ${vbW.toFixed(3)} ${vbH.toFixed(3)}`;
  const clipPts = band
    ? [[-8, band[0] > 0 ? band[0] : -8], [W + 8, band[0] > 0 ? band[0] : -8], [W + 8, band[1] < H ? band[1] : H + 8], [-8, band[1] < H ? band[1] : H + 8]]
      .map(([x, y]) => P(x, y)).map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ")
    : null;
  return { P, Pinv, viewBox, unit, clipPts, landscape, persp };
}

export const polyStr = (P: Projection["P"], arr: number[][]) =>
  arr.map(([x, y]) => { const q = P(x, y); return `${q.x.toFixed(2)},${q.y.toFixed(2)}`; }).join(" ");

export const placeAttr = (P: Projection["P"], x: number, y: number, k = 1) => {
  const q = P(x, y);
  return `translate(${q.x.toFixed(3)},${q.y.toFixed(3)}) scale(${(q.s * k).toFixed(4)})`;
};
