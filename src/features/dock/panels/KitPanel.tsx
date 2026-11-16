import { useState } from "react";
import { KIT_DESIGNS } from "../../../model/constants";
import { useBoard } from "../../../store/board";
import { PlayerDisc } from "../../../canvas/layers/PlayerToken";
import { Section, Segmented, Swatches } from "../../../ui/kit";

export default function KitPanel() {
  const board = useBoard((s) => s.board);
  const commit = useBoard((s) => s.commit);
  const [side, setSide] = useState<"home" | "away">("home");
  const away = side === "away";
  const kit = away ? board.awayKit : board.homeKit;
  const col = away ? board.oppColor : board.teamColor;
  const setKit = (patch: Partial<typeof kit>) => commit((b) => (away ? { ...b, awayKit: { ...b.awayKit, ...patch } } : { ...b, homeKit: { ...b.homeKit, ...patch } }), `kit-${side}`);
  const setCol = (c: string) => commit((b) => (away ? { ...b, oppColor: c } : { ...b, teamColor: c }), `col-${side}`);
  const sample = (away ? board.oppPlayers[9] : board.players[9])?.number ?? 9;

  return (
    <>
      <Section title="Takım">
        <Segmented label="Takım" value={side} onChange={setSide} options={[{ id: "home", label: "Ev sahibi" }, { id: "away", label: "Rakip" }]} />
        <div className="kit-hero">
          <svg viewBox="-2.6 -2.5 5.2 5.4" width="92" height="96" aria-hidden="true"><PlayerDisc color={col} c2={kit.c2} design={kit.design} number={sample} /></svg>
          <div>
            <strong>{away ? "Rakip forması" : "Ev sahibi forması"}</strong>
            <span>{KIT_DESIGNS.find((d) => d.id === kit.design)?.label}</span>
          </div>
        </div>
      </Section>
      <Section title="Ana renk">
        <Swatches label="Ana renk" value={col} onChange={setCol} />
      </Section>
      <Section title="Desen">
        <div className="thumb-grid thumb-grid-4">
          {KIT_DESIGNS.map((d) => (
            <button key={d.id} className={`thumb thumb-kit ${kit.design === d.id ? "is-on" : ""}`} aria-pressed={kit.design === d.id} onClick={() => setKit({ design: d.id })} title={d.label}>
              <svg viewBox="-2.4 -2.3 4.8 5" className="thumb-token" aria-hidden="true"><PlayerDisc color={col} c2={kit.c2} design={d.id} number="" /></svg>
              <span className="thumb-label">{d.label}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="İkinci renk">
        <Swatches label="İkinci renk" value={kit.c2} onChange={(c) => setKit({ c2: c })} />
        {kit.design === "plain" && <p className="note">İkinci renk desenli formalarda görünür.</p>}
      </Section>
    </>
  );
}
