import { useState } from "react";
import { DRAW_COLORS, TEMPLATES, TOOLS } from "../../../model/constants";
import type { Tool } from "../../../model/types";
import { uid } from "../../../model/board";
import { useBoard } from "../../../store/board";
import { Icon, type IconName } from "../../../ui/icons";
import { Button, Section, Swatches } from "../../../ui/kit";
import { TemplateThumb } from "../thumbs";

const DRAW_TOOLS: { id: Tool; icon: IconName }[] = [
  { id: "arrow", icon: "arrow" }, { id: "darrow", icon: "darrow" }, { id: "curve", icon: "curve" }, { id: "line", icon: "line" },
  { id: "pen", icon: "pen" }, { id: "zone", icon: "zone" }, { id: "rect", icon: "rect" }, { id: "frect", icon: "frect" },
  { id: "link", icon: "link" }, { id: "text", icon: "text" }, { id: "eraser", icon: "eraser" },
];

export default function DrawPanel() {
  const tool = useBoard((s) => s.tool);
  const setTool = useBoard((s) => s.setTool);
  const drawColor = useBoard((s) => s.drawColor);
  const setDrawColor = useBoard((s) => s.setDrawColor);
  const commit = useBoard((s) => s.commit);
  const count = useBoard((s) => s.board.strokes.length + s.board.texts.length + s.board.links.length);
  const [confirm, setConfirm] = useState(false);

  const addTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    commit((b) => ({ ...b, strokes: [...b.strokes, ...t.strokes.map((s) => ({ ...s, id: uid("s"), points: s.points.map((p) => ({ ...p })) }))] }));
    useBoard.getState().notify(`"${t.label}" eklendi. Okları sürükleyip düzenleyebilirsin.`);
  };

  return (
    <>
      <Section title="Araç">
        <div className="tool-grid">
          {DRAW_TOOLS.map((t) => {
            const d = TOOLS[t.id];
            return (
              <button key={t.id} className={`tool-tile ${tool === t.id ? "is-on" : ""}`} aria-pressed={tool === t.id} onClick={() => setTool(t.id)}>
                <Icon name={t.icon} size={20} />
                <span>{d.label}</span>
                {d.key && <kbd className="kbd">{d.key}</kbd>}
              </button>
            );
          })}
        </div>
        {TOOLS[tool]?.hint && <p className="note">{TOOLS[tool].hint}</p>}
      </Section>

      <Section title="Renk">
        <Swatches label="Çizim rengi" value={drawColor} onChange={setDrawColor} colors={DRAW_COLORS} custom={false} />
      </Section>

      <Section title="Hazır kalıplar">
        <div className="thumb-grid">
          {TEMPLATES.map((t) => (
            <button key={t.id} className="thumb" onClick={() => addTemplate(t.id)}>
              <TemplateThumb t={t} />
              <span className="thumb-label">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Temizle">
        {!confirm ? (
          <Button variant="secondary" icon="trash" disabled={count === 0} onClick={() => setConfirm(true)}>Bütün çizimleri sil</Button>
        ) : (
          <div className="confirm-row">
            <span>{count} çizim silinecek.</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Vazgeç</Button>
            <Button size="sm" variant="danger" onClick={() => { commit((b) => ({ ...b, strokes: [], texts: [], links: [] })); setConfirm(false); }}>Sil</Button>
          </div>
        )}
      </Section>
    </>
  );
}
