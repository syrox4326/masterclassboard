import { useBoard } from "../../../store/board";
import { Icon } from "../../../ui/icons";
import { Button, Section, Slider } from "../../../ui/kit";
import { playScenes, stopPlayback } from "../../playback/playback";
import { SceneThumb } from "../thumbs";

export default function ScenesPanel() {
  const scenes = useBoard((s) => s.scenes);
  const active = useBoard((s) => s.activeScene);
  const isPlaying = useBoard((s) => s.isPlaying);
  const speed = useBoard((s) => s.playSpeed);
  const st = useBoard.getState;

  const add = () => { const s = st(); s.setScenes((l) => [...l, s.board]); s.setActiveScene(s.scenes.length); };
  const open = (i: number) => { const s = st(); s.load(s.scenes[i]); s.setActiveScene(i); };
  const update = (i: number) => { const s = st(); s.setScenes((l) => l.map((x, j) => (j === i ? s.board : x))); s.notify(`Sahne ${i + 1} güncellendi.`); };
  const remove = (i: number) => { const s = st(); s.setScenes((l) => l.filter((_, j) => j !== i)); if (s.activeScene >= i) s.setActiveScene(Math.max(-1, s.activeScene - 1)); };
  const move = (i: number, d: number) => st().setScenes((l) => {
    const a = [...l]; const j = i + d;
    if (j < 0 || j >= a.length) return a;
    [a[i], a[j]] = [a[j], a[i]];
    return a;
  });

  return (
    <>
      <Section title="Animasyon nasıl yapılır">
        <ol className="steps">
          <li>Oyuncuları başlangıç düzenine koy, <b>Sahne ekle</b>.</li>
          <li>Oyuncuları ve topu taşı, yeni bir sahne ekle.</li>
          <li><b>Oynat</b>: oyuncular sahneler arasında akarak hareket eder.</li>
        </ol>
        <Button variant="primary" icon="plus" disabled={isPlaying} onClick={add}>Sahne ekle</Button>
      </Section>

      <Section title={`Sahneler (${scenes.length})`}>
        {scenes.length === 0 ? (
          <p className="note">Henüz sahne yok. Şu anki düzen ilk sahnen olabilir.</p>
        ) : (
          <ol className="scene-list">
            {scenes.map((s, i) => (
              <li key={i} className={`scene-row ${i === active ? "is-on" : ""}`}>
                <button className="scene-open" onClick={() => open(i)} disabled={isPlaying} aria-label={`Sahne ${i + 1}'i aç`}>
                  <SceneThumb s={s} />
                  <span className="scene-no num">{i + 1}</span>
                </button>
                <div className="scene-actions">
                  <button className="ibtn" onClick={() => update(i)} disabled={isPlaying} title="Şu anki düzenle güncelle" aria-label="Güncelle"><Icon name="refresh" size={17} /></button>
                  <button className="ibtn" onClick={() => move(i, -1)} disabled={isPlaying || i === 0} aria-label="Yukarı taşı"><Icon name="arrowUp" size={17} /></button>
                  <button className="ibtn" onClick={() => move(i, 1)} disabled={isPlaying || i === scenes.length - 1} aria-label="Aşağı taşı"><Icon name="arrowDown" size={17} /></button>
                  <button className="ibtn" onClick={() => remove(i)} disabled={isPlaying} aria-label="Sil"><Icon name="trash" size={17} /></button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Oynatma">
        <Slider label="Hız" value={speed} min={0.25} max={3} step={0.25} format={(v) => `${String(v).replace(".", ",")}×`} onChange={(v) => st().setPlaySpeed(v)} />
        <div className="btn-row">
          {isPlaying ? (
            <Button icon="stop" onClick={stopPlayback}>Durdur</Button>
          ) : (
            <>
              <Button icon="play" disabled={scenes.length < 2} onClick={() => playScenes(false)}>Oynat</Button>
              <Button icon="record" disabled={scenes.length < 2} onClick={() => playScenes(true)}>Video kaydet</Button>
            </>
          )}
        </div>
        <p className="note">Diziliş iki sahne arasında değişirse oyuncular o geçişte yeni yerlerine atlar.</p>
      </Section>
    </>
  );
}
