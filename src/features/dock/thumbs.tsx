import { FORMATIONS, POS_ROWS, POS_VLINES, type Template } from "../../model/constants";
import type { BoardState, GrassPattern, ZoneMode } from "../../model/types";
import { TokenDefs } from "../../canvas/layers/PlayerToken";

/* Small, flat (top-down) previews used by the pickers. Drawn on a 68 × 105 portrait pitch. */

const PITCH = "#3E8E41";
const LINE = "rgba(255,255,255,0.7)";

function MiniPitch({ children, fill = PITCH, lines = true }: { children?: React.ReactNode; fill?: string; lines?: boolean }) {
  return (
    <svg viewBox="-4 -4 76 113" className="thumb-svg" aria-hidden="true">
      <rect x="-4" y="-4" width="76" height="113" rx="5" fill={fill} />
      {children}
      {lines && (
        <g fill="none" stroke={LINE} strokeWidth="1.1">
          <rect x="0" y="0" width="68" height="105" rx="0.5" />
          <line x1="0" y1="52.5" x2="68" y2="52.5" />
          <circle cx="34" cy="52.5" r="8" />
          <rect x="14" y="0" width="40" height="16" />
          <rect x="14" y="89" width="40" height="16" />
        </g>
      )}
    </svg>
  );
}

export function FormationThumb({ k, away }: { k: string; away?: boolean }) {
  return (
    <MiniPitch>
      {FORMATIONS[k].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.role === "KL" ? 3.8 : 4.4} fill={s.role === "KL" ? "#E3B341" : away ? "#FF7A6B" : "#F4F6F7"} stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
      ))}
    </MiniPitch>
  );
}

export function GrassThumb({ pattern, a, b }: { pattern: GrassPattern; a: string; b: string }) {
  const els: React.ReactNode[] = [];
  const step = 13;
  if (pattern === "bands") for (let k = 0; k < 9; k++) if (k % 2) els.push(<rect key={k} x="-4" y={-4 + k * step} width="76" height={step} fill={b} />);
  if (pattern === "lanes") for (let k = 0; k < 6; k++) if (k % 2) els.push(<rect key={k} x={-4 + k * step} y="-4" width={step} height="113" fill={b} />);
  if (pattern === "checker") for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) if ((i + j) % 2) els.push(<rect key={`${i}${j}`} x={-4 + i * step} y={-4 + j * step} width={step} height={step} fill={b} />);
  if (pattern === "diag") for (let k = -8; k < 10; k++) if (k % 2) els.push(<polygon key={k} points={`${k * 12},-4 ${k * 12 + 12},-4 ${k * 12 + 72},109 ${k * 12 + 60},109`} fill={b} />);
  if (pattern === "rings") for (let r = 70; r > 0; r -= 9) els.push(<circle key={r} cx="34" cy="52.5" r={r} fill={(70 - r) / 9 % 2 ? a : b} />);
  if (pattern === "grid") {
    for (let j = 0; j < 7; j++) if (j % 2) els.push(<rect key={`c${j}`} x={-4 + j * 11} y="-4" width="11" height="113" fill="#BAED8D" fillOpacity="0.14" />);
    for (let i = 0; i < 11; i++) if (i % 2) els.push(<rect key={`r${i}`} x="-4" y={-4 + i * 10.3} width="76" height="10.3" fill="#000" fillOpacity="0.06" />);
  }
  return <MiniPitch fill={a}>{els}</MiniPitch>;
}

export function ZoneThumb({ mode }: { mode: ZoneMode }) {
  const dash = { stroke: "#fff", strokeWidth: 1.1, strokeDasharray: "2.6 2.2", fill: "none" };
  const lanes = [1, 2, 3, 4].map((i) => <line key={`v${i}`} x1={(68 * i) / 5} y1="0" x2={(68 * i) / 5} y2="105" {...dash} />);
  const thirds = [1, 2].map((i) => <line key={`h${i}`} x1="0" y1={(105 * i) / 3} x2="68" y2={(105 * i) / 3} {...dash} />);
  let inner: React.ReactNode = null;
  if (mode === "thirds") inner = thirds;
  if (mode === "lanes") inner = lanes;
  if (mode === "lanesThirds") inner = <>{lanes}{thirds}</>;
  if (mode === "halfspaces") inner = <>{[1, 3].map((i) => <rect key={i} x={(68 * i) / 5} y="0" width={68 / 5} height="105" fill="#fff" fillOpacity="0.22" />)}{lanes}</>;
  if (mode === "positional") inner = <>{POS_VLINES.map((f, i) => <line key={i} x1={68 * f} y1="0" x2={68 * f} y2="105" {...dash} />)}{Array.from({ length: POS_ROWS - 1 }, (_, j) => <line key={`r${j}`} x1="0" y1={(105 * (j + 1)) / POS_ROWS} x2="68" y2={(105 * (j + 1)) / POS_ROWS} {...dash} />)}</>;
  return <MiniPitch>{inner}</MiniPitch>;
}

export function TemplateThumb({ t }: { t: Template }) {
  return (
    <svg viewBox="-2 6 72 80" className="thumb-svg thumb-wide" aria-hidden="true">
      <defs>
        {Array.from(new Set(t.strokes.map((s) => s.color))).map((c) => (
          <marker key={c} id={`tm${c.replace("#", "")}`} viewBox="0 0 6 6" markerWidth="4" markerHeight="4" refX="4.8" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={c} /></marker>
        ))}
      </defs>
      <rect x="-2" y="6" width="72" height="80" rx="5" fill={PITCH} />
      <line x1="0" y1="52.5" x2="68" y2="52.5" stroke={LINE} strokeWidth="1" />
      {t.strokes.map((s, i) => (
        <line key={i} x1={s.points[0].x} y1={s.points[0].y} x2={s.points[1].x} y2={s.points[1].y} stroke={s.color} strokeWidth="2.2" strokeLinecap="round"
          strokeDasharray={s.tool === "darrow" ? "3 2.4" : undefined} markerEnd={s.tool !== "line" ? `url(#tm${s.color.replace("#", "")})` : undefined} />
      ))}
    </svg>
  );
}

// a scene as a tiny top-down board
export function SceneThumb({ s }: { s: BoardState }) {
  return (
    <MiniPitch>
      {s.strokes.filter((st) => st.points.length >= 2).slice(0, 14).map((st) => (
        <line key={st.id} x1={st.points[0].x} y1={st.points[0].y} x2={st.points[st.points.length - 1].x} y2={st.points[st.points.length - 1].y} stroke={st.color} strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
      ))}
      {s.players.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r="3.4" fill={s.teamColor} stroke="rgba(0,0,0,0.4)" strokeWidth="0.7" />)}
      {s.showOpponent && s.oppPlayers.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r="3.4" fill={s.oppColor} stroke="rgba(0,0,0,0.4)" strokeWidth="0.7" />)}
      {s.balls.map((b) => <circle key={b.id} cx={b.x} cy={b.y} r="1.8" fill="#fff" stroke="#111" strokeWidth="0.6" />)}
    </MiniPitch>
  );
}

export function TokenThumbDefs() {
  return <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs><TokenDefs /></defs></svg>;
}
