import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BALL_BASE, DISC_R, DRAW_COLORS, GK_COLOR, LINE_TOOLS, LINE_W, PLAYER_BASE, STROKE_LABELS,
  equipDef, grassOf, isKeeper, presetOf,
} from "../model/constants";
import type { BoardState, Player, Pt, Stroke } from "../model/types";
import { uid } from "../model/board";
import { curveMid, distToPoly, findLineShapes, findLinkShapes, quadPts } from "../lib/geometry";
import { useMedia } from "../lib/useMedia";
import { useBoard } from "../store/board";
import { useUI } from "../store/ui";
import { makeProjection, placeAttr, polyStr } from "./projection";
import { registry } from "./registry";
import { Grass, Markings, PitchGoalFronts, Zones } from "./layers/Pitch";
import { EquipGlyph } from "./layers/Equipment";
import { BallDefs, BallGlyph } from "./layers/Ball";
import { PlayerDisc, TokenDefs } from "./layers/PlayerToken";
import "./board.css";

const ARROW_COLORS = Array.from(new Set([...DRAW_COLORS, "#F4F4F7", "#EAFF3D", "#F5E94A"]));
const markerId = (c: string) => `arrow-${c.replace("#", "")}`;
const ctxLabel = (id: string, strokes: Stroke[]) => {
  if (id[0] === "s") { const st = strokes.find((q) => q.id === id); return st ? STROKE_LABELS[st.tool] : "Çizim"; }
  return ({ t: "Metin", b: "Top", g: "Logo", l: "Bağlantı", e: "Malzeme" } as Record<string, string>)[id[0]] || "Öğe";
};
const isPlayerId = (id: string) => id[0] === "h" || id[0] === "a";
const keyOf = (id: string): keyof BoardState | null =>
  ({ h: "players", a: "oppPlayers", t: "texts", b: "balls", g: "logos", e: "equipment" } as Record<string, keyof BoardState>)[id[0]] || null;

export function eraseFrom(b: BoardState, id: string): BoardState {
  const drop = <T extends { id: string }>(arr: T[]) => arr.filter((x) => x.id !== id);
  switch (id[0]) {
    case "s": return { ...b, strokes: drop(b.strokes) };
    case "t": return { ...b, texts: drop(b.texts) };
    case "b": return { ...b, balls: drop(b.balls) };
    case "g": return { ...b, logos: drop(b.logos) };
    case "l": return { ...b, links: drop(b.links) };
    case "e": return { ...b, equipment: drop(b.equipment) };
    default: return b;
  }
}

export default function Board() {
  const board = useBoard((s) => s.board);
  const tool = useBoard((s) => s.tool);
  const drawColor = useBoard((s) => s.drawColor);
  const selectedId = useBoard((s) => s.selectedId);
  const linkFrom = useBoard((s) => s.linkFrom);
  const orientation = useBoard((s) => s.orientation);
  const isPlaying = useBoard((s) => s.isPlaying);
  const playLayer = useBoard((s) => s.playLayer);
  const commit = useBoard((s) => s.commit);
  const epoch = useBoard((s) => s.epoch);

  const wide = useMedia("(min-width: 820px)", true);
  const cfg = presetOf(board.pitchId);
  const landscape = orientation === "auto" ? (cfg.band ? false : wide) : orientation === "landscape";
  const proj = useMemo(() => makeProjection(cfg, landscape, board.perspective), [cfg, landscape, board.perspective]);
  const { P, Pinv, viewBox, unit, clipPts } = proj;
  const grass = grassOf(board.grassColor);
  const sq = board.perspective ? 0.52 : 0.82; // ground foreshortening for equipment
  const tokenBoost = wide ? 1 : 1.3; // phones: tokens drawn larger so they stay readable and easy to grab

  const svgRef = useRef<SVGSVGElement>(null);
  const [live, setLive] = useState<Record<string, Pt> | null>(null);
  const drag = useRef<{ id: string; moved: boolean; x: number; y: number; sx: number; sy: number } | null>(null);
  const drawing = useRef<Stroke | null>(null);
  const bend = useRef<string | null>(null);
  const toolAtDown = useRef(tool);
  const longPress = useRef<{ t: number | null; fired: boolean; sx: number; sy: number }>({ t: null, fired: false, sx: 0, sy: 0 });

  registry.proj = proj;
  registry.setLive = setLive;
  useEffect(() => { registry.svg = svgRef.current; }, []);

  const strokes = playLayer ? playLayer.strokes : board.strokes;
  const links = playLayer ? playLayer.links : board.links;
  const texts = playLayer ? playLayer.texts : board.texts;

  const tokens = useMemo(() => [
    ...board.players.map((p) => ({ ...p, color: board.teamColor, home: true })),
    ...(board.showOpponent ? board.oppPlayers.map((p) => ({ ...p, color: board.oppColor, home: false })) : []),
  ], [board.players, board.oppPlayers, board.showOpponent, board.teamColor, board.oppColor]);
  const tokenIndex = useMemo(() => { const m: Record<string, Pt> = {}; tokens.forEach((p) => { m[p.id] = { x: p.x, y: p.y }; }); return m; }, [tokens]);
  const tokenPos = (id: string) => (live && live[id]) || tokenIndex[id];
  const linkShapes = useMemo(() => findLinkShapes(links), [links]);
  const lineShapes = useMemo(() => findLineShapes(strokes), [strokes]);

  const toData = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    const p = ctm ? pt.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
    return Pinv(p.x, p.y);
  };
  const reg = (id: string) => (el: SVGGElement | null) => { if (el) registry.nodes[id] = el; else delete registry.nodes[id]; };

  /* ---------- hit testing for the context menu ---------- */
  const hitId = (cx: number, cy: number, target: EventTarget | null): string | null => {
    const el = target instanceof Element ? target.closest("[data-tid]") : null;
    if (el) return el.getAttribute("data-tid");
    const p = toData({ clientX: cx, clientY: cy });
    let best: string | null = null, bestD = 2.4;
    const consider = (id: string, d: number) => { if (d < bestD) { bestD = d; best = id; } };
    strokes.forEach((s) => {
      const [a, b] = s.points;
      if (s.tool === "pen") consider(s.id, distToPoly(p, s.points));
      else if (LINE_TOOLS.includes(s.tool)) consider(s.id, distToPoly(p, s.c ? quadPts(a, b, s.c) : [a, b]));
      else {
        const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
        const edge = distToPoly(p, [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }, { x: x0, y: y0 }]);
        const inside = p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
        consider(s.id, s.tool === "zone" && inside ? Math.min(edge, 1.9) : edge);
      }
    });
    links.forEach((l) => { const a = tokenPos(l.a), b = tokenPos(l.b); if (a && b) consider(l.id, distToPoly(p, [a, b])); });
    return best;
  };
  const openCtx = (cx: number, cy: number, id: string | null) => {
    if (!id || isPlayerId(id)) return false;
    useUI.getState().set({ ctx: { x: cx, y: cy, id, label: ctxLabel(id, strokes) } });
    return true;
  };
  const cancelLongPress = () => { if (longPress.current.t) { window.clearTimeout(longPress.current.t); longPress.current.t = null; } };

  /* ---------- tokens ---------- */
  const tapLink = (id: string) => {
    if (!linkFrom) { useBoard.getState().setLinkFrom(id); return; }
    if (linkFrom === id) { useBoard.getState().setLinkFrom(null); return; }
    const a = linkFrom;
    commit((b) => {
      const same = (l: { a: string; b: string }) => (l.a === a && l.b === id) || (l.a === id && l.b === a);
      return { ...b, links: b.links.some(same) ? b.links.filter((l) => !same(l)) : [...b.links, { id: uid("l"), a, b: id, color: drawColor }] };
    });
    useBoard.getState().setLinkFrom(null);
  };

  const onTokenDown = (e: React.PointerEvent, id: string) => {
    if (e.button > 0 || isPlaying) return;
    toolAtDown.current = tool;
    if (tool === "eraser") { e.stopPropagation(); if (!isPlayerId(id)) commit((b) => eraseFrom(b, id)); return; }
    if (tool === "link") { e.stopPropagation(); if (isPlayerId(id)) tapLink(id); return; }
    if (tool !== "move") return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { id, moved: false, x: 0, y: 0, sx: e.clientX, sy: e.clientY };
  };

  const onTokenUp = (_e: React.PointerEvent, id: string) => {
    cancelLongPress();
    const st = drag.current;
    drag.current = null;
    if (longPress.current.fired) { longPress.current.fired = false; setLive(null); return; }
    if (toolAtDown.current !== "move") return;
    if (st && st.moved) {
      const k = keyOf(id);
      if (k) commit((b) => ({ ...b, [k]: (b[k] as { id: string }[]).map((p) => (p.id === id ? { ...p, x: st.x, y: st.y } : p)) }));
      setLive(null);
    } else {
      useBoard.getState().select(id);
    }
  };

  /* ---------- board surface ---------- */
  const onDownCapture = (e: React.PointerEvent) => {
    longPress.current.fired = false;
    cancelLongPress();
    if (e.pointerType !== "touch" || tool !== "move" || isPlaying) return;
    const { clientX: cx, clientY: cy, target } = e;
    longPress.current.sx = cx; longPress.current.sy = cy;
    longPress.current.t = window.setTimeout(() => {
      longPress.current.t = null;
      if (drag.current && drag.current.moved) return;
      if (openCtx(cx, cy, hitId(cx, cy, target))) { longPress.current.fired = true; drag.current = null; setLive(null); }
    }, 550);
  };

  const onDown = (e: React.PointerEvent) => {
    if (e.button > 0 || isPlaying) return;
    toolAtDown.current = tool;
    useUI.getState().set({ flyout: null });
    if (tool === "move") { useBoard.getState().select(null); return; }
    if (tool === "link") { useBoard.getState().setLinkFrom(null); return; }
    if (tool === "eraser") return;
    const { x, y } = toData(e);
    const st = useBoard.getState();
    if (tool === "text") { useUI.getState().set({ text: { mode: "new", id: null, x, y, content: "", color: "#F4F4F7", size: 3 } }); return; }
    if (tool === "equip") {
      const id = uid("e"), type = st.equipPick;
      commit((b) => ({ ...b, equipment: [...b.equipment, { id, type, x, y, ang: type === "ladder" ? 90 : 0, sc: 1 }] }));
      st.setTool("move"); st.select(id);
      return;
    }
    if (tool === "ball") {
      const id = uid("b");
      commit((b) => ({ ...b, balls: [...b.balls, { id, x, y, style: st.ballStyle }] }));
      st.setTool("move"); st.select(id);
      return;
    }
    if (tool === "curve") {
      let hit: Stroke | null = null, hitD = 3.2;
      strokes.forEach((s) => {
        if (!LINE_TOOLS.includes(s.tool)) return;
        const [a, b] = s.points, c = s.c || { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const m = curveMid(a, b, c);
        const d = Math.min(Math.hypot(x - m.x, y - m.y), distToPoly({ x, y }, quadPts(a, b, c)));
        if (d < hitD) { hitD = d; hit = s; }
      });
      if (hit) { bend.current = (hit as Stroke).id; return; }
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const stroke: Stroke = {
      id: uid("s"), tool: tool === "curve" ? "arrow" : (tool as Stroke["tool"]), color: drawColor,
      points: tool === "pen" ? [{ x, y }] : [{ x, y }, { x, y }],
      ...(tool === "curve" ? { curve: true } : {}),
    };
    drawing.current = stroke;
    commit((b) => ({ ...b, strokes: [...b.strokes, stroke] }), stroke.id);
  };

  const onMove = (e: React.PointerEvent) => {
    if (longPress.current.t && Math.hypot(e.clientX - longPress.current.sx, e.clientY - longPress.current.sy) > 10) cancelLongPress();
    const d = drag.current;
    if (d) {
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 3) return;
      const { x, y } = toData(e);
      const gm = d.id[0] === "b" || d.id[0] === "e" ? 2.6 * unit : 0;
      const bd = cfg.band;
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      const cx = clamp(x, 1, cfg.W - 1);
      const cy = clamp(y, bd && bd[0] > 0 ? bd[0] + 1 : 1 - gm, bd && bd[1] < cfg.H ? bd[1] - 1 : cfg.H - 1 + gm);
      d.x = cx; d.y = cy; d.moved = true;
      [d.id, d.id + "~f"].forEach((nid) => {
        const node = registry.nodes[nid];
        if (node) node.setAttribute("transform", placeAttr(P, cx, cy, Number(node.dataset.k) || 1));
      });
      if (isPlayerId(d.id)) setLive({ [d.id]: { x: cx, y: cy } });
      return;
    }
    if (bend.current) {
      const { x, y } = toData(e);
      const id = bend.current;
      commit((b) => ({ ...b, strokes: b.strokes.map((s) => (s.id === id ? { ...s, c: { x: 2 * x - 0.5 * (s.points[0].x + s.points[1].x), y: 2 * y - 0.5 * (s.points[0].y + s.points[1].y) } } : s)) }), `bend-${id}`);
      return;
    }
    const dr = drawing.current;
    if (dr) {
      const { x, y } = toData(e);
      if (dr.tool === "pen") {
        dr.points = [...dr.points, { x, y }];
      } else {
        dr.points = [dr.points[0], { x, y }];
        if (dr.curve) {
          const a = dr.points[0], dx = x - a.x, dy = y - a.y;
          dr.c = { x: (a.x + x) / 2 - dy * 0.22, y: (a.y + y) / 2 + dx * 0.22 };
        }
      }
      const snap = { ...dr };
      commit((b) => ({ ...b, strokes: b.strokes.map((s) => (s.id === snap.id ? snap : s)) }), snap.id);
    }
  };

  const onUp = () => {
    cancelLongPress();
    const d = drawing.current;
    drawing.current = null;
    bend.current = null;
    if (!d) return;
    const [a, b] = d.points;
    const tiny = d.tool === "pen" ? d.points.length < 2 : !b || Math.hypot(b.x - a.x, b.y - a.y) < (d.tool === "zone" ? 1.5 : 1);
    if (tiny) useBoard.setState((s) => ({ board: { ...s.board, strokes: s.board.strokes.filter((x) => x.id !== d.id) } }));
    if (d.tool === "zone") useBoard.getState().setTool("move");
  };

  const onContext = (e: React.MouseEvent) => {
    if (isPlaying) return;
    if (openCtx(e.clientX, e.clientY, hitId(e.clientX, e.clientY, e.target))) e.preventDefault();
  };

  /* ---------- render helpers ---------- */
  const cursor = (id: string) => (tool === "move" ? "grab" : tool === "eraser" && !isPlayerId(id) ? "pointer" : tool === "link" && isPlayerId(id) ? "pointer" : "default");
  const strokeHit = tool === "eraser" || tool === "move";
  const renderStroke = (s: Stroke) => {
    const pp = s.points.map((pt) => P(pt.x, pt.y));
    const sel = selectedId === s.id;
    const common = { stroke: s.color, strokeWidth: LINE_W, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    const hit = (d: string) => (
      <path d={d} fill="none" stroke="transparent" strokeWidth={2.4} pointerEvents={strokeHit ? "stroke" : "none"}
        onPointerDown={(e) => { if (tool === "eraser") { e.stopPropagation(); commit((b) => eraseFrom(b, s.id)); } else if (tool === "move") { e.stopPropagation(); useBoard.getState().select(s.id); } }}
        style={{ cursor: tool === "eraser" ? "pointer" : "default" }} />
    );
    const toD = (pts: { x: number; y: number }[]) => pts.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join(" ");
    const corners = (a: Pt, b: Pt): [number, number][] => [[a.x, a.y], [b.x, a.y], [b.x, b.y], [a.x, b.y]];

    if (s.tool === "pen") {
      const d = toD(pp);
      return <g key={s.id} data-tid={s.id}>{sel && <path data-ui="1" d={d} {...common} stroke="#fff" strokeOpacity={0.5} strokeWidth={LINE_W * 3.4} />}<path d={d} {...common} pointerEvents="none" />{hit(d)}</g>;
    }
    if (s.tool === "zone" || s.tool === "rect" || s.tool === "frect") {
      const [a, b] = s.points;
      const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
      const poly = polyStr(P, corners({ x: x0, y: y0 }, { x: x0 + w, y: y0 + h }));
      const d = "M" + poly.split(" ").join(" L") + " Z";
      let body: React.ReactNode;
      if (s.tool === "zone") {
        const inside = (p?: Pt) => !!p && p.x >= x0 && p.x <= x0 + w && p.y >= y0 && p.y <= y0 + h;
        const homeN = board.players.filter((p) => inside(tokenPos(p.id))).length;
        const awayN = board.showOpponent ? board.oppPlayers.filter((p) => inside(tokenPos(p.id))).length : 0;
        const c = P(x0 + w / 2, y0 + h / 2);
        body = (
          <>
            <polygon points={poly} fill={s.color} fillOpacity={0.22} stroke={s.color} strokeWidth={LINE_W} strokeDasharray="1.2 0.9" strokeLinejoin="round" pointerEvents="none" />
            {(homeN > 0 || awayN > 0) && (
              <g transform={`translate(${c.x},${c.y}) scale(${c.s})`} pointerEvents="none">
                <text textAnchor="middle" dominantBaseline="central" fontFamily="'Barlow Condensed', sans-serif" fontStyle="italic" fontWeight={700}
                  fontSize={Math.max(2.6, Math.min(5.2, Math.min(w, h) * 0.36))} fill="#FFFFFF"
                  style={{ paintOrder: "stroke", stroke: "rgba(8,12,20,0.7)", strokeWidth: 0.6, strokeLinejoin: "round" }}>{homeN}v{awayN}</text>
              </g>
            )}
          </>
        );
      } else if (s.tool === "frect") {
        body = <polygon points={poly} fill={s.color} fillOpacity={0.3} stroke="#FFFFFF" strokeWidth={LINE_W * 1.3} strokeLinejoin="round" pointerEvents="none" />;
      } else {
        body = <polygon points={poly} {...common} pointerEvents="none" />;
      }
      return <g key={s.id} data-tid={s.id}>{sel && <path data-ui="1" d={d} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={LINE_W * 3.4} strokeLinejoin="round" />}{body}{hit(d)}</g>;
    }
    const isArrow = s.tool === "arrow" || s.tool === "darrow";
    const dashed = s.tool === "darrow" ? { strokeDasharray: "1 0.8", strokeLinecap: "butt" as const } : {};
    const curvePts = s.c ? quadPts(s.points[0], s.points[1], s.c).map((pt) => P(pt.x, pt.y)) : pp.slice(0, 2);
    const d = toD(curvePts);
    const mid = s.c ? curveMid(s.points[0], s.points[1], s.c) : { x: (s.points[0].x + s.points[1].x) / 2, y: (s.points[0].y + s.points[1].y) / 2 };
    const m = P(mid.x, mid.y);
    return (
      <g key={s.id} data-tid={s.id}>
        {sel && <path data-ui="1" d={d} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={LINE_W * 3.4} strokeLinecap="round" />}
        <path d={d} {...common} {...dashed} markerEnd={isArrow ? `url(#${markerId(s.color)})` : undefined} pointerEvents="none" />
        {hit(d)}
        {tool === "curve" && <circle data-ui="1" cx={m.x} cy={m.y} r={0.9 * m.s} fill="#FFFFFF" fillOpacity={0.92} stroke="rgba(8,12,20,0.6)" strokeWidth={0.2} pointerEvents="none" />}
      </g>
    );
  };

  const renderToken = (p: Player & { color: string; home: boolean }) => {
    const gk = isKeeper(p.role);
    const kit = p.home ? board.homeKit : board.awayKit;
    const k = unit * PLAYER_BASE * board.playerScale * tokenBoost;
    const label = board.labelMode === "names" ? p.name : board.labelMode === "roles" ? p.role : "";
    const fs = 1.25 / PLAYER_BASE;
    const lw = String(label).length * fs * 0.58 + fs * 1.2, lh = fs * 1.55, ly = DISC_R + 0.35;
    const selected = selectedId === p.id;
    return (
      <g key={`${p.id}:${epoch}`} ref={reg(p.id)} data-tid={p.id} data-k={k} transform={placeAttr(P, p.x, p.y, k)}
        onPointerDown={(e) => onTokenDown(e, p.id)} onPointerUp={(e) => onTokenUp(e, p.id)} style={{ cursor: cursor(p.id) }}>
        {selected && <circle data-ui="1" r={DISC_R + 0.7} fill="none" stroke="#FFFFFF" strokeWidth={0.32} className="sel-ring" />}
        {linkFrom === p.id && <circle data-ui="1" r={DISC_R + 0.9} fill="none" stroke="#FFFFFF" strokeWidth={0.34} strokeDasharray="0.9 0.7" />}
        <PlayerDisc color={gk ? GK_COLOR : p.color} c2={kit.c2} design={gk ? "plain" : kit.design} number={p.number} vest={p.vest} />
        {label && (
          <g pointerEvents="none">
            <rect x={-lw / 2} y={ly} width={lw} height={lh} rx={lh / 2} fill="#FFFFFF" fillOpacity={0.95} stroke="rgba(8,12,20,0.25)" strokeWidth={0.08} />
            <text y={ly + lh * 0.7} textAnchor="middle" fontFamily="Barlow, sans-serif" fontWeight={600} fontSize={fs} fill="#15181A">{label}</text>
          </g>
        )}
      </g>
    );
  };

  const selRing = (id: string, r: number) => (selectedId === id ? <circle data-ui="1" r={r} fill="none" stroke="#FFFFFF" strokeWidth={0.3} strokeDasharray="0.8 0.6" className="sel-ring" /> : null);

  return (
    <svg ref={svgRef} viewBox={viewBox} className="board-svg" preserveAspectRatio="xMidYMid meet" data-tool={tool}
      onPointerDown={onDown} onPointerDownCapture={onDownCapture} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onContextMenu={onContext}
      role="application" aria-label="Taktik tahtası">
      <defs>
        {ARROW_COLORS.map((c) => (
          <marker key={c} id={markerId(c)} viewBox="0 0 6 6" markerWidth="5.4" markerHeight="5.4" refX="4.8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L6,3 L0,6 Z" fill={c} />
          </marker>
        ))}
        <TokenDefs />
        <BallDefs />
        <pattern id="netPat" width="0.7" height="0.7" patternUnits="userSpaceOnUse">
          <rect width="0.7" height="0.7" fill="#fff" fillOpacity="0.1" />
          <path d="M0 0L0.7 0.7M0.7 0L0 0.7" stroke="#fff" strokeWidth="0.09" strokeOpacity="0.7" />
        </pattern>
        {clipPts && <clipPath id="cropClip"><polygon points={clipPts} /></clipPath>}
      </defs>

      <g clipPath={clipPts ? "url(#cropClip)" : undefined}>
        <Grass P={P} W={cfg.W} H={cfg.H} pattern={board.grassPattern} a={grass.a} b={grass.b} />
        {!cfg.noLines && <Markings P={P} W={cfg.W} H={cfg.H} color={grass.line} />}
        <Zones P={P} W={cfg.W} H={cfg.H} mode={board.zoneMode} />

        {/* closed link loops and line shapes get a soft fill */}
        {linkShapes.map((ids) => {
          const pts = ids.map((id) => tokenPos(id)).filter(Boolean).map((p) => P(p!.x, p!.y));
          if (pts.length !== ids.length) return null;
          const col = (links.find((l) => ids.includes(l.a) && ids.includes(l.b)) || { color: "#FFFFFF" }).color;
          return <polygon key={ids.join("|")} points={pts.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ")} fill={col} fillOpacity={0.24} pointerEvents="none" />;
        })}
        {lineShapes.map((sh, i) => (
          <polygon key={`ls${i}`} points={sh.pts.map((pt) => { const q = P(pt.x, pt.y); return `${q.x.toFixed(2)},${q.y.toFixed(2)}`; }).join(" ")} fill={sh.color} fillOpacity={0.24} pointerEvents="none" />
        ))}
        {links.map((l) => {
          const a = tokenPos(l.a), b = tokenPos(l.b);
          if (!a || !b) return null;
          const A = P(a.x, a.y), B = P(b.x, b.y);
          return (
            <g key={l.id} data-tid={l.id}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={l.color} strokeWidth={0.48} strokeLinecap="round" pointerEvents="none" />
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="transparent" strokeWidth={2.2} pointerEvents={tool === "eraser" ? "stroke" : "none"}
                onPointerDown={(e) => { if (tool === "eraser") { e.stopPropagation(); commit((bd) => eraseFrom(bd, l.id)); } }} style={{ cursor: "pointer" }} />
            </g>
          );
        })}

        {strokes.map(renderStroke)}

        {board.equipment.map((it) => {
          const def = equipDef(it.type);
          const k = unit * def.base * (it.sc || 1);
          const ang = it.ang != null ? it.ang : (it.rot || 0) * 90;
          const isGoal = def.group === "goal";
          return (
            <g key={`${it.id}:${epoch}`} ref={reg(it.id)} data-tid={it.id} data-k={k} transform={placeAttr(P, it.x, it.y, k)}
              onPointerDown={(e) => onTokenDown(e, it.id)} onPointerUp={(e) => onTokenUp(e, it.id)} style={{ cursor: cursor(it.id) }}>
              {selRing(it.id, isGoal ? 4.4 : 2.2)}
              <circle r={isGoal ? 4 : 2} cy={isGoal ? -0.8 : -1} fill="rgba(255,255,255,0.001)" />
              <EquipGlyph type={it.type} sq={sq} ang={ang} part={isGoal ? "back" : "all"} />
            </g>
          );
        })}

        {board.logos.map((g) => (
          <g key={`${g.id}:${epoch}`} ref={reg(g.id)} data-tid={g.id} data-k={1} transform={placeAttr(P, g.x, g.y, 1)}
            onPointerDown={(e) => onTokenDown(e, g.id)} onPointerUp={(e) => onTokenUp(e, g.id)} style={{ cursor: cursor(g.id) }}>
            {selRing(g.id, g.size * 0.6)}
            <image href={g.src} x={-g.size / 2} y={-g.size / 2} width={g.size} height={g.size} preserveAspectRatio="xMidYMid meet" />
          </g>
        ))}

        {texts.map((t) => (
          <g key={`${t.id}:${epoch}`} ref={reg(t.id)} data-tid={t.id} data-k={1} transform={placeAttr(P, t.x, t.y, 1)}
            onPointerDown={(e) => onTokenDown(e, t.id)} onPointerUp={(e) => onTokenUp(e, t.id)} style={{ cursor: cursor(t.id) }}>
            {selectedId === t.id && <rect data-ui="1" x={-t.size * t.content.length * 0.3 - 0.8} y={-t.size * 1.05} width={t.size * t.content.length * 0.6 + 1.6} height={t.size * 1.4} rx={0.6} fill="none" stroke="#fff" strokeWidth={0.22} strokeDasharray="0.8 0.6" />}
            <text textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontStyle="italic" fontWeight={700} fontSize={t.size} fill={t.color}
              style={{ paintOrder: "stroke", stroke: "rgba(8,12,20,0.75)", strokeWidth: t.size * 0.12, strokeLinejoin: "round" }}>{t.content}</text>
          </g>
        ))}

        {tokens.map(renderToken)}

        {/* balls sit over players, so a ball at a player's feet never hides under the token */}
        {board.balls.map((b) => {
          const k = unit * BALL_BASE * board.ballScale * tokenBoost;
          return (
            <g key={`${b.id}:${epoch}`} ref={reg(b.id)} data-tid={b.id} data-k={k} transform={placeAttr(P, b.x, b.y, k)}
              onPointerDown={(e) => onTokenDown(e, b.id)} onPointerUp={(e) => onTokenUp(e, b.id)} style={{ cursor: cursor(b.id) }}>
              <circle r={2.4} cy={-1.5} fill="rgba(255,255,255,0.001)" />
              {selectedId === b.id && <circle data-ui="1" cy={-1.45} r={2.3} fill="none" stroke="#fff" strokeWidth={0.3} strokeDasharray="0.8 0.6" />}
              <g transform="translate(0,-1.45)"><BallGlyph style={b.style} rot={(registry.ballRot[b.id] as number[][]) || null} /></g>
            </g>
          );
        })}

        {/* goal fronts above balls and players, so a ball really sits inside the net */}
        {board.equipment.filter((it) => equipDef(it.type).group === "goal").map((it) => {
          const k = unit * (it.sc || 1);
          const ang = it.ang != null ? it.ang : (it.rot || 0) * 90;
          return (
            <g key={`${it.id}~f:${epoch}`} ref={reg(it.id + "~f")} data-k={k} transform={placeAttr(P, it.x, it.y, k)} pointerEvents="none">
              <EquipGlyph type={it.type} sq={sq} ang={ang} part="front" />
            </g>
          );
        })}
        {!cfg.noLines && <PitchGoalFronts P={P} W={cfg.W} H={cfg.H} color={grass.line} />}
      </g>
    </svg>
  );
}
