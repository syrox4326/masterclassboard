import type { Pt, Stroke } from "../model/types";

export const quadPts = (A: Pt, B: Pt, C: Pt, n = 28): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, m = 1 - t;
    return { x: m * m * A.x + 2 * m * t * C.x + t * t * B.x, y: m * m * A.y + 2 * m * t * C.y + t * t * B.y };
  });

export const curveMid = (A: Pt, B: Pt, C: Pt): Pt => ({ x: 0.25 * A.x + 0.5 * C.x + 0.25 * B.x, y: 0.25 * A.y + 0.5 * C.y + 0.25 * B.y });

export function distToPoly(p: Pt, pts: Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    best = Math.min(best, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)));
  }
  return best;
}

export const circPts = (cx: number, cy: number, r: number, n = 72): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

export const arcPts = (fn: (a: number) => [number, number], a0: number, a1: number, n = 36): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => fn(a0 + ((a1 - a0) * i) / n));

type Adj = Record<string, Set<string>>;

// every closed loop (3 to 8 points, no chord inside) in a graph
export function findCycles(adj: Adj): string[][] {
  const ids = Object.keys(adj).sort();
  const idx: Record<string, number> = {};
  ids.forEach((id, i) => { idx[id] = i; });
  const out: string[][] = [];
  ids.forEach((start) => {
    const path = [start];
    const dfs = (cur: string) => {
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

export function findLinkShapes(links: { a: string; b: string }[]): string[][] {
  const adj: Adj = {};
  links.forEach((l) => { (adj[l.a] = adj[l.a] || new Set()).add(l.b); (adj[l.b] = adj[l.b] || new Set()).add(l.a); });
  return findCycles(adj);
}

// straight lines whose ends meet form closed shapes, which get a soft fill
export function findLineShapes(strokes: Stroke[]): { pts: Pt[]; color: string }[] {
  const nodes: Pt[] = [], adj: Adj = {}, colors: Record<string, string> = {};
  const nodeFor = (p: Pt) => {
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
