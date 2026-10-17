import React, { useEffect, useRef, useState, useCallback } from "react";

/* ------------------------------------------------------------------ *
 *  Rehber (ilk kullanım öğreticisi)
 *  - Açılışta "Turu başlat / Atla" seçeneği sunar, tercih hatırlanır.
 *  - Sağ alttan animasyonlu bir antrenör çıkar, sohbet baloncuğunda
 *    her bölümü tek tek aydınlatıp anlatır.
 *  - Header'daki "?" düğmesiyle her zaman yeniden açılır.
 * ------------------------------------------------------------------ */

const KEY = "mb_tour_v1";
const readFlag = () => { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } };
const writeFlag = (v) => { try { window.localStorage.setItem(KEY, v); } catch (e) {} };

const q = (sel) => document.querySelector(sel);
const tbBtn = (label) => Array.from(document.querySelectorAll(".toolbar .tb-btn")).find((b) => b.textContent.trim() === label);
const openPanel = (label) => { const b = tbBtn(label); if (b && !b.classList.contains("tb-btn-active")) b.click(); };
const closePanel = () => { const b = q(".panel-head button"); if (b) b.click(); };
const closeShortcuts = () => { const b = q(".modal-sm .modal-cancel"); if (b && /Kapat/.test(b.textContent)) b.click(); };
const closeAll = () => { closePanel(); closeShortcuts(); };

const panelStep = (label, title, text, tip) => ({
  title, text, tip,
  target: () => q(".panel"),
  enter: () => openPanel(label),
});

const STEPS = [
  {
    title: "Burası senin tahtan",
    text: "Oyuncuları parmağınla ya da fareyle sürükleyip istediğin yere koy. Bir oyuncuya dokunursan adını, numarasını ve yelek rengini değiştirebilirsin. Üzerine basılı tutarsan silme menüsü açılır.",
    target: () => q(".stage"),
  },
  {
    title: "Araç çubuğu",
    text: "Tahtayla ilgili bütün ayarlar bu çubukta toplanıyor. Bir düğmeye bastığında ilgili bölüm açılır, tekrar basınca kapanır. Şimdi hepsini sırayla gezelim.",
    target: () => q(".toolbar"),
  },
  panelStep("Diziliş", "Diziliş",
    "Takım 1 ve Takım 2 için 4-3-3, 4-4-2 gibi hazır dizilişlerden birini seç, oyuncular kendiliğinden yerine geçer. \"Rakip Takımı Ekle\" ile karşı takımı sahaya getirip istediğinde kaldırabilirsin.",
    "Dizilişi seçtikten sonra oyuncuları yine elle sürükleyebilirsin."),
  panelStep("Kadro", "Kadro",
    "Her takımda kaç oyuncu olacağını (1 ile 11 arası) seç, oyuncuların isimlerini ve numaralarını yaz. Numara en fazla 3 karakter olabilir. Oyuncu ve top boyutunu da buradan büyütüp küçültürsün.",
    "Boyutlar gerçeğe yakın tutuldu; ekranda daha rahat görmek için oyuncuları büyütebilirsin."),
  panelStep("Forma", "Forma",
    "Takımın ana rengini, ikinci rengini ve forma desenini (çizgili, yarı yarıya, çapraz şerit ve daha fazlası) seç. Ev sahibi ve rakip takımın formaları ayrı ayrı ayarlanır.",
    "İkinci renk sadece desenli formalarda görünür."),
  panelStep("Etiket", "Etiket",
    "Oyuncuların altında isimlerin ya da pozisyonların görünüp görünmeyeceğini seç. Sade bir tahta istersen etiketleri tamamen gizleyebilirsin."),
  panelStep("Saha", "Saha görünümü",
    "Saha yönünü (otomatik, yatay, dikey), çimen rengini ve desenini seç. Perspektifli 3D görünüm ile düz kuş bakışı arasında geçiş yap. Üçte birler, half space, pozisyonel oyun ve 5 kulvar gibi taktik ızgaralarını da sahanın üstüne ekleyebilirsin."),
  panelStep("Çizim", "Çizim",
    "Çizim rengini seç. Hazır şablonlar sahaya birkaç ok ve çizgiyi tek dokunuşla ekler, sonra istediğin gibi taşıyıp düzenlersin. Bağla, Bölge ve Metin araçlarının nasıl kullanıldığı da burada yazıyor.",
    "Yanlış çizimi Silgi aracıyla ya da Ctrl+Z ile geri alabilirsin."),
  panelStep("Malzeme", "Malzeme",
    "Kale, koni, slalom sopası, çit, çeviklik merdiveni, halka, manken duvarı ve bayrak gibi antrenman malzemelerini ekle. Birini seç, sahada bir yere dokun. Eklediğin malzemeye dokunursan döndürebilir, büyütüp küçültebilir ya da silebilirsin.",
    "Kaleler üç boyutlu; top kalenin içine girebilir."),
  panelStep("Top", "Top",
    "Dört farklı top tasarımından birini seç ve sahada bir yere dokunarak ekle. İstediğin kadar top koyabilirsin. Sahnelerde top hareket ederken gerçekten yuvarlanır."),
  panelStep("Logo", "Logo",
    "Kulüp logonu ya da herhangi bir görseli yükle. Sahanın ortasına eklenir; sürükleyerek taşır, + ve − düğmeleriyle boyutunu ayarlar, silgiyle kaldırırsın."),
  panelStep("Sahneler", "Sahneler ve animasyon",
    "Her sahne, tahtanın o anki halinin bir fotoğrafıdır. Oyuncuları yerleştirip \"Sahne Olarak Ekle\" de, sonra oyuncuları başka yere taşıyıp yeni bir sahne ekle. \"Oynat\" dediğinde oyuncular ve toplar sahneler arasında kayarak hareket eder. Hızı ayarlayabilir, \"Oynat ve Kaydet\" ile animasyonu MP4 video olarak indirebilirsin.",
    "Oynatma başlayınca bu bölüm kapanır ve altta küçük bir oynatma çubuğu belirir."),
  panelStep("Kayıtlar", "Kayıtlar",
    "Giriş yaptıysan tahtanı, sahneleriyle birlikte bir isim vererek hesabına kaydedebilirsin. Kayıtlar bulutta durur, istediğin cihazdan açarsın. Aynı adla tekrar kaydedersen eskisinin üzerine yazılır.",
    "Kaydetmek için ücretsiz bir hesap gerekir."),
  {
    title: "Kısayollar",
    text: "Bilgisayarda klavyeyle çok daha hızlı çalışabilirsin: V taşı, C bağla, P kalem, L çizgi, A ok, T metin, E silgi ve Ctrl+Z geri al. Listenin tamamı burada.",
    target: () => q(".modal-sm"),
    enter: () => { const b = tbBtn("Kısayollar"); if (b) b.click(); },
  },
  {
    title: "Hızlı araçlar",
    text: "Sahanın üstündeki bu şerit çizim araçların: Taşı, Bağla, Çizgi, Ok, Kesik Ok, Eğri Ok, Kalem, Kutu, Dolu Kutu, Bölge, Metin ve Silgi. Bir araç seç, sahada çiz; işin bitince \"Bitir\" ya da Taşı aracıyla normale dön.",
    target: () => q(".quickbar"),
  },
  {
    title: "Bağla ve Bölge",
    text: "Bağla ile iki oyuncuya sırayla dokunursan aralarına bir çizgi çekilir; üç dört oyuncu bir çevre oluşturursa içi hafifçe boyanır. Bölge ile bir alanı sürükleyerek seçersen içindeki oyunculara göre 2v1 gibi sayısal üstünlük yazar.",
    target: () => q(".quickbar"),
  },
  {
    title: "Yeni tahta",
    text: "Sıfırdan başlamak ya da sahanın sadece bir bölümünü (yarı saha, son üçte bir gibi) çalışmak için kullanılır. Seçtiğin bölüm yakınlaştırılır, gerisi görünmez. Yeni tahta açılınca mevcut çizimlerin temizlenir, o yüzden önce kaydetmeyi unutma.",
    target: () => q('[data-tour="new"]'),
  },
  {
    title: "Geri al",
    text: "Yaptığın son işlemi geri alır: bir oyuncuyu taşımak, çizim yapmak, top eklemek, renk değiştirmek… Bilgisayarda Ctrl+Z ile de aynı işi görür.",
    target: () => q('[data-tour="undo"]'),
  },
  {
    title: "Aktar",
    text: "Tahtanın o anki halini yüksek çözünürlüklü (4K) bir PNG görseli olarak indirir. Paylaşmak ya da sunuma koymak için birebir. Animasyon videosunu ise Sahneler bölümünden alırsın.",
    target: () => q('[data-tour="export"]'),
  },
  {
    title: "Tema",
    text: "Menüleri açık ya da koyu temaya geçirir. Sahanın kendi rengini değiştirmez; onu Saha bölümünden ayarlarsın.",
    target: () => q('[data-tour="theme"]'),
  },
  {
    title: "Hakkında ve yasal bilgiler",
    text: "Site hakkında bilgi, gizlilik politikası, kullanım şartları ve iletişim bilgileri burada.",
    target: () => q('[data-tour="info"]'),
  },
  {
    title: "Hesabın",
    text: "Buradan ücretsiz üye olabilir ya da giriş yapabilirsin. Kayıt sırasında e-postana bir doğrulama bağlantısı gelir; ona tıklayınca hesabın açılır. Şifreni unutursan giriş penceresinden sıfırlayabilirsin.",
    target: () => q('[data-tour="account"]'),
  },
  {
    title: "Hazırsın!",
    text: "Artık tahtayı baştan sona biliyorsun. Bir yerde takılırsan sağ üstteki ? düğmesiyle bu turu istediğin zaman yeniden açabilirsin. Bol şans, hocam!",
    target: () => q('[data-tour="help"]'),
    last: true,
  },
];

/* ------------------------------ coach ------------------------------ */

function Coach({ talking, waving }) {
  return (
    <svg className={`tour-coach-svg ${talking ? "is-talking" : ""} ${waving ? "is-waving" : ""}`} viewBox="0 0 170 215" aria-hidden="true">
      <defs>
        <linearGradient id="tcJacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B4C78" /><stop offset="1" stopColor="#16294A" /></linearGradient>
        <linearGradient id="tcSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F3C7A1" /><stop offset="1" stopColor="#DCA27A" /></linearGradient>
        <linearGradient id="tcHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A3A2A" /><stop offset="1" stopColor="#3A241A" /></linearGradient>
        <radialGradient id="tcGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4CBF52" stopOpacity="0.55" /><stop offset="1" stopColor="#4CBF52" stopOpacity="0" /></radialGradient>
      </defs>
      <circle className="tc-glow" cx="85" cy="120" r="84" fill="url(#tcGlow)" />
      <g className="tc-bob">
        {/* torso */}
        <path d="M6 215 C6 164 34 140 85 140 C136 140 164 164 164 215 Z" fill="url(#tcJacket)" />
        <path d="M22 176 C28 156 50 146 68 143" stroke="#4CBF52" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M148 176 C142 156 120 146 102 143" stroke="#4CBF52" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* shirt + zipper */}
        <path d="M66 141 L85 176 L104 141 Z" fill="#F4F4F4" />
        <path d="M85 176 L85 215" stroke="#10213B" strokeWidth="2.6" />
        <path d="M66 141 C72 134 98 134 104 141 L98 146 C92 141 78 141 72 146 Z" fill="#1E3A63" />
        {/* neck */}
        <path d="M72 118 L72 141 C78 149 92 149 98 141 L98 118 Z" fill="#D4986F" />
        {/* whistle */}
        <path d="M70 142 C75 178 95 178 100 142" stroke="#F5C542" strokeWidth="2" fill="none" />
        <rect x="79" y="174" width="13" height="8" rx="3.5" fill="#F5C542" stroke="#C99B1C" strokeWidth="1" />
        <circle cx="82.5" cy="178" r="1.4" fill="#8A6A10" />
        <g transform="translate(0 9)">
        {/* ears */}
        <ellipse cx="52" cy="84" rx="5.5" ry="8" fill="#E0A981" />
        <ellipse cx="118" cy="84" rx="5.5" ry="8" fill="#E0A981" />
        {/* head */}
        <ellipse cx="85" cy="80" rx="32" ry="37" fill="url(#tcSkin)" />
        {/* hair */}
        <path d="M51 76 C45 44 66 28 87 28 C108 28 126 42 119 76 C114 60 104 52 86 52 C68 52 57 60 51 76 Z" fill="url(#tcHair)" />
        <path d="M60 50 C66 40 80 36 92 38" stroke="#7A5440" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* brows */}
        <path d="M66 72 C70 68 77 68 80 71" stroke="#3A241A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M90 71 C93 68 100 68 104 72" stroke="#3A241A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        {/* eyes */}
        <g className="tc-eyes">
          <ellipse cx="73" cy="82" rx="4" ry="4.6" fill="#241A17" />
          <ellipse cx="97" cy="82" rx="4" ry="4.6" fill="#241A17" />
          <circle cx="74.4" cy="80.4" r="1.4" fill="#fff" />
          <circle cx="98.4" cy="80.4" r="1.4" fill="#fff" />
        </g>
        {/* nose + cheeks */}
        <path d="M85 84 C81 93 81 96 86 97" stroke="#C4875F" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="96" r="6" fill="#F08A7A" opacity="0.22" />
        <circle cx="106" cy="96" r="6" fill="#F08A7A" opacity="0.22" />
        {/* mouth */}
        <path className="tc-smile" d="M74 104 C80 112 90 112 96 104" stroke="#8A4B3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path className="tc-talk" d="M76 104 C80 114 90 114 94 104 C90 107 80 107 76 104 Z" fill="#7A2E2A" />
        </g>
        {/* left arm with tactics clipboard */}
        <path d="M30 160 C20 172 20 192 28 208 L48 208 C46 190 50 176 58 166 Z" fill="#203C66" />
        <g transform="translate(8 150) rotate(-9 24 30)">
          <rect x="0" y="0" width="46" height="58" rx="5" fill="#F7F2E6" stroke="#8C6B3F" strokeWidth="2" />
          <rect x="14" y="-4" width="18" height="9" rx="3" fill="#8D95A3" />
          <rect x="6" y="12" width="34" height="38" rx="2" fill="#3F9A46" />
          <path d="M6 31 H40 M23 12 V50" stroke="#fff" strokeWidth="1.2" />
          <circle cx="23" cy="31" r="5" fill="none" stroke="#fff" strokeWidth="1.2" />
          <circle cx="14" cy="22" r="2.2" fill="#F5C542" /><circle cx="31" cy="40" r="2.2" fill="#fff" />
          <path d="M14 22 L26 34" stroke="#F5C542" strokeWidth="1.2" strokeDasharray="2 2" />
        </g>
        <circle cx="47" cy="196" r="7.5" fill="#E0A981" />
        {/* right arm (waves) */}
        <g className="tc-wave">
          <path d="M134 162 C152 158 160 140 158 116" stroke="#203C66" strokeWidth="21" fill="none" strokeLinecap="round" />
          <path d="M148 134 L166 138" stroke="#4CBF52" strokeWidth="4" strokeLinecap="round" opacity="0" />
          <circle cx="157" cy="104" r="10.5" fill="#E0A981" />
          <ellipse cx="146.5" cy="106" rx="3.4" ry="6" fill="#E0A981" transform="rotate(-24 146.5 106)" />
          <path d="M152 95 L152 90 M157 94 L158 88.5 M162 96 L164 91" stroke="#E0A981" strokeWidth="4.2" strokeLinecap="round" />
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
  const introText = "Masterclass Board'a hoş geldin! Ben antrenörün; taktik tahtasını kısaca gezdirmek istiyorum. Yaklaşık iki dakika sürer. Dilersen şimdilik atlayabilirsin, rehberi sağ üstteki ? düğmesinden istediğin zaman açarsın.";
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
            <span className="tour-title">{isIntro ? "Merhaba, ben Koç Kaan!" : step.title}</span>
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
.tour-guide{position:fixed; z-index:9002; display:flex; align-items:flex-end; gap:0; pointer-events:none; animation:tourGuideIn .85s cubic-bezier(.34,1.4,.5,1) both;}
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
.tour-bubble{position:relative; flex:1; min-width:0; margin-bottom:26px; background:var(--panel, #232222); color:var(--text, #F4F4F4); border:1px solid var(--accent, #4CBF52); border-radius:18px; padding:14px 16px 12px; box-shadow:0 18px 50px rgba(0,0,0,0.5), 0 0 0 4px rgba(76,191,82,0.12); animation:tourPop .42s cubic-bezier(.34,1.5,.5,1) both; transform-origin:100% 100%;}
.pos-bottom-left .tour-bubble, .pos-top-left .tour-bubble{transform-origin:0 100%;}
.pos-top-right .tour-bubble, .pos-top-left .tour-bubble{margin-top:26px; margin-bottom:0;}
.tour-bubble::after{content:""; position:absolute; bottom:28px; right:-9px; width:16px; height:16px; background:var(--panel, #232222); border-right:1px solid var(--accent, #4CBF52); border-top:1px solid var(--accent, #4CBF52); transform:rotate(45deg); border-radius:0 4px 0 0;}
.pos-bottom-left .tour-bubble::after, .pos-top-left .tour-bubble::after{right:auto; left:-9px; transform:rotate(-135deg);}
.pos-top-right .tour-bubble::after, .pos-top-left .tour-bubble::after{bottom:auto; top:44px;}
.tour-head{display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:6px;}
.tour-title{font-family:'Barlow Condensed','Inter',sans-serif; font-weight:800; font-size:21px; letter-spacing:.03em; text-transform:uppercase; color:var(--accent-2, #68D86D); line-height:1.1;}
.tour-count{flex:none; font-size:11.5px; font-weight:700; color:var(--text-dim, #A6A3A3); font-variant-numeric:tabular-nums;}
.tour-text{margin:0; font-size:14px; line-height:1.55; min-height:62px; cursor:pointer;}
.tour-caret{display:inline-block; width:2px; height:1em; margin-left:2px; background:var(--accent-2, #68D86D); vertical-align:-2px; animation:tourCaret .7s steps(1) infinite;}
.tour-caret-off{display:none;}
.tour-tip{margin:8px 0 0; padding:7px 10px; font-size:12.5px; line-height:1.45; color:var(--text-dim, #A6A3A3); background:rgba(76,191,82,0.1); border-left:3px solid var(--accent, #4CBF52); border-radius:6px; animation:tourFade .3s ease both;}
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
