import { useState } from "react";
import { FORMATION_KEYS, ROLE_NAMES } from "../../../model/constants";
import { buildTeam, remapFormation } from "../../../model/board";
import type { BoardState, LabelMode, Player } from "../../../model/types";
import { useBoard } from "../../../store/board";
import { Icon } from "../../../ui/icons";
import { Section, Segmented, Slider } from "../../../ui/kit";
import { FormationThumb } from "../thumbs";

type Side = "home" | "away";

export default function TeamPanel() {
  const board = useBoard((s) => s.board);
  const commit = useBoard((s) => s.commit);
  const [side, setSide] = useState<Side>("home");
  const away = side === "away";
  const list = away ? board.oppPlayers : board.players;
  const fKey = away ? board.oppFormationKey : board.formationKey;
  const listKey: keyof BoardState = away ? "oppPlayers" : "players";
  const prefix = away ? "a" : "h";

  const applyFormation = (k: string) => commit((b) => (away
    ? { ...b, oppFormationKey: k, oppPlayers: remapFormation(b.oppPlayers, k, "a", false), showOpponent: true }
    : { ...b, formationKey: k, players: remapFormation(b.players, k, "h", true) }));
  const setCount = (n: number) => commit((b) => ({
    ...b,
    [listKey]: buildTeam(n, prefix, !away, b[listKey] as Player[]),
    ...(away ? { showOpponent: n > 0 } : {}),
  }));
  const edit = (id: string, field: "number" | "name", v: string) =>
    commit((b) => ({ ...b, [listKey]: (b[listKey] as Player[]).map((p) => (p.id === id ? { ...p, [field]: field === "number" ? v.slice(0, 3) : v.slice(0, 24) } : p)) }), `edit-${id}-${field}`);
  const hidden = away && !board.showOpponent;

  return (
    <>
      <Section title="Takım">
        <Segmented<Side> label="Takım" value={side} onChange={setSide} options={[{ id: "home", label: "Ev sahibi" }, { id: "away", label: "Rakip" }]} />
        {away && (
          <label className="switch-row">
            <span>Rakibi sahada göster</span>
            <input type="checkbox" className="switch" checked={board.showOpponent} onChange={(e) => commit((b) => ({ ...b, showOpponent: e.target.checked, oppPlayers: e.target.checked && !b.oppPlayers.length ? remapFormation([], b.oppFormationKey, "a", false) : b.oppPlayers }))} />
          </label>
        )}
      </Section>

      <Section title="Diziliş">
        <div className={`thumb-grid ${hidden ? "is-muted" : ""}`}>
          {FORMATION_KEYS.map((k) => (
            <button key={k} className={`thumb ${fKey === k && list.length === 11 ? "is-on" : ""}`} aria-pressed={fKey === k} onClick={() => applyFormation(k)}>
              <FormationThumb k={k} away={away} />
              <span className="thumb-label num">{k}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Kadro" action={
        <div className="stepper" aria-label="Oyuncu sayısı">
          <button aria-label="Bir oyuncu çıkar" disabled={list.length === 0} onClick={() => setCount(list.length - 1)}><Icon name="minus" size={15} /></button>
          <output className="num">{list.length}</output>
          <button aria-label="Bir oyuncu ekle" disabled={list.length >= 11} onClick={() => setCount(list.length + 1)}><Icon name="plus" size={15} /></button>
        </div>
      }>
        {list.length === 0 ? (
          <div className="empty">
            <p>Sahada bu takımdan oyuncu yok.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => applyFormation(fKey)}>{fKey} dizilişiyle ekle</button>
          </div>
        ) : (
          <ol className="roster">
            {list.map((p) => (
              <li key={p.id} className="roster-row">
                <input className="input roster-num num" value={String(p.number ?? "")} maxLength={3} onChange={(e) => edit(p.id, "number", e.target.value)} aria-label="Forma numarası" placeholder="–" />
                <input className="input roster-name" value={p.name} onChange={(e) => edit(p.id, "name", e.target.value)} aria-label="Oyuncu adı" placeholder="Oyuncu adı" />
                <span className="roster-role" title={ROLE_NAMES[p.role] || p.role}>{p.role}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Etiketler">
        <Segmented<LabelMode> label="Oyuncu etiketi" value={board.labelMode} onChange={(v) => commit((b) => ({ ...b, labelMode: v }))}
          options={[{ id: "names", label: "İsim" }, { id: "roles", label: "Mevki" }, { id: "none", label: "Yok" }]} />
      </Section>

      <Section title="Boyutlar">
        <Slider label="Oyuncu" value={Math.round(board.playerScale * 100)} min={60} max={160} step={5} format={(v) => `%${v}`}
          onChange={(v) => commit((b) => ({ ...b, playerScale: v / 100 }), "playerScale")} />
        <Slider label="Top" value={Math.round(board.ballScale * 100)} min={50} max={200} step={5} format={(v) => `%${v}`}
          onChange={(v) => commit((b) => ({ ...b, ballScale: v / 100 }), "ballScale")} />
      </Section>
    </>
  );
}
