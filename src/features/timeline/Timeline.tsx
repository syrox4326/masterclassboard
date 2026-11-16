import * as Popover from "@radix-ui/react-popover";
import { useBoard } from "../../store/board";
import { Icon } from "../../ui/icons";
import { Tip } from "../../ui/kit";
import { playScenes, stopPlayback } from "../playback/playback";
import { exportImage } from "../export/capture";
import "./timeline.css";

const SPEEDS = [0.5, 1, 1.5, 2];

export default function Timeline() {
  const scenes = useBoard((s) => s.scenes);
  const active = useBoard((s) => s.activeScene);
  const isPlaying = useBoard((s) => s.isPlaying);
  const isRecording = useBoard((s) => s.isRecording);
  const recLabel = useBoard((s) => s.recLabel);
  const speed = useBoard((s) => s.playSpeed);
  const st = useBoard.getState;

  const addScene = () => {
    const s = st();
    s.setScenes((list) => [...list, s.board]);
    s.setActiveScene(s.scenes.length);
    s.notify(`Sahne ${s.scenes.length + 1} eklendi.`);
  };
  const openScene = (i: number) => { const s = st(); s.load(s.scenes[i]); s.setActiveScene(i); };
  const cycleSpeed = () => { const s = st(); s.setPlaySpeed(SPEEDS[(SPEEDS.indexOf(s.playSpeed) + 1) % SPEEDS.length] || 1); };
  const canPlay = scenes.length >= 2;

  return (
    <div className={`timeline ${isPlaying ? "is-playing" : ""}`} data-tour="timeline">
      <div className="tl-status" aria-live="polite">
        {isPlaying ? (isRecording ? <><span className="tl-rec" />{recLabel || "Kaydediliyor"}</> : "Oynatılıyor") : <span className="tl-title">Sahneler</span>}
      </div>
      <div className="tl-frames" role="list">
        {scenes.map((_, i) => (
          <Tip key={i} label={`Sahne ${i + 1}: aç`} side="top">
            <button role="listitem" className={`tl-frame ${i === active ? "is-on" : ""}`} disabled={isPlaying} onClick={() => openScene(i)}>{i + 1}</button>
          </Tip>
        ))}
        <Tip label="Şu anki düzeni yeni sahne yap" side="top">
          <button className="tl-frame tl-add" disabled={isPlaying} onClick={addScene} aria-label="Sahne ekle"><Icon name="plus" size={16} /></button>
        </Tip>
      </div>
      <span className="tl-sep" />
      {isPlaying ? (
        <Tip label="Durdur" side="top"><button className="tl-btn" onClick={stopPlayback} aria-label="Durdur"><Icon name="stop" size={16} /></button></Tip>
      ) : (
        <Tip label={canPlay ? "Sahneleri oynat" : "Oynatmak için en az iki sahne ekle"} side="top">
          <span><button className="tl-btn" disabled={!canPlay} onClick={() => playScenes(false)} aria-label="Oynat"><Icon name="play" size={16} /></button></span>
        </Tip>
      )}
      <Tip label="Oynatma hızı" side="top">
        <button className="tl-speed" onClick={cycleSpeed} aria-label={`Oynatma hızı ${speed}x`}>{String(speed).replace(".", ",")}×</button>
      </Tip>
      <span className="tl-sep" />
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="tl-export" data-tour="export" disabled={isPlaying}>
            <Icon name="download" size={17} /><span className="tl-export-label">Dışa aktar</span><Icon name="chevronDown" size={15} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="menu" side="top" align="end" sideOffset={10}>
            <Popover.Close asChild>
              <button className="menu-item" onClick={exportImage}><Icon name="download" size={17} />Görsel<small>PNG · 4K</small></button>
            </Popover.Close>
            <Popover.Close asChild>
              <button className="menu-item" disabled={!canPlay} onClick={() => playScenes(true)} title={canPlay ? undefined : "Video için en az iki sahne gerekli"}>
                <Icon name="record" size={17} />Animasyon videosu<small>{canPlay ? "MP4 · 1080p" : "En az 2 sahne"}</small>
              </button>
            </Popover.Close>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
