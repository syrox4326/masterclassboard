import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BALL_STYLES, DRAW_COLORS, ROLE_NAMES, STROKE_LABELS, TEXT_SIZES, equipDef, isKeeper } from "../../model/constants";
import type { BoardState, Player } from "../../model/types";
import { uid } from "../../model/board";
import { useBoard } from "../../store/board";
import { registry } from "../../canvas/registry";
import { eraseFrom } from "../../canvas/Board";
import { Icon } from "../../ui/icons";
import { Segmented, Swatches } from "../../ui/kit";
import "./inspector.css";

const VESTS = ["#F6C90A", "#F97316", "#22C55E", "#38BDF8", "#EC4899", "#4C63C9"];

function usePlacement(id: string | null, stage: HTMLElement | null, deps: unknown[]) {
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null);
  const card = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!id || !stage) { setPos(null); return; }
    let raf = 0;
    const place = () => {
      const el = registry.nodes[id] || registry.svg?.querySelector(`[data-tid="${id}"]`);
      if (!el) { setPos(null); return; }
      const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const cw = card.current?.offsetWidth || 280, ch = card.current?.offsetHeight || 160;
      const cx = r.left + r.width / 2 - s.left;
      const left = Math.max(8, Math.min(s.width - cw - 8, cx - cw / 2));
      const above = r.top - s.top - ch - 14;
      const below = above < 8;
      const top = below ? Math.min(s.height - ch - 8, r.bottom - s.top + 14) : above;
      setPos({ left, top, below });
    };
    place();
    raf = requestAnimationFrame(place);
    const ro = new ResizeObserver(place);
    ro.observe(stage);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, stage, ...deps]);
  return { pos, card };
}

export default function Inspector({ stage }: { stage: HTMLElement | null }) {
  const selectedId = useBoard((s) => s.selectedId);
  const board = useBoard((s) => s.board);
  const isPlaying = useBoard((s) => s.isPlaying);
  const tool = useBoard((s) => s.tool);
  const { pos, card } = usePlacement(isPlaying || tool !== "move" ? null : selectedId, stage, [board, selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && useBoard.getState().selectedId) useBoard.getState().select(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!selectedId || isPlaying || tool !== "move") return null;
  const body = renderBody(selectedId, board);
  if (!body) return null;
  return (
    <div ref={card} className={`insp ${pos ? "" : "is-measuring"} ${pos?.below ? "is-below" : ""}`} style={pos ? { left: pos.left, top: pos.top } : undefined}
      role="dialog" aria-label="Seçili öğe" onPointerDown={(e) => e.stopPropagation()}>
      {body}
    </div>
  );
}

const commit = (fn: (b: BoardState) => BoardState, key?: string) => useBoard.getState().commit(fn, key);
const close = () => useBoard.getState().select(null);
const remove = (id: string) => { commit((b) => eraseFrom(b, id)); close(); };

function Head({ title, sub, onDelete, children }: { title: string; sub?: string; onDelete?: () => void; children?: React.ReactNode }) {
  return (
    <header className="insp-head">
      {children}
      <div className="insp-title"><strong>{title}</strong>{sub && <span>{sub}</span>}</div>
      {onDelete && <button className="ibtn insp-del" onClick={onDelete} aria-label="Sil" title="Sil"><Icon name="trash" size={17} /></button>}
      <button className="ibtn" onClick={close} aria-label="Kapat"><Icon name="close" size={17} /></button>
    </header>
  );
}

function renderBody(id: string, b: BoardState) {
  const kind = id[0];
  if (kind === "h" || kind === "a") {
    const away = kind === "a";
    const p = (away ? b.oppPlayers : b.players).find((x) => x.id === id);
    return p ? <PlayerBody p={p} away={away} b={b} /> : null;
  }
  if (kind === "e") {
    const it = b.equipment.find((x) => x.id === id);
    if (!it) return null;
    const def = equipDef(it.type);
    const ang = Math.round((((it.ang != null ? it.ang : (it.rot || 0) * 90) % 360) + 360) % 360);
    const upd = (patch: object) => commit((bd) => ({ ...bd, equipment: bd.equipment.map((x) => (x.id === id ? { ...x, ...patch } : x)) }), `eq-${id}`);
    const sc = it.sc || 1;
    return (
      <>
        <Head title={def.label} sub={`Boyut %${Math.round(sc * 100)}${def.rotatable ? ` · Yön ${ang}°` : ""}`} onDelete={() => remove(id)} />
        <div className="insp-row">
          {def.rotatable && (
            <div className="insp-group" aria-label="Döndür">
              <button className="ibtn" onClick={() => upd({ ang: (ang + 315) % 360 })} aria-label="Sola döndür"><Icon name="rotate" size={17} className="flip" /></button>
              <button className="ibtn" onClick={() => upd({ ang: (ang + 45) % 360 })} aria-label="Sağa döndür"><Icon name="rotate" size={17} /></button>
            </div>
          )}
          <div className="insp-group" aria-label="Boyut">
            <button className="ibtn" disabled={sc <= 0.5} onClick={() => upd({ sc: Math.max(0.5, +(sc - 0.1).toFixed(2)) })} aria-label="Küçült"><Icon name="minus" size={17} /></button>
            <button className="ibtn" disabled={sc >= 2.2} onClick={() => upd({ sc: Math.min(2.2, +(sc + 0.1).toFixed(2)) })} aria-label="Büyüt"><Icon name="plus" size={17} /></button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const nid = uid("e");
            commit((bd) => ({ ...bd, equipment: [...bd.equipment, { ...it, id: nid, x: Math.min(it.x + 3, 67), y: it.y + 2 }] }));
            useBoard.getState().select(nid);
          }}><Icon name="duplicate" size={15} />Çoğalt</button>
        </div>
      </>
    );
  }
  if (kind === "b") {
    const ball = b.balls.find((x) => x.id === id);
    if (!ball) return null;
    return (
      <>
        <Head title="Top" onDelete={() => remove(id)} />
        <Segmented label="Top tasarımı" size="sm" value={ball.style} onChange={(v) => commit((bd) => ({ ...bd, balls: bd.balls.map((x) => (x.id === id ? { ...x, style: v } : x)) }))} options={BALL_STYLES} />
      </>
    );
  }
  if (kind === "t") {
    const t = b.texts.find((x) => x.id === id);
    if (!t) return null;
    const upd = (patch: object, key?: string) => commit((bd) => ({ ...bd, texts: bd.texts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }), key);
    return (
      <>
        <Head title="Metin" onDelete={() => remove(id)} />
        <input className="input" value={t.content} onChange={(e) => upd({ content: e.target.value.slice(0, 60) }, `txt-${id}`)} aria-label="Metin" />
        <Segmented label="Boyut" size="sm" value={String(t.size)} onChange={(v) => upd({ size: Number(v) })} options={TEXT_SIZES.map((s, i) => ({ id: String(s), label: ["Küçük", "Orta", "Büyük", "Dev"][i] }))} />
        <Swatches label="Renk" value={t.color} onChange={(c) => upd({ color: c })} colors={["#F4F4F7", ...DRAW_COLORS.slice(1)]} custom={false} />
      </>
    );
  }
  if (kind === "g") {
    const g = b.logos.find((x) => x.id === id);
    if (!g) return null;
    const upd = (size: number) => commit((bd) => ({ ...bd, logos: bd.logos.map((x) => (x.id === id ? { ...x, size } : x)) }), `logo-${id}`);
    return (
      <>
        <Head title="Görsel" sub={`Boyut ${g.size}`} onDelete={() => remove(id)} />
        <div className="insp-row">
          <div className="insp-group" aria-label="Boyut">
            <button className="ibtn" disabled={g.size <= 3} onClick={() => upd(Math.max(3, g.size - 2))} aria-label="Küçült"><Icon name="minus" size={17} /></button>
            <button className="ibtn" disabled={g.size >= 30} onClick={() => upd(Math.min(30, g.size + 2))} aria-label="Büyüt"><Icon name="plus" size={17} /></button>
          </div>
        </div>
      </>
    );
  }
  if (kind === "s") {
    const s = b.strokes.find((x) => x.id === id);
    if (!s) return null;
    const upd = (patch: object) => commit((bd) => ({ ...bd, strokes: bd.strokes.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    const isLine = s.tool === "line" || s.tool === "arrow" || s.tool === "darrow";
    return (
      <>
        <Head title={STROKE_LABELS[s.tool]} onDelete={() => remove(id)} />
        <Swatches label="Renk" value={s.color} onChange={(c) => upd({ color: c })} colors={DRAW_COLORS} custom={false} />
        {isLine && (
          <Segmented label="Çizgi türü" size="sm" value={s.tool} onChange={(v) => upd({ tool: v })}
            options={[{ id: "arrow", label: "Ok" }, { id: "darrow", label: "Kesik ok" }, { id: "line", label: "Çizgi" }]} />
        )}
        {isLine && s.c && <button className="btn btn-ghost btn-sm" onClick={() => upd({ c: undefined, curve: undefined })}><Icon name="line" size={15} />Düzleştir</button>}
      </>
    );
  }
  return null;
}

function PlayerBody({ p, away, b }: { p: Player; away: boolean; b: BoardState }) {
  const key: keyof BoardState = away ? "oppPlayers" : "players";
  const upd = (patch: Partial<Player>, mk?: string) => commit((bd) => ({ ...bd, [key]: (bd[key] as Player[]).map((x) => (x.id === p.id ? { ...x, ...patch } : x)) }), mk);
  const color = isKeeper(p.role) ? "#8D8E96" : away ? b.oppColor : b.teamColor;
  return (
    <>
      <Head title={p.name || "İsimsiz oyuncu"} sub={`${away ? "Rakip" : "Ev sahibi"} · ${ROLE_NAMES[p.role] || p.role}`}>
        <span className="insp-dot" style={{ background: color }}>{String(p.number ?? "")}</span>
      </Head>
      <div className="insp-fields">
        <label className="field"><span className="field-label">No</span>
          <input className="input insp-num" value={String(p.number ?? "")} maxLength={3} onChange={(e) => upd({ number: e.target.value.slice(0, 3) }, `n-${p.id}`)} />
        </label>
        <label className="field"><span className="field-label">İsim</span>
          <input className="input" value={p.name} onChange={(e) => upd({ name: e.target.value.slice(0, 24) }, `nm-${p.id}`)} placeholder="Oyuncu adı" />
        </label>
      </div>
      <div className="insp-vest">
        <span className="field-label">Yelek</span>
        <div className="swatches" role="radiogroup" aria-label="Yelek">
          <button role="radio" aria-checked={!p.vest} className="sw sw-none" aria-label="Yelek yok" onClick={() => upd({ vest: null })} />
          {VESTS.map((c) => <button key={c} role="radio" aria-checked={p.vest === c} aria-label={c} className="sw" style={{ "--c": c } as React.CSSProperties} onClick={() => upd({ vest: c })} />)}
        </div>
      </div>
    </>
  );
}

