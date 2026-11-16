import type { PanelId } from "../../model/types";
import { useBoard } from "../../store/board";
import { Icon, type IconName } from "../../ui/icons";
import TeamPanel from "./panels/TeamPanel";
import KitPanel from "./panels/KitPanel";
import PitchPanel from "./panels/PitchPanel";
import DrawPanel from "./panels/DrawPanel";
import ObjectsPanel from "./panels/ObjectsPanel";
import ScenesPanel from "./panels/ScenesPanel";
import SavesPanel from "./panels/SavesPanel";
import "./dock.css";

export const TABS: { id: PanelId; label: string; title: string; icon: IconName }[] = [
  { id: "team", label: "Takım", title: "Takım ve kadro", icon: "team" },
  { id: "kit", label: "Forma", title: "Forma", icon: "kit" },
  { id: "pitch", label: "Saha", title: "Saha", icon: "pitch" },
  { id: "draw", label: "Çizim", title: "Çizim", icon: "pen" },
  { id: "objects", label: "Nesneler", title: "Malzeme ve top", icon: "objects" },
  { id: "scenes", label: "Sahneler", title: "Sahneler ve animasyon", icon: "scenes" },
  { id: "saves", label: "Kayıtlar", title: "Kayıtlarım", icon: "saves" },
];

const PANELS: Record<PanelId, () => JSX.Element> = {
  team: TeamPanel, kit: KitPanel, pitch: PitchPanel, draw: DrawPanel, objects: ObjectsPanel, scenes: ScenesPanel, saves: SavesPanel,
};

export function DockPanel() {
  const panel = useBoard((s) => s.panel);
  const setPanel = useBoard((s) => s.setPanel);
  if (!panel) return null;
  const tab = TABS.find((t) => t.id === panel)!;
  const Body = PANELS[panel];
  return (
    <>
      <div className="dock-scrim" onClick={() => setPanel(null)} />
      <aside className="dock" aria-label={tab.title}>
        <header className="dock-head">
          <h2>{tab.title}</h2>
          <button className="ibtn" onClick={() => setPanel(null)} aria-label="Paneli kapat"><Icon name="close" size={18} /></button>
        </header>
        <div className="dock-body" key={panel}><Body /></div>
      </aside>
    </>
  );
}

export function DockRail() {
  const panel = useBoard((s) => s.panel);
  const setPanel = useBoard((s) => s.setPanel);
  return (
    <nav className="rail" aria-label="Paneller">
      {TABS.map((t) => (
        <button key={t.id} className={`rail-tab ${panel === t.id ? "is-on" : ""}`} aria-pressed={panel === t.id} data-tour={`tab-${t.id}`}
          onClick={() => setPanel(panel === t.id ? null : t.id)}>
          <Icon name={t.icon} size={21} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
