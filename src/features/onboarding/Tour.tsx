import { useCallback, useEffect, useRef, useState } from "react";
import type { PanelId } from "../../model/types";
import { useBoard } from "../../store/board";
import { useUI } from "../../store/ui";
import Coach from "./Coach";
import "./tour.css";

/* First-visit guide. Yılmaz Hoca offers a short tour, then spotlights each part of the
   board in turn. The choice is remembered; the ? button in the top bar starts it again. */

const KEY = "mb_tour_v3";
const readFlag = () => { try { return window.localStorage.getItem(KEY); } catch { return null; } };
const writeFlag = (v: string) => { try { window.localStorage.setItem(KEY, v); } catch { /* storage blocked */ } };
const q = (sel: string) => document.querySelector(sel);

type Step = { title: string; text: string; tip?: string; target: () => Element | null; panel?: PanelId | null; last?: boolean };

const panelStep = (panel: PanelId, title: string, text: string, tip?: string): Step => ({ title, text, tip, panel, target: () => q(".dock") });

const STEPS: Step[] = [
  { title: "Burası senin tahtan", text: "Oyuncuları parmağınla ya da fareyle sürükle. Bir oyuncuya dokunursan yanında küçük bir düzenleyici açılır: numara, isim ve yelek oradan değişir.", target: () => q(".board-svg"), panel: null },
  { title: "Paneller", text: "Sağdaki şeritte bütün ayarlar duruyor: takım, forma, saha, çizim, nesneler, sahneler ve kayıtlar. Bir sekmeye basınca paneli açılır, yeniden basınca kapanır.", target: () => q(".rail"), panel: null },
  panelStep("team", "Takım ve kadro", "Dizilişi küçük saha resimlerinden seç; oyuncular yerine geçer. Üstten rakibe geçip onun dizilişini de kurarsın. Kadroda numara ve isimleri yazar, oyuncu sayısını değiştirirsin.", "Dizilişten sonra oyuncuları yine elle sürükleyebilirsin."),
  panelStep("kit", "Forma", "Ana rengi, ikinci rengi ve deseni seç. Ev sahibi ve rakip ayrı ayrı ayarlanır."),
  panelStep("pitch", "Saha", "Perspektif ile kuş bakışı arasında geç, çim rengini ve biçim desenini seç. Üçte birler, half-space ve pozisyonel oyun katmanlarını da buradan açarsın."),
  panelStep("objects", "Malzeme ve top", "Kaleler, şapkalar, mankenler, merdiven ve toplar burada. Birini seç, sahaya dokun. Eklediğin nesneye dokunursan döndürür, büyütür ya da silersin."),
  { title: "Araçlar", text: "Soldaki çubuk çizim araçların. Köşesinde küçük ok olan düğmelere yeniden basınca ok, kesik ok, eğri ok ya da bölge gibi diğer araçlar açılır.", target: () => q(".toolpill"), panel: null },
  { title: "Sahneler ve video", text: "Alttaki şeritte + ile o anki düzeni sahne yaparsın. Oyuncuları taşı, bir sahne daha ekle ve oynat: oyuncular sahneler arasında akarak hareket eder. Dışa aktar menüsü görsel ya da video indirir.", target: () => q(".timeline"), panel: null },
  { title: "Geri al ve yinele", text: "Yaptığın her şey geri alınabilir. Bilgisayarda Ctrl+Z ve Ctrl+Shift+Z ile de çalışır.", target: () => q('[data-tour="undo"]'), panel: null },
  { title: "Hesabın", text: "Ücretsiz bir hesapla taktiklerini buluta kaydedip başka cihazdan açarsın. Hesapsız da çalışabilirsin; tahtan bu tarayıcıda saklanır.", target: () => q('[data-tour="account"]'), panel: null },
  { title: "Hazırsın", text: "Takılırsan sağ üstteki ? düğmesiyle beni yeniden çağırabilirsin. Kolay gelsin, hocam.", target: () => q('[data-tour="help"]') || q(".tb-narrow"), panel: null, last: true },
];

function useTypewriter(text: string, active: boolean): [string, boolean, () => void] {
  const [n, setN] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (!active) return;
    if (reduced) { setN(text.length); return; }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => { i += 1; setN((p) => Math.max(p, i)); if (i >= text.length) window.clearInterval(id); }, 14);
    return () => window.clearInterval(id);
  }, [text, active, reduced]);
  return [text.slice(0, n), n >= text.length, () => setN(text.length)];
}

type Rect = { x: number; y: number; w: number; h: number };
const rectOf = (el: Element | null): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width < 2 || r.height < 2 ? null : { x: r.left, y: r.top, w: r.width, h: r.height };
};
const same = (a: Rect | null, b: Rect | null) => (!a && !b) || (!!a && !!b && Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1 && Math.abs(a.h - b.h) < 1);
const hits = (a: Rect, b: Rect, m = 14) => a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y;

export default function Tour() {
  const [mode, setMode] = useState<"off" | "intro" | "tour">("off");
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pop, setPop] = useState(0);
  const timer = useRef<number>();

  const step = mode === "tour" ? STEPS[idx] : null;
  const intro = "Masterclass Board'a hoş geldin. Ben Yılmaz Hoca. Tahtayı birlikte kısaca gezelim; bir buçuk dakika sürer. İstersen şimdilik atla, beni sağ üstteki ? düğmesiyle her zaman çağırabilirsin.";
  const [shown, done, finishTyping] = useTypewriter(mode === "intro" ? intro : step ? step.text : "", mode !== "off");

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (readFlag()) return;
      if (/access_token|type=recovery|type=signup/.test(window.location.hash || "")) return;
      setMode("intro"); setPop((p) => p + 1);
    }, 1200);
    const onStart = () => { setIdx(0); setMode("intro"); setPop((p) => p + 1); };
    window.addEventListener("mb-tour-start", onStart);
    return () => { window.clearTimeout(t); window.removeEventListener("mb-tour-start", onStart); };
  }, []);

  const finish = useCallback((flag: string) => {
    window.clearTimeout(timer.current);
    writeFlag(flag);
    setMode("off"); setRect(null);
  }, []);

  // open the step's panel (or close panels) before spotlighting
  useEffect(() => {
    if (mode !== "tour") return;
    const s = STEPS[idx];
    useUI.getState().set({ flyout: null });
    useBoard.getState().select(null);
    if (s.panel !== undefined) useBoard.getState().setPanel(s.panel);
    setPop((p) => p + 1);
  }, [mode, idx]);

  useEffect(() => {
    if (mode !== "tour") { setRect(null); return; }
    const tick = () => {
      const r = rectOf(STEPS[idx].target());
      setRect((prev) => (same(prev, r) ? prev : r));
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    tick();
    const id = window.setInterval(tick, 90);
    window.addEventListener("resize", tick);
    return () => { window.clearInterval(id); window.removeEventListener("resize", tick); };
  }, [mode, idx]);

  const next = useCallback(() => {
    if (mode === "intro") { setIdx(0); setMode("tour"); return; }
    if (!done) { finishTyping(); return; }
    if (STEPS[idx].last) { finish("done"); return; }
    setIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }, [mode, idx, done, finishTyping, finish]);
  const back = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (mode === "off") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); next(); }
      else if (e.key === "ArrowLeft" && mode === "tour") { e.preventDefault(); e.stopPropagation(); back(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(mode === "intro" ? "skipped" : "done"); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [mode, next, back, finish]);

  if (mode === "off") return null;

  // put the guide in the corner that does not cover the highlighted area
  const small = vp.w < 700;
  const gw = small ? vp.w - 16 : Math.min(480, vp.w - 40);
  const gh = small ? 240 : 250;
  const corners = small
    ? [{ v: "bottom", h: "right" }, { v: "top", h: "right" }]
    : [{ v: "bottom", h: "left" }, { v: "bottom", h: "right" }, { v: "top", h: "left" }, { v: "top", h: "right" }];
  let pos = { ...corners[0], w: gw };
  if (rect) {
    for (const c of corners) {
      const gy = c.v === "bottom" ? vp.h - gh : 70;
      const gx = c.h === "right" ? vp.w - 16 - gw : 16;
      if (!hits({ x: gx, y: gy, w: gw, h: gh }, rect)) { pos = { ...c, w: gw }; break; }
    }
  }
  const isIntro = mode === "intro";
  const pad = 6;
  const spot = rect ? { left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2 } : null;

  return (
    <div className="tour">
      <div className="tour-block" />
      {spot ? <div className="tour-spot" style={spot} /> : <div className="tour-dim" />}
      <div className={`tour-guide at-${pos.v}-${pos.h}`} role="dialog" aria-live="polite" aria-label="Yılmaz Hoca" style={{ width: pos.w }}>
        <div className="tour-bubble" key={pop}>
          <div className="tour-head">
            <strong>{isIntro ? "Merhaba, ben Yılmaz Hoca" : step!.title}</strong>
            {!isIntro && <span className="num">{idx + 1}/{STEPS.length}</span>}
          </div>
          <p className="tour-text" onClick={finishTyping}>{shown}<span className={`tour-caret ${done ? "is-off" : ""}`} /></p>
          {!isIntro && step!.tip && done && <p className="tour-tip">{step!.tip}</p>}
          {!isIntro && <div className="tour-progress"><span style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }} /></div>}
          <div className="tour-actions">
            {isIntro ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => finish("skipped")}>Şimdilik atla</button>
                <span className="tour-spacer" />
                <button className="btn btn-primary btn-sm" onClick={next}>Turu başlat</button>
              </>
            ) : (
              <>
                <button className="link tour-close" onClick={() => finish("done")}>Turu kapat</button>
                <span className="tour-spacer" />
                {idx > 0 && <button className="btn btn-secondary btn-sm" onClick={back}>Geri</button>}
                <button className="btn btn-primary btn-sm" onClick={next}>{step!.last && done ? "Bitir" : "İleri"}</button>
              </>
            )}
          </div>
        </div>
        <div className="tour-coach"><Coach talking={!done} waving={isIntro || idx === 0} /></div>
      </div>
    </div>
  );
}
