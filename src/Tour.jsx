import React, { useEffect, useRef, useState, useCallback } from "react";

/* ------------------------------------------------------------------ *
 *  Rehber (ilk kullanım öğreticisi)
 *  - Açılışta "Turu başlat / Atla" seçeneği sunar, tercih hatırlanır.
 *  - Sağ alttan animasyonlu bir antrenör çıkar, sohbet baloncuğunda
 *    her bölümü tek tek aydınlatıp anlatır.
 *  - Header'daki "?" düğmesiyle her zaman yeniden açılır.
 * ------------------------------------------------------------------ */

const KEY = "mb_tour_v2";
const readFlag = () => { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } };
const writeFlag = (v) => { try { window.localStorage.setItem(KEY, v); } catch (e) {} };

const q = (sel) => document.querySelector(sel);
const tbBtn = (label) => Array.from(document.querySelectorAll(".dockrail .dr")).find((b) => b.textContent.trim() === label);
const openPanel = (label) => { const b = tbBtn(label); if (b && !b.classList.contains("is-on")) b.click(); };
const closePanel = () => { const b = q(".dock-head button"); if (b) b.click(); };
const closeShortcuts = () => { const b = q(".modal-sm .modal-cancel"); if (b && /Kapat/.test(b.textContent)) b.click(); };
const closeAll = () => { closePanel(); closeShortcuts(); };

const panelStep = (label, title, text, tip) => ({
  title, text, tip,
  target: () => q(".dock"),
  enter: () => openPanel(label),
});

const STEPS = [
  {
    title: "Burası senin tahtan",
    text: "Oyuncuları parmağınla ya da fareyle sürükleyip istediğin yere koy. Bir oyuncuya dokunursan adını, numarasını ve yelek rengini değiştirebilirsin. Üzerine basılı tutarsan silme menüsü açılır.",
    target: () => q(".pitch-svg"),
  },
  {
    title: "Paneller",
    text: "Sağdaki bu şeritte bütün ayarlar duruyor: takım, forma, saha, çizim, nesneler, sahneler ve kayıtlar. Bir sekmeye bastığında paneli açılır, tekrar basınca kapanır. Şimdi hepsini sırayla gezelim.",
    target: () => q(".dockrail"),
  },
  panelStep("Takım", "Takım",
    "Dizilişi küçük saha resimlerinden seç, oyuncular kendiliğinden yerine geçer. Rakip takımı ekleyip ona da diziliş verebilirsin. Aşağıda kadroyu, yani oyuncu sayısını, isimleri, numaraları ve pul boyutunu, en altta da isim ya da pozisyon etiketlerini ayarlarsın.",
    "Dizilişi seçtikten sonra oyuncuları yine elle sürükleyebilirsin."),
  panelStep("Forma", "Forma",
    "Takımın ana rengini, ikinci rengini ve forma desenini (çizgili, yarı yarıya, çapraz şerit ve daha fazlası) seç. Ev sahibi ve rakip takımın formaları ayrı ayrı ayarlanır.",
    "İkinci renk yalnızca desenli formalarda görünür."),
  panelStep("Saha", "Saha görünümü",
    "Saha yönünü, çim rengini ve desenini seç. Perspektifli görünümle düz kuş bakışı arasında geçiş yap. Üçte birler, half-space, pozisyonel oyun ve 5 kulvar gibi taktik katmanlarını da buradan açarsın."),
  panelStep("Çizim", "Çizim",
    "Çizim rengini seç. Hazır şablonlar sahaya birkaç ok ve çizgiyi tek dokunuşla ekler, sonra istediğin gibi taşıyıp düzenlersin.",
    "Yanlış çizimi Silgi aracıyla ya da Ctrl+Z ile geri alabilirsin."),
  panelStep("Nesneler", "Nesneler",
    "Kale, koni, manken, merdiven gibi antrenman malzemelerini, topları ve kulüp logonu buradan eklersin. Birini seç, sahada bir yere dokun. Eklediğin malzemeye dokunursan döndürebilir, büyütebilir veya silebilirsin.",
    "Kaleler üç boyutlu; top kalenin içine girebilir."),
  panelStep("Sahneler", "Sahneler ve animasyon",
    "Her sahne, tahtanın o anki halinin bir fotoğrafıdır. Burada sahneleri güncelleyebilir, sıralarını değiştirebilir ve silebilirsin. Oynatma hızını da buradan ayarlarsın."),
  panelStep("Kayıtlar", "Kayıtlar",
    "Giriş yaptıysan tahtanı sahneleriyle birlikte bir isim vererek hesabına kaydedebilirsin. Kayıtlar bulutta durur, istediğin cihazdan açarsın.",
    "Kaydetmek için ücretsiz bir hesap gerekir."),
  {
    title: "Araçlar",
    text: "Soldaki bu hap çizim araçların: Taşı, Bağla, çizim grubu (çizgi, ok, kesik ok, eğri ok, kalem), şekiller (kutu, dolu kutu, bölge), Metin ve Silgi. Köşesinde küçük ok olan düğmeye tekrar basarsan grubun diğer araçları açılır.",
    target: () => q(".toolpill"),
  },
  {
    title: "Bağla ve Bölge",
    text: "Bağla ile iki oyuncuya sırayla dokunursan aralarına bir çizgi çekilir; üç dört oyuncu bir çevre oluşturursa içi hafifçe boyanır. Bölge ile bir alanı sürükleyerek seçersen içindeki oyuncu sayısı yazılır.",
    target: () => q(".toolpill"),
  },
  {
    title: "Sahne şeridi",
    text: "Alttaki şeritte + ile o anki düzeni yeni bir sahne olarak eklersin. Oyuncuları taşı, bir sahne daha ekle ve oynat; oyuncular sahneler arasında akıcı kayar. Kamera düğmesi animasyonu video olarak kaydeder.",
    target: () => q(".timeline"),
  },
  {
    title: "Dışa aktar",
    text: "Tahtanın o anki halini yüksek çözünürlüklü (4K) bir görsel olarak indirir. Paylaşmak ya da sunuma koymak için birebir.",
    target: () => q('[data-tour="export"]'),
  },
  {
    title: "Yeni tahta",
    text: "Sıfırdan başlamak ya da sahanın yalnızca bir bölümünü (yarı saha, son üçte bir gibi) çalışmak için kullanılır.",
    target: () => q('[data-tour="new"]'),
  },
  {
    title: "Geri al",
    text: "Yaptığın son işlemi geri alır: bir oyuncuyu taşımak, çizim yapmak, top eklemek… Bilgisayarda Ctrl+Z ile de aynı işi görür.",
    target: () => q('[data-tour="undo"]'),
  },
  {
    title: "Tema",
    text: "Menüleri açık ya da koyu temaya geçirir. Sahanın kendi rengini değiştirmez; onu Saha panelinden ayarlarsın.",
    target: () => q('[data-tour="theme"]'),
  },
  {
    title: "Hesabın",
    text: "Buradan ücretsiz üye olabilir ya da giriş yapabilirsin. Kayıt sırasında e-postana bir doğrulama bağlantısı gelir; ona tıklayınca hesabın açılır.",
    target: () => q('[data-tour="account"]'),
  },
  {
    title: "Hazırsın!",
    text: "Artık tahtayı baştan sona biliyorsun. Takılırsan sağ üstteki ? düğmesiyle beni istediğin zaman yeniden çağırabilirsin. Kolay gelsin, hocam!",
    target: () => q('[data-tour="help"]'),
    last: true,
  },
];

/* ------------------------------ coach ------------------------------ */

function Coach({ talking, waving }) {
  return (
    <svg className={`tour-coach-svg ${talking ? "is-talking" : ""} ${waving ? "is-waving" : ""}`} viewBox="0 0 170 215" aria-hidden="true">
      <defs>
        <linearGradient id="yhJacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#353A41" /><stop offset="1" stopColor="#1D2025" /></linearGradient>
        <linearGradient id="yhSleeve" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#30353B" /><stop offset="1" stopColor="#202328" /></linearGradient>
        <linearGradient id="yhSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EDBF97" /><stop offset="1" stopColor="#D29A72" /></linearGradient>
        <linearGradient id="yhHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9BEC3" /><stop offset="1" stopColor="#7D838A" /></linearGradient>
        <linearGradient id="yhBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9AEB4" /><stop offset="1" stopColor="#868C93" /></linearGradient>
        <radialGradient id="yhGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4CBF52" stopOpacity="0.38" /><stop offset="1" stopColor="#4CBF52" stopOpacity="0" /></radialGradient>
      </defs>
      <circle className="tc-glow" cx="85" cy="124" r="82" fill="url(#yhGlow)" />
      <g className="tc-bob">
        {/* torso: training jacket */}
        <path d="M4 215 C4 162 34 138 85 138 C136 138 166 162 166 215 Z" fill="url(#yhJacket)" />
        <path d="M18 182 C24 158 46 146 66 141" stroke="#4CBF52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M152 182 C146 158 124 146 104 141" stroke="#4CBF52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        {/* high collar + zip */}
        <path d="M62 140 C66 128 104 128 108 140 L102 156 C96 148 74 148 68 156 Z" fill="#2A2E34" stroke="#3E444B" strokeWidth="1" />
        <path d="M85 150 L85 215" stroke="#121417" strokeWidth="2.4" />
        <rect x="82.6" y="158" width="4.8" height="8" rx="1.4" fill="#C9CED3" />
        {/* chest crest */}
        <rect x="104" y="166" width="17" height="13" rx="2.5" fill="#3C9A43" />
        <path d="M106.5 172.5 H118.5 M112.5 168.5 V176.5" stroke="#fff" strokeWidth="1" />
        <rect x="106.5" y="168.5" width="12" height="8" fill="none" stroke="#fff" strokeWidth="1" />
        {/* neck */}
        <path d="M72 116 L72 136 C78 144 92 144 98 136 L98 116 Z" fill="#CF956D" />
        {/* lanyard + whistle */}
        <path d="M71 140 C74 176 96 176 99 140" stroke="#4CBF52" strokeWidth="2" fill="none" />
        <rect x="80" y="172" width="13" height="8" rx="3.5" fill="#D7DCE0" stroke="#9AA1A8" strokeWidth="1" />
        <circle cx="83.5" cy="176" r="1.3" fill="#5E656C" />
        <g transform="translate(0 7)">
          {/* ears */}
          <ellipse cx="52.5" cy="84" rx="5.5" ry="8" fill="#DCA67F" />
          <ellipse cx="117.5" cy="84" rx="5.5" ry="8" fill="#DCA67F" />
          {/* head */}
          <ellipse cx="85" cy="80" rx="32" ry="37" fill="url(#yhSkin)" />
          {/* short salt-and-pepper hair, side part */}
          <path d="M52 78 C47 48 64 32 86 32 C108 32 124 46 118 78 C116 64 112 56 104 52 C96 56 80 55 70 50 C61 56 55 64 52 78 Z" fill="url(#yhHair)" />
          <path d="M70 50 C78 46 92 45 104 52" stroke="#E2E5E8" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.4" />
          {/* trimmed grey beard */}
          <path d="M54 88 C55 112 68 124 85 124 C102 124 115 112 116 88 C112 98 106 104 100 106 C95 102 75 102 70 106 C64 104 58 98 54 88 Z" fill="url(#yhBeard)" />
          <path d="M71 100 C76 95 94 95 99 100 C95 99 89 99 85 101 C81 99 75 99 71 100 Z" fill="#8F959B" />
          {/* brows */}
          <path d="M65 70 C70 66 77 66 80 69" stroke="#6C7279" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M90 69 C93 66 100 66 105 70" stroke="#6C7279" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          {/* eyes + smile lines */}
          <g className="tc-eyes">
            <ellipse cx="73" cy="80" rx="3.6" ry="4.2" fill="#2A211C" />
            <ellipse cx="97" cy="80" rx="3.6" ry="4.2" fill="#2A211C" />
            <circle cx="74.2" cy="78.6" r="1.2" fill="#fff" />
            <circle cx="98.2" cy="78.6" r="1.2" fill="#fff" />
          </g>
          <path d="M62 80 L59 78 M62 84 L59 85 M108 80 L111 78 M108 84 L111 85" stroke="#B9835E" strokeWidth="1.1" strokeLinecap="round" />
          {/* nose */}
          <path d="M85 82 C81 91 81 94 86 95" stroke="#BF8460" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* mouth */}
          <path className="tc-smile" d="M76 107 C81 112 89 112 94 107" stroke="#5B3226" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path className="tc-talk" d="M77 106 C80 115 90 115 93 106 C89 108.5 81 108.5 77 106 Z" fill="#5E2420" />
        </g>
        {/* left arm holding a tablet with a lineup */}
        <path d="M30 160 C20 172 20 192 28 208 L48 208 C46 190 50 176 58 166 Z" fill="url(#yhSleeve)" />
        <g transform="translate(6 152) rotate(-8 25 30)">
          <rect x="0" y="0" width="50" height="62" rx="6" fill="#16181B" stroke="#4A5057" strokeWidth="1.6" />
          <rect x="4" y="5" width="42" height="52" rx="2.5" fill="#3E8E41" />
          <path d="M4 31 H46" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <circle cx="25" cy="31" r="6" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <rect x="15" y="5" width="20" height="7" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <circle cx="14" cy="20" r="2.4" fill="#fff" /><circle cx="25" cy="17" r="2.4" fill="#fff" /><circle cx="36" cy="20" r="2.4" fill="#fff" />
          <circle cx="18" cy="42" r="2.4" fill="#FF7A6B" /><circle cx="32" cy="42" r="2.4" fill="#FF7A6B" />
          <path d="M25 19 C29 26 31 33 31 38" stroke="#FFD54A" strokeWidth="1.2" fill="none" strokeDasharray="2 1.6" />
        </g>
        <circle cx="48" cy="198" r="7.5" fill="#DCA67F" />
        {/* right arm (waves) */}
        <g className="tc-wave">
          <path d="M134 162 C152 158 160 140 158 116" stroke="url(#yhSleeve)" strokeWidth="21" fill="none" strokeLinecap="round" />
          <path d="M149 150 C156 142 159 132 158 122" stroke="#4CBF52" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9" />
          <circle cx="157" cy="104" r="10.5" fill="#DCA67F" />
          <ellipse cx="146.5" cy="106" rx="3.4" ry="6" fill="#DCA67F" transform="rotate(-24 146.5 106)" />
          <path d="M152 95 L152 90 M157 94 L158 88.5 M162 96 L164 91" stroke="#DCA67F" strokeWidth="4.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------ typewriter ------------------------------ */

function useTypewriter(text, active) {
  const [n, setN] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (!active) return undefined;
    if (reduced) { setN(text.length); return undefined; }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN((prev) => Math.max(prev, i));
      if (i >= text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [text, active, reduced]);
  return [text.slice(0, n), n >= text.length, () => setN(text.length)];
}

/* ------------------------------ main component ------------------------------ */

const rectOf = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const sameRect = (a, b) => (!a && !b) || (a && b && Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1 && Math.abs(a.h - b.h) < 1);
const intersects = (a, b, m = 14) => a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y;

export default function Tour() {
  const [mode, setMode] = useState("off"); // off | intro | tour
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [pop, setPop] = useState(0);
  const enterTimer = useRef(null);

  const step = mode === "tour" ? STEPS[idx] : null;
  const introText = "Masterclass Board'a hoş geldin. Tahtayı birlikte kısaca gezelim; iki dakika sürer. İstersen şimdilik atla, beni sağ üstteki ? düğmesiyle her zaman çağırabilirsin.";
  const fullText = mode === "intro" ? introText : step ? step.text : "";
  const [shown, done, finishTyping] = useTypewriter(fullText, mode !== "off");

  /* first visit: offer the tour after the page has settled */
  useEffect(() => {
    const t = setTimeout(() => {
      if (readFlag()) return;
      if (/access_token|type=recovery|type=signup/.test(window.location.hash || "")) return;
      setMode("intro"); setPop((p) => p + 1);
    }, 1100);
    const onStart = () => { setIdx(0); setMode("intro"); setPop((p) => p + 1); };
    window.addEventListener("mb-tour-start", onStart);
    return () => { clearTimeout(t); window.removeEventListener("mb-tour-start", onStart); };
  }, []);

  const finish = useCallback((flag) => {
    clearTimeout(enterTimer.current);
    closeAll();
    writeFlag(flag);
    setMode("off"); setRect(null);
  }, []);

  /* run the step's setup (open panel etc.) */
  useEffect(() => {
    if (mode !== "tour") return undefined;
    clearTimeout(enterTimer.current);
    closeAll();
    const s = STEPS[idx];
    enterTimer.current = setTimeout(() => { if (s.enter) s.enter(); }, 90);
    setPop((p) => p + 1);
    return () => clearTimeout(enterTimer.current);
  }, [mode, idx]);

  /* keep the spotlight glued to the target (panels animate, window resizes) */
  useEffect(() => {
    if (mode !== "tour") { setRect(null); return undefined; }
    const tick = () => {
      const el = STEPS[idx].target ? STEPS[idx].target() : null;
      const r = rectOf(el);
      setRect((prev) => (sameRect(prev, r) ? prev : r));
      setVw(window.innerWidth); setVh(window.innerHeight);
    };
    tick();
    const id = setInterval(tick, 90);
    window.addEventListener("resize", tick);
    return () => { clearInterval(id); window.removeEventListener("resize", tick); };
  }, [mode, idx]);

  const next = useCallback(() => {
    if (mode === "intro") { setIdx(0); setMode("tour"); return; }
    if (!done) { finishTyping(); return; }
    if (STEPS[idx].last) { finish("done"); return; }
    setIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }, [mode, idx, done, finishTyping, finish]);
  const back = useCallback(() => { setIdx((i) => Math.max(0, i - 1)); }, []);

  useEffect(() => {
    if (mode === "off") return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); next(); }
      else if (e.key === "ArrowLeft" && mode === "tour") { e.preventDefault(); e.stopPropagation(); back(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(mode === "intro" ? "skipped" : "done"); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [mode, next, back, finish]);

  if (mode === "off") return null;

  /* pick the corner where the guide does not cover the highlighted area */
  const small = vw < 700;
  const gw = small ? vw - 16 : Math.min(500, vw - 40);
  const gh = small ? 250 : 270;
  const cands = small
    ? [{ v: "bottom", h: "right" }, { v: "top", h: "right" }]
    : [{ v: "bottom", h: "right" }, { v: "bottom", h: "left" }, { v: "top", h: "right" }, { v: "top", h: "left" }];
  let pos = { ...cands[0], w: gw };
  if (rect) {
    let found = null;
    for (const c of cands) {
      const gy = c.v === "bottom" ? vh - gh : 70;
      const gx = c.h === "right" ? vw - 16 - gw : 16;
      if (!intersects({ x: gx, y: gy, w: gw, h: gh }, rect)) { found = { ...c, w: gw }; break; }
      if (!intersects({ x: 0, y: gy, w: vw, h: gh }, rect)) continue;
      // the highlighted area is tall: squeeze the guide into the free side column instead
      const freeW = c.h === "right" ? vw - 16 - (rect.x + rect.w + 14) : rect.x - 14 - 16;
      if (!small && freeW >= 340) { found = { ...c, w: Math.min(gw, freeW) }; break; }
    }
    if (found) pos = found;
  }

  const total = STEPS.length;
  const isIntro = mode === "intro";
  const isLast = step && step.last;
  const pad = 7;
  const spot = rect ? { left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2 } : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="tour-block" />
      {spot ? <div className="tour-spot" style={spot}><span className="tour-ring" /></div> : <div className="tour-dim" />}

      <div className={`tour-guide pos-${pos.v}-${pos.h}`} role="dialog" aria-live="polite" aria-label="Rehber" style={{ width: pos.w }}>
        <div className="tour-bubble" key={`b${pop}`}>
          <div className="tour-head">
            <span className="tour-title">{isIntro ? "Merhaba, ben Yılmaz Hoca" : step.title}</span>
            {!isIntro && <span className="tour-count">{idx + 1}/{total}</span>}
          </div>
          <p className="tour-text" onClick={finishTyping}>
            {shown}<span className={`tour-caret ${done ? "tour-caret-off" : ""}`} />
          </p>
          {!isIntro && step.tip && done && <p className="tour-tip"><b>İpucu:</b> {step.tip}</p>}
          {!isIntro && <div className="tour-progress"><span style={{ width: `${((idx + 1) / total) * 100}%` }} /></div>}
          <div className="tour-actions">
            {isIntro ? (
              <>
                <button className="tour-btn tour-btn-ghost" onClick={() => finish("skipped")}>Şimdilik Atla</button>
                <button className="tour-btn tour-btn-main" onClick={next}>Turu Başlat</button>
              </>
            ) : (
              <>
                <button className="tour-link" onClick={() => finish("done")}>Turu kapat</button>
                <span className="tour-spacer" />
                {idx > 0 && <button className="tour-btn tour-btn-ghost" onClick={back}>Geri</button>}
                <button className="tour-btn tour-btn-main" onClick={next}>{isLast && done ? "Bitir" : "İleri"}</button>
              </>
            )}
          </div>
        </div>
        <div className="tour-coach"><Coach talking={!done} waving={isIntro || idx === 0} /></div>
      </div>
    </>
  );
}

/* ------------------------------ styles ------------------------------ */

const CSS = `
.tour-block{position:fixed; inset:0; z-index:9000; background:transparent; cursor:default;}
.tour-dim{position:fixed; inset:0; z-index:9001; background:rgba(6,10,8,0.66); animation:tourFade .35s ease both; pointer-events:none;}
.tour-spot{position:fixed; z-index:9001; border-radius:16px; pointer-events:none; box-shadow:0 0 0 9999px rgba(6,10,8,0.66); transition:left .45s cubic-bezier(.4,0,.2,1), top .45s cubic-bezier(.4,0,.2,1), width .45s cubic-bezier(.4,0,.2,1), height .45s cubic-bezier(.4,0,.2,1);}
.tour-ring{position:absolute; inset:0; border-radius:16px; border:2px solid var(--accent-2, #68D86D); animation:tourPulse 1.8s ease-in-out infinite;}
.tour-guide{position:fixed; z-index:9002; display:flex; align-items:flex-end; gap:0; pointer-events:none; animation:tourGuideIn .85s cubic-bezier(.2,.7,.2,1) both;}
.tour-guide > *{pointer-events:auto;}
.tour-guide.pos-bottom-right{right:16px; bottom:0; flex-direction:row;}
.tour-guide.pos-bottom-left{left:16px; bottom:0; flex-direction:row-reverse;}
.tour-guide.pos-top-right{right:16px; top:68px; flex-direction:row; align-items:flex-start;}
.tour-guide.pos-top-left{left:16px; top:68px; flex-direction:row-reverse; align-items:flex-start;}
.tour-coach{flex:none; width:158px; height:196px; position:relative; overflow:hidden; margin-left:-2px;}
.pos-bottom-left .tour-coach{margin-left:0; margin-right:-2px;}
.pos-top-right .tour-coach, .pos-top-left .tour-coach{align-self:flex-end; -webkit-mask-image:linear-gradient(to bottom,#000 68%,transparent 100%); mask-image:linear-gradient(to bottom,#000 68%,transparent 100%);}
.tour-coach-svg{position:absolute; left:0; bottom:-8px; width:158px; height:auto; overflow:visible; filter:drop-shadow(0 10px 18px rgba(0,0,0,0.45));}
.tc-glow{animation:tcGlow 3.2s ease-in-out infinite; transform-origin:85px 120px;}
.tc-bob{animation:tcBob 3.6s ease-in-out infinite;}
.tc-eyes{transform-box:fill-box; transform-origin:center; animation:tcBlink 4.6s infinite;}
.tc-talk{display:none; transform-box:fill-box; transform-origin:50% 0; animation:tcTalk .22s ease-in-out infinite alternate;}
.is-talking .tc-smile{display:none;}
.is-talking .tc-talk{display:block;}
.tc-wave{transform-box:view-box; transform-origin:128px 146px;}
.is-waving .tc-wave{animation:tcWave 1s ease-in-out .5s 3;}
.tour-bubble{position:relative; flex:1; min-width:0; margin-bottom:26px; background:var(--panel, #232222); color:var(--text, #F4F4F4); border:1px solid var(--panel-border, #34373C); border-radius:18px; padding:14px 16px 12px; box-shadow:0 18px 50px rgba(0,0,0,0.5), 0 0 0 4px rgba(76,191,82,0.12); animation:tourPop .42s cubic-bezier(.2,.7,.2,1) both; transform-origin:100% 100%;}
.pos-bottom-left .tour-bubble, .pos-top-left .tour-bubble{transform-origin:0 100%;}
.pos-top-right .tour-bubble, .pos-top-left .tour-bubble{margin-top:26px; margin-bottom:0;}
.tour-bubble::after{content:""; position:absolute; bottom:28px; right:-9px; width:16px; height:16px; background:var(--panel, #232222); border-right:1px solid var(--panel-border, #34373C); border-top:1px solid var(--panel-border, #34373C); transform:rotate(45deg); border-radius:0 4px 0 0;}
.pos-bottom-left .tour-bubble::after, .pos-top-left .tour-bubble::after{right:auto; left:-9px; transform:rotate(-135deg);}
.pos-top-right .tour-bubble::after, .pos-top-left .tour-bubble::after{bottom:auto; top:44px;}
.tour-head{display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:6px;}
.tour-title{font-family:'Barlow',sans-serif; font-weight:750; font-size:17px; letter-spacing:0; color:var(--text, #F2F3F4); line-height:1.25;}
.tour-count{flex:none; font-size:11.5px; font-weight:700; color:var(--text-dim, #A6A3A3); font-variant-numeric:tabular-nums;}
.tour-text{margin:0; font-size:14px; line-height:1.55; min-height:62px; cursor:pointer;}
.tour-caret{display:inline-block; width:2px; height:1em; margin-left:2px; background:var(--accent-2, #68D86D); vertical-align:-2px; animation:tourCaret .7s steps(1) infinite;}
.tour-caret-off{display:none;}
.tour-tip{margin:8px 0 0; padding:7px 10px; font-size:12.5px; line-height:1.45; color:var(--text-dim, #A6A3A3); background:rgba(76,191,82,0.1); border-radius:6px; animation:tourFade .3s ease both;}
.tour-tip b{color:var(--accent-2, #68D86D);}
.tour-progress{height:3px; margin:10px 0 10px; border-radius:3px; background:var(--panel-border, #3A3838); overflow:hidden;}
.tour-progress span{display:block; height:100%; background:linear-gradient(90deg,var(--accent,#4CBF52),var(--accent-2,#68D86D)); border-radius:3px; transition:width .4s ease;}
.tour-actions{display:flex; align-items:center; gap:8px; margin-top:10px;}
.tour-spacer{flex:1;}
.tour-btn{font:inherit; font-weight:700; font-size:13px; padding:8px 16px; border-radius:10px; cursor:pointer; border:1px solid var(--panel-border, #3A3838); background:transparent; color:var(--text, #F4F4F4); transition:transform .12s ease, background .15s ease, box-shadow .15s ease;}
.tour-btn:hover{transform:translateY(-1px);}
.tour-btn-main{background:var(--accent, #4CBF52); border-color:var(--accent, #4CBF52); color:var(--on-accent, #0C170D); box-shadow:0 6px 16px rgba(76,191,82,0.35);}
.tour-btn-main:hover{background:var(--accent-2, #68D86D);}
.tour-btn-ghost:hover{background:var(--surface, #2D2C2C);}
.tour-link{font:inherit; font-size:12.5px; background:none; border:none; color:var(--text-dim, #A6A3A3); cursor:pointer; padding:6px 2px; text-decoration:underline; text-underline-offset:3px;}
.tour-link:hover{color:var(--text, #F4F4F4);}
@keyframes tourFade{from{opacity:0;} to{opacity:1;}}
@keyframes tourPulse{0%,100%{box-shadow:0 0 0 0 rgba(104,216,109,0.55);} 50%{box-shadow:0 0 0 9px rgba(104,216,109,0);}}
@keyframes tourGuideIn{from{transform:translateY(120%); opacity:0;} 60%{opacity:1;} to{transform:translateY(0); opacity:1;}}
@keyframes tourPop{from{transform:scale(.82); opacity:0;} to{transform:scale(1); opacity:1;}}
@keyframes tourCaret{50%{opacity:0;}}
@keyframes tcBob{0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);}}
@keyframes tcGlow{0%,100%{transform:scale(1); opacity:.8;} 50%{transform:scale(1.08); opacity:1;}}
@keyframes tcBlink{0%,92%,100%{transform:scaleY(1);} 95%{transform:scaleY(.08);}}
@keyframes tcTalk{from{transform:scaleY(.45);} to{transform:scaleY(1);}}
@keyframes tcWave{0%,100%{transform:rotate(0);} 25%{transform:rotate(-22deg);} 55%{transform:rotate(12deg);} 80%{transform:rotate(-14deg);}}
@media (max-width:699px){
  .tour-coach{width:96px; height:120px;}
  .tour-coach-svg{width:96px;}
  .tour-bubble{padding:12px 13px 10px; margin-bottom:18px; border-radius:16px;}
  .tour-text{font-size:13.5px; min-height:0;}
  .tour-title{font-size:18px;}
  .tour-guide.pos-top-right{top:60px;}
}
@media (prefers-reduced-motion:reduce){
  .tour-guide,.tour-bubble,.tc-bob,.tc-glow,.tc-eyes,.is-waving .tc-wave,.tour-ring{animation:none !important;}
  .tour-spot{transition:none;}
}
`;
