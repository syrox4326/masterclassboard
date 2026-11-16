import { useState } from "react";
import { DRAW_COLORS, TOOLS } from "../../model/constants";
import type { Tool } from "../../model/types";
import { useBoard } from "../../store/board";
import { useUI } from "../../store/ui";
import { Icon, type IconName } from "../../ui/icons";
import { Tip } from "../../ui/kit";
import "./toolpill.css";

const ICON: Partial<Record<Tool, IconName>> = {
  move: "select", link: "link", line: "line", arrow: "arrow", darrow: "darrow", curve: "curve", pen: "pen",
  rect: "rect", frect: "frect", zone: "zone", text: "text", eraser: "eraser",
};
type Group = { id: string; label: string; tools: Tool[] };
const GROUPS: Record<string, Group> = {
  draw: { id: "draw", label: "Çizim", tools: ["arrow", "darrow", "curve", "line", "pen"] },
  shape: { id: "shape", label: "Şekil", tools: ["zone", "rect", "frect"] },
};
const LAYOUT: (Tool | Group)[] = ["move", "link", GROUPS.draw, GROUPS.shape, "text", "eraser"];

export default function ToolPill() {
  const tool = useBoard((s) => s.tool);
  const setTool = useBoard((s) => s.setTool);
  const drawColor = useBoard((s) => s.drawColor);
  const setDrawColor = useBoard((s) => s.setDrawColor);
  const panel = useBoard((s) => s.panel);
  const setPanel = useBoard((s) => s.setPanel);
  const flyout = useUI((s) => s.flyout);
  const setUI = useUI((s) => s.set);
  const [last, setLast] = useState<Record<string, Tool>>({ draw: "arrow", shape: "zone" });
  const fly = (v: string | null) => setUI({ flyout: v });

  return (
    <div className="toolpill" role="toolbar" aria-label="Araçlar" aria-orientation="vertical" data-tour="tools">
      {LAYOUT.map((item) => {
        if (typeof item === "string") {
          const t = TOOLS[item];
          return (
            <Tip key={item} label={t.label} shortcut={t.key} side="right">
              <button className={`tp ${tool === item ? "is-on" : ""}`} aria-label={t.label} aria-pressed={tool === item} onClick={() => { setTool(item); fly(null); }}>
                <Icon name={ICON[item]!} size={20} />
              </button>
            </Tip>
          );
        }
        const active = item.tools.includes(tool);
        const cur = active ? tool : last[item.id];
        const t = TOOLS[cur];
        return (
          <div className="tp-group" key={item.id}>
            <Tip label={`${item.label}: ${t.label}`} shortcut={t.key} side="right">
              <button className={`tp ${active ? "is-on" : ""}`} aria-label={`${item.label} araçları`} aria-haspopup="menu" aria-expanded={flyout === item.id}
                onClick={() => { if (active) fly(flyout === item.id ? null : item.id); else { setTool(cur); fly(item.id); } }}>
                <Icon name={ICON[cur]!} size={20} />
                <span className="tp-more" aria-hidden="true" />
              </button>
            </Tip>
            {flyout === item.id && (
              <div className="tp-fly" role="menu" aria-label={item.label}>
                <div className="tp-fly-title">{item.label}</div>
                {item.tools.map((id) => {
                  const d = TOOLS[id];
                  return (
                    <button key={id} role="menuitemradio" aria-checked={tool === id} className={`tp-fly-item ${tool === id ? "is-on" : ""}`}
                      onClick={() => { setTool(id); setLast((l) => ({ ...l, [item.id]: id })); fly(null); }}>
                      <Icon name={ICON[id]!} size={18} /><span>{d.label}</span>{d.key && <kbd className="kbd">{d.key}</kbd>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <span className="tp-sep" />
      <Tip label="Malzeme ekle" side="right">
        <button className={`tp ${tool === "equip" || panel === "objects" ? "is-on" : ""}`} aria-label="Malzeme ekle" onClick={() => { fly(null); setPanel(panel === "objects" ? null : "objects"); }}>
          <Icon name="cone" size={20} />
        </button>
      </Tip>
      <Tip label="Top ekle" side="right">
        <button className={`tp ${tool === "ball" ? "is-on" : ""}`} aria-label="Top ekle" aria-pressed={tool === "ball"} onClick={() => { fly(null); setTool(tool === "ball" ? "move" : "ball"); }}>
          <Icon name="ball" size={20} />
        </button>
      </Tip>
      <div className="tp-group tp-group-end">
        <Tip label="Çizim rengi" side="right">
          <button className="tp tp-color" aria-label="Çizim rengi" aria-haspopup="menu" aria-expanded={flyout === "color"} onClick={() => fly(flyout === "color" ? null : "color")}>
            <span style={{ background: drawColor }} />
          </button>
        </Tip>
        {flyout === "color" && (
          <div className="tp-fly tp-fly-colors" role="menu" aria-label="Çizim rengi">
            <div className="tp-fly-title">Çizim rengi</div>
            <div className="tp-colors">
              {DRAW_COLORS.map((c) => (
                <button key={c} role="menuitemradio" aria-checked={drawColor === c} aria-label={c} className="sw" style={{ "--c": c } as React.CSSProperties}
                  onClick={() => { setDrawColor(c); fly(null); }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
