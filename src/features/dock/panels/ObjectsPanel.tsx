import { useRef } from "react";
import { BALL_STYLES, EQUIPMENT, EQUIP_GROUPS, presetOf } from "../../../model/constants";
import { uid } from "../../../model/board";
import { useBoard } from "../../../store/board";
import { EquipGlyph, EQUIP_THUMB_ANG, equipThumbVB } from "../../../canvas/layers/Equipment";
import { BallGlyph } from "../../../canvas/layers/Ball";
import { Icon } from "../../../ui/icons";
import { Button, Section } from "../../../ui/kit";

export default function ObjectsPanel() {
  const tool = useBoard((s) => s.tool);
  const equipPick = useBoard((s) => s.equipPick);
  const ballStyle = useBoard((s) => s.ballStyle);
  const logos = useBoard((s) => s.board.logos);
  const commit = useBoard((s) => s.commit);
  const fileRef = useRef<HTMLInputElement>(null);
  const st = useBoard.getState;

  const pickEquip = (id: typeof equipPick) => { st().setEquipPick(id); if (window.innerWidth < 820) st().setPanel(null); };
  const pickBall = (id: typeof ballStyle) => { st().setBallStyle(id); if (window.innerWidth < 820) st().setPanel(null); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 2_500_000) { st().notify("Görsel en fazla 2,5 MB olabilir."); return; }
    const r = new FileReader();
    r.onload = () => {
      const cfg = presetOf(st().board.pitchId);
      const id = uid("g");
      commit((b) => ({ ...b, logos: [...b.logos, { id, x: cfg.W / 2, y: cfg.H / 2, src: String(r.result), size: 8 }] }));
      st().select(id);
    };
    r.readAsDataURL(f);
  };

  return (
    <>
      {EQUIP_GROUPS.map((g) => (
        <Section key={g.id} title={g.label}>
          <div className="thumb-grid">
            {EQUIPMENT.filter((e) => e.group === g.id).map((e) => (
              <button key={e.id} className={`thumb thumb-obj ${tool === "equip" && equipPick === e.id ? "is-on" : ""}`} onClick={() => pickEquip(e.id)}>
                <svg viewBox={equipThumbVB(e.id)} className="thumb-glyph" aria-hidden="true"><EquipGlyph type={e.id} sq={0.5} ang={EQUIP_THUMB_ANG[e.id] || 0} /></svg>
                <span className="thumb-label">{e.label}</span>
              </button>
            ))}
          </div>
        </Section>
      ))}

      <Section title="Toplar">
        <div className="thumb-grid thumb-grid-4">
          {BALL_STYLES.map((b) => (
            <button key={b.id} className={`thumb thumb-obj ${tool === "ball" && ballStyle === b.id ? "is-on" : ""}`} onClick={() => pickBall(b.id)}>
              <svg viewBox="-2 -2.1 4 4.4" className="thumb-glyph" aria-hidden="true"><BallGlyph style={b.id} /></svg>
              <span className="thumb-label">{b.label}</span>
            </button>
          ))}
        </div>
        <p className="note">Birini seç, sonra sahada bir yere dokun. Eklediğin nesneye dokunursan döndürebilir, boyutunu değiştirebilir ya da silebilirsin.</p>
      </Section>

      <Section title="Logo ve görsel">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={onFile} />
        <Button icon="upload" onClick={() => fileRef.current?.click()}>Görsel yükle</Button>
        {logos.length > 0 && (
          <ul className="list">
            {logos.map((g, i) => (
              <li key={g.id} className="list-row">
                <img src={g.src} alt="" className="list-img" />
                <span className="list-name">Görsel {i + 1}</span>
                <button className="ibtn" aria-label="Seç" onClick={() => st().select(g.id)}><Icon name="select" size={17} /></button>
                <button className="ibtn" aria-label="Sil" onClick={() => commit((b) => ({ ...b, logos: b.logos.filter((x) => x.id !== g.id) }))}><Icon name="trash" size={17} /></button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
