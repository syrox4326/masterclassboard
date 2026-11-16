import { GRASS_COLORS, GRASS_PATTERNS, ZONE_MODES, grassOf, presetOf } from "../../../model/constants";
import { useBoard, type Orientation } from "../../../store/board";
import { useUI } from "../../../store/ui";
import { Icon } from "../../../ui/icons";
import { Section, Segmented, Tip } from "../../../ui/kit";
import { GrassThumb, ZoneThumb } from "../thumbs";

export default function PitchPanel() {
  const board = useBoard((s) => s.board);
  const commit = useBoard((s) => s.commit);
  const orientation = useBoard((s) => s.orientation);
  const setOrientation = useBoard((s) => s.setOrientation);
  const grass = grassOf(board.grassColor);
  const preset = presetOf(board.pitchId);

  return (
    <>
      <Section title="Saha">
        <button className="row-card" onClick={() => useUI.getState().set({ newBoard: true })}>
          <Icon name="pitch" size={20} />
          <span><strong>{preset.label}</strong><small>{preset.hint}</small></span>
          <span className="row-card-action">Değiştir</span>
        </button>
      </Section>

      <Section title="Görünüm">
        <Segmented label="Bakış açısı" value={board.perspective ? "3d" : "flat"} onChange={(v) => commit((b) => ({ ...b, perspective: v === "3d" }))}
          options={[{ id: "3d", label: "Perspektif" }, { id: "flat", label: "Kuş bakışı" }]} />
        <Segmented<Orientation> label="Saha yönü" value={orientation} onChange={setOrientation}
          options={[{ id: "auto", label: "Otomatik" }, { id: "landscape", label: "Yatay" }, { id: "portrait", label: "Dikey" }]} />
      </Section>

      <Section title="Çim rengi" action={<span className="sec-meta">{grass.label}</span>}>
        <div className="swatches" role="radiogroup" aria-label="Çim rengi">
          {GRASS_COLORS.map((g) => (
            <Tip key={g.id} label={g.label} side="top">
              <button role="radio" aria-checked={board.grassColor === g.id} aria-label={g.label} className="sw sw-grass"
                style={{ "--c": g.a, "--c2": g.b } as React.CSSProperties} onClick={() => commit((b) => ({ ...b, grassColor: g.id }))} />
            </Tip>
          ))}
        </div>
      </Section>

      <Section title="Biçim deseni">
        <div className="thumb-grid thumb-grid-4">
          {GRASS_PATTERNS.map((p) => (
            <button key={p.id} className={`thumb ${board.grassPattern === p.id ? "is-on" : ""}`} aria-pressed={board.grassPattern === p.id} onClick={() => commit((b) => ({ ...b, grassPattern: p.id }))}>
              <GrassThumb pattern={p.id} a={grass.a} b={grass.b} />
              <span className="thumb-label">{p.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Taktik bölgeleri">
        <div className="thumb-grid">
          {ZONE_MODES.map((z) => (
            <button key={z.id} className={`thumb ${board.zoneMode === z.id ? "is-on" : ""}`} aria-pressed={board.zoneMode === z.id} onClick={() => commit((b) => ({ ...b, zoneMode: z.id }))}>
              <ZoneThumb mode={z.id} />
              <span className="thumb-label">{z.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
