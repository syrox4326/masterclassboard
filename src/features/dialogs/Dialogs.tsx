import { useEffect, useState } from "react";
import { PITCH_PRESETS, TEXT_SIZES, TOOLS, type PitchPreset } from "../../model/constants";
import { remapFormation, uid } from "../../model/board";
import { useBoard } from "../../store/board";
import { useUI } from "../../store/ui";
import { eraseFrom } from "../../canvas/Board";
import { Icon } from "../../ui/icons";
import { Button, Dialog, Field, Kbd, Segmented, Swatches } from "../../ui/kit";
import "./dialogs.css";

/* ---------- new board ---------- */

function PresetThumb({ p }: { p: PitchPreset }) {
  // drawn to scale: a 7-a-side pitch looks smaller than a full one
  const w = (p.W / 68) * 58, h = (p.H / 105) * 90;
  const band = p.band;
  return (
    <svg viewBox="0 0 70 100" className="preset-svg" aria-hidden="true">
      <rect x="0" y="0" width="70" height="100" rx="6" fill="#3E8E41" />
      <g transform={`translate(${(70 - w) / 2},${(100 - h) / 2})`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1">
        {!p.noLines && <>
          <rect width={w} height={h} />
          <line x1="0" y1={h / 2} x2={w} y2={h / 2} />
          <circle cx={w / 2} cy={h / 2} r={w * 0.13} />
          <rect x={w * 0.2} width={w * 0.6} height={h * 0.16} />
          <rect x={w * 0.2} y={h * 0.84} width={w * 0.6} height={h * 0.16} />
        </>}
        {p.noLines && <rect width={w} height={h} strokeDasharray="3 3" />}
        {band && <rect x="-3" y={(band[0] / 105) * h} width={w + 6} height={((band[1] - band[0]) / 105) * h} fill="#fff" fillOpacity="0.2" stroke="none" />}
      </g>
    </svg>
  );
}

export function NewBoardDialog() {
  const open = useUI((s) => s.newBoard);
  const set = useUI((s) => s.set);
  const current = useBoard((s) => s.board.pitchId);
  const [pick, setPick] = useState(current);
  const [players, setPlayers] = useState<"keep" | "formation" | "empty">("keep");
  useEffect(() => { if (open) setPick(current); }, [open, current]);

  const go = () => {
    const st = useBoard.getState();
    st.commit((b) => {
      const base = { ...b, pitchId: pick, strokes: [], texts: [], balls: [], logos: [], links: [], equipment: [], zoneMode: "none" as const };
      if (players === "empty") return { ...base, players: [], oppPlayers: [], showOpponent: false };
      if (players === "formation") return { ...base, players: remapFormation([], b.formationKey, "h", true), oppPlayers: b.showOpponent ? remapFormation([], b.oppFormationKey, "a", false) : [] };
      return base;
    });
    st.setName("");
    st.setScenes(() => []);
    st.setActiveScene(-1);
    set({ newBoard: false });
  };

  return (
    <Dialog open={open} onClose={() => set({ newBoard: false })} size="lg" title="Yeni tahta" description="Saha türünü seç. Çizimler, nesneler ve sahneler temizlenir."
      footer={<><Button variant="ghost" onClick={() => set({ newBoard: false })}>Vazgeç</Button><Button variant="primary" onClick={go}>Tahtayı aç</Button></>}>
      <div className="preset-grid" role="radiogroup" aria-label="Saha türü">
        {PITCH_PRESETS.map((p) => (
          <button key={p.id} role="radio" aria-checked={pick === p.id} className={`preset ${pick === p.id ? "is-on" : ""}`} onClick={() => setPick(p.id)}>
            <PresetThumb p={p} />
            <strong>{p.label}</strong>
            <small>{p.hint}</small>
          </button>
        ))}
      </div>
      <Field label="Oyuncular">
        <Segmented label="Oyuncular" value={players} onChange={setPlayers}
          options={[{ id: "keep", label: "Yerinde kalsın" }, { id: "formation", label: "Dizilişe dönsün" }, { id: "empty", label: "Boş saha" }]} />
      </Field>
    </Dialog>
  );
}

/* ---------- new text ---------- */

export function TextDialog() {
  const t = useUI((s) => s.text);
  const set = useUI((s) => s.set);
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#F4F4F7");
  const [size, setSize] = useState(3);
  useEffect(() => { if (t) { setContent(t.content); setColor(t.color); setSize(t.size); } }, [t]);
  if (!t) return null;
  const save = () => {
    const st = useBoard.getState();
    if (content.trim()) {
      const id = uid("t");
      st.commit((b) => ({ ...b, texts: [...b.texts, { id, x: t.x, y: t.y, content: content.trim(), color, size }] }));
      st.setTool("move");
    }
    set({ text: null });
  };
  return (
    <Dialog open onClose={() => set({ text: null })} title="Metin ekle"
      footer={<><Button variant="ghost" onClick={() => set({ text: null })}>Vazgeç</Button><Button variant="primary" icon="check" disabled={!content.trim()} onClick={save}>Ekle</Button></>}>
      <Field label="Metin"><input className="input" autoFocus value={content} maxLength={60} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); }} placeholder="Ör. Pres hattı" /></Field>
      <Field label="Boyut">
        <Segmented label="Boyut" value={String(size)} onChange={(v) => setSize(Number(v))} options={TEXT_SIZES.map((s, i) => ({ id: String(s), label: ["Küçük", "Orta", "Büyük", "Dev"][i] }))} />
      </Field>
      <Field label="Renk"><Swatches label="Renk" value={color} onChange={setColor} colors={["#F4F4F7", "#F5E94A", "#EF4444", "#38BDF8", "#111827", "#22C55E", "#F97316"]} /></Field>
    </Dialog>
  );
}

/* ---------- shortcuts ---------- */

export function ShortcutsDialog() {
  const open = useUI((s) => s.shortcuts);
  const set = useUI((s) => s.set);
  const toolRows = ["move", "link", "arrow", "darrow", "curve", "line", "pen", "rect", "frect", "zone", "text", "eraser"].map((k) => [TOOLS[k].key!, TOOLS[k].label]);
  const rows: [string, string][] = [
    ...(toolRows as [string, string][]),
    ["Ctrl Z", "Geri al"], ["Ctrl ⇧ Z", "Yinele"], ["Delete", "Seçili öğeyi sil"], ["Esc", "Seçimi bırak"], ["?", "Bu liste"],
  ];
  return (
    <Dialog open={open} onClose={() => set({ shortcuts: false })} title="Klavye kısayolları" description="Bir yazı alanında değilken çalışır. Mac'te Ctrl yerine ⌘.">
      <div className="kbd-grid">
        {rows.map(([k, l]) => <div key={k} className="kbd-row"><span>{l}</span><span className="kbd-keys">{k.split(" ").map((x) => <Kbd key={x}>{x}</Kbd>)}</span></div>)}
      </div>
    </Dialog>
  );
}

/* ---------- context menu (right click / long press) ---------- */

export function ContextMenu() {
  const ctx = useUI((s) => s.ctx);
  const set = useUI((s) => s.set);
  useEffect(() => {
    if (!ctx) return;
    const close = (e: Event) => { if (e.target instanceof Element && e.target.closest(".ctx")) return; set({ ctx: null }); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") set({ ctx: null }); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); window.removeEventListener("resize", close); };
  }, [ctx, set]);
  if (!ctx) return null;
  const left = Math.max(8, Math.min(ctx.x, window.innerWidth - 200));
  const top = Math.max(8, Math.min(ctx.y, window.innerHeight - 110));
  return (
    <div className="ctx menu" style={{ left, top }} role="menu" onContextMenu={(e) => e.preventDefault()}>
      <div className="ctx-title">{ctx.label}</div>
      {ctx.id[0] !== "l" && (
        <button className="menu-item" role="menuitem" onClick={() => { useBoard.getState().select(ctx.id); set({ ctx: null }); }}><Icon name="edit" size={17} />Düzenle</button>
      )}
      <button className="menu-item menu-danger" role="menuitem" onClick={() => { useBoard.getState().commit((b) => eraseFrom(b, ctx.id)); set({ ctx: null }); }}><Icon name="trash" size={17} />Sil</button>
    </div>
  );
}

/* ---------- toast ---------- */

export function Toast() {
  const toast = useBoard((s) => s.toast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const t = window.setTimeout(() => setShown(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);
  return <div className="toast-host" aria-live="polite">{shown && <div className="toast" key={shown.id}><Icon name="check" size={16} />{shown.text}</div>}</div>;
}
