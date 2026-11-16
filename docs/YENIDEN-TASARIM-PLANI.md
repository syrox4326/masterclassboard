# Masterclass Board: Yeniden Tasarım ve Yeniden Yapılandırma Planı

Durum: taslak, onay bekliyor · Tarih: 16 Kasım 2026

Bu belge uygulamanın arayüzünü ve kod yapısını baştan kurmak için yol haritasıdır.
Bugünkü hiçbir özellik kaybolmaz; her aşama, eski sürümün yaptığı her şeyi yapmadan bitmiş sayılmaz.

Kullanılan kaynaklar: `pbakaus/impeccable` (Operate modu, craft-floor, detector),
`Leonxlnx/taste-skill` (yalnızca tanıtım sayfası için), `VoltAgent/awesome-design-md` (DESIGN.md formatı;
Linear, Figma, Raycast referansları), `nextlevelbuilder/ui-ux-pro-max-skill` (erişilebilirlik ve dokunma
kuralları), `anthropics/skills/frontend-design` (yön seçimi ve "AI slop" kalıplarından kaçış).

---

## 1. Bugünkü durum (tespit)

| Konu | Bulgu |
|---|---|
| Kod | `src/App.jsx` tek dosyada 280 KB, 3026 uzun satır, tek bileşende 82 `useState`. Test yok, TypeScript yok. |
| Arayüz | Sol rayda 12 panel (Diziliş, Kadro, Forma, Etiket, Saha, Çizim, Malzeme, Top, Logo, Sahneler, Kayıtlar, Kısayollar) ve üstte 14 araçlı ikinci bir araç çubuğu. Aynı iş iki yerde. |
| İlk izlenim | Tahta boş açılıyor (oyuncu yok). İlk ekranda ürünün ne yaptığı görünmüyor. |
| Görsel dil | Koyu antrasit zemin + tek parlak yeşil vurgu. `frontend-design` bunu AI kalıbı #2 olarak sayıyor ("near-black + tek asit yeşili"). |
| Etiketler | 9–10 px araç etiketleri; dokunma hedefleri 44 px'in altında. |
| Kayıt | Taktik yalnızca giriş yapınca buluta kaydediliyor; tarayıcıda otomatik taslak yok, sayfa yenilenince iş kayboluyor. |
| Dışa aktarım | PNG/JPEG ve WebM/MP4 video (webm-muxer, mp4-muxer) çalışıyor. Korunacak. |

Korunacak özellik envanteri (eşlik kontrol listesi, bölüm 7):
saha tipleri (tam, 7'ye 7, 9'a 9, boş), perspektif, 10 çim rengi × 7 desen, bölge katmanları
(üçte birler, half-space, pozisyonel oyun, 5 kulvar), 9 diziliş, rakip takım, 20 forma deseni, kaleci rengi,
oyuncu ölçeği, etiket modları, yelek, 12 çizim aracı (çizgi, ok, kesik ok, eğri ok, kalem, kutu, dolu kutu,
bölge, metin, silgi, bağla), malzemeler (kale, mini kale, koniler, mankenler…), top stilleri, logo yükleme,
oyuncu bağlantıları (şekil algılama dâhil), sahneler + oynatma hızı + video kaydı, geri al, kısayollar,
açık/koyu tema, yatay/dikey yönelim, Supabase hesap (kayıt, giriş, doğrulama, şifre sıfırlama), bulut kayıtları,
yasal metinler (Gizlilik, Şartlar, KVKK), tanıtım turu (Koç Kaan).

---

## 2. Ürün tanımı (PRODUCT.md taslağı)

- **Ne:** Ücretsiz, Türkçe, tarayıcıda çalışan futbol taktik tahtası.
- **Kimin için:** Amatör ve altyapı antrenörleri, analistler, taktik içerik üreticileri (sosyal medya videosu).
- **Ana iş:** 30 saniyede bir diziliş kurmak, hareketi çizmek, sahnelerle anlatmak ve görsel ya da video olarak paylaşmak.
- **Yüzey modu:** Tahta = *Operate* (iş görülen araç). Ayrı bir tanıtım sayfası yapılırsa o = *Persuade*.
- **Başarı ölçüsü:** İlk ziyarette ilk dışa aktarıma kadar geçen süre; tekrar gelen kullanıcı oranı.

---

## 3. Tasarım yönü

### Önerilen yön: "Telestratör"

Futbolun kendi analiz dili, maç yayınlarında sahanın üstüne çizim yapan telestratördür. Yön buradan alınıyor,
ama yalnızca impeccable'ın Operate kuralının izin verdiği dört şeyi alıyor: yazı, renk, yoğunluk ve tek bir imza hareketi.
Kontroller, menüler ve gezinme standart kalıyor; arayüz bir yayın grafiği kostümüne dönüşmüyor.

- **Saha kahraman.** Arayüz kabuğu sakin ve mat; ekranın en canlı yeri her zaman saha.
- **İmza hareketi:** Çizimler telestratör gibi davranıyor. Ok bırakıldığında çizgi uçtan uca bir kez akarak çiziliyor
  (180 ms, `prefers-reduced-motion` ile kapanır). Seçili oyuncunun altında yayın tarzı ince bir zemin halkası beliriyor.
  Sahne zaman çizelgesi bir tekrar (replay) şeridi gibi okunuyor. Başka süsleme yok.
- **Renk (koyu tema, varsayılan):**

| Token | Hex | Görev |
|---|---|---|
| `--shell` | `#20262A` | Kabuk zemini: çime doğru eğilmiş grafit, saf siyah değil |
| `--panel` | `#2A3237` | Paneller, açılır pencereler |
| `--rule` | `#3B454B` | Ayırıcılar, girdi kenarları |
| `--ink` | `#E8ECEC` | Metin |
| `--ink-2` | `#9BA7AC` | İkincil metin |
| `--tele` | `#FFD54A` | Telestratör sarısı: aktif araç, seçim, çizim varsayılanı, birincil buton |
| `--pitch-a / --pitch-b` | `#3D7A39 / #45863F` | Çim biçme şeritleri |

  Açık tema ("Gündüz") kâğıt beyazı `#F4F5F2` kabuk, `#1C2124` metin; sarı burada dolgu olarak kalır,
  metin olarak `#8A6400` kullanılır (kontrast 4.5:1 üstü). Takım renkleri kullanıcıdan gelir ve vurgu rengi sayılmaz.

- **Yazı:** Tek aile, **Archivo** (değişken genişlik 62–125, ağırlık 100–900; Türkçe karakterleri tam destekler).
  Forma numaraları ve oyuncu adları dar genişlikte (wdth 75, 700); arayüz metni normal genişlikte 14/16 px;
  taktik adı başlığı geniş genişlikte (wdth 112, 600). Tek aile, genişlik ekseniyle üç farklı ses.
  Küçük veri etiketleri için monospace yok; rakamlar `tabular-nums`.
- **Yoğunluk:** Kompakt ama dokunulabilir. 36 px masaüstü kontrol yüksekliği, dokunmatikte 44 px. 4 px ızgara.
- **Köşe yarıçapı hiyerarşisi:** kabuk 0, paneller 10, kontroller 7, oyuncu diski daire. Her şeye aynı yarıçap yok.
- **Gölge:** Yalnızca sahnenin üstünde yüzen öğelerde (açılır menü, bağlam menüsü). Kartlara gölge yok.

Neden bu yön (frontend-design kontrolü): Krem + serif, koyu + asit yeşili, gazete düzeni, kart kiti ve
BÜYÜK HARF etiket kalıplarının hiçbirine düşmüyor. Sarı vurgu keyfi bir seçim değil; telestratör çizimlerinin
gerçek rengi. Bugünkü yeşil vurgu kaldırılıyor çünkü yeşil zaten sahanın rengi ve sahayla yarışıyor.

### Alternatif yönler (seçim senin)

- **B, "Manyetik Tahta":** Açık tema öncelikli. Beyaz emaye zemin, alüminyum gri kabuk, oyuncular hafif gölgeli mıknatıs disk,
  kalem renkleri (siyah, kırmızı, mavi, yeşil). Antrenman sahası ve baskı için güçlü, video içeriği için daha zayıf.
- **C, "Soyunma Odası":** Koyu yeşil kara tahta, tebeşir çizgisi. Atmosferi güçlü ama "koyu zemin + tek renk" kalıbına
  en yakın olanı. Önermiyorum.

---

## 4. Yeni ekran düzeni

### Masaüstü

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ◩ Masterclass Board │ 4-3-3 Yüksek Pres ▾  ✓ Kaydedildi │ ↶ ↷ │ Paylaş │ Dışa aktar │
├──────┬──────────────────────────────────────────────────────────┬──────────────┤
│ Seç  │                                                          │ Denetçi      │
│ Çiz ▸│                                                          │ (seçime göre)│
│ Şekil▸│                      SAHA                               │              │
│ Metin│                                                          │ Hiçbir şey   │
│ Top  │                                                          │ seçili değil │
│ Malz.▸│                                                         │ → Takımlar / │
│ Bağla│                                                          │   Saha       │
│ Silgi│                                                          │ Oyuncu → ad, │
│      │                                                          │ numara, yelek│
├──────┴──────────────────────────────────────────────────────────┴──────────────┤
│ Sahneler  [1 Kuruluş][2 Pres][3 Geçiş][+]    ◀ ▶  0.5× 1× 2×   ● Video kaydet  │
└────────────────────────────────────────────────────────────────────────────────┘
```

- **Sol araç rayı (8 düğme):** 14 araç gruplanıyor. "Çiz" bir açılır grup: çizgi, ok, kesik ok, eğri ok, kalem.
  "Şekil": kutu, dolu kutu, bölge. "Malzeme": kale, koni, manken… Son kullanılan alt araç düğmede görünür (Figma mantığı).
- **Sağ denetçi (bağlama duyarlı):** 12 sol panelin yerini alıyor.
  - Seçim yok → iki sekme: **Takımlar** (diziliş, forma deseni ve renkleri, kadro listesi, rakibi göster) ve
    **Saha** (saha tipi, perspektif, çim, desen, bölge katmanı, etiket modu, oyuncu ve top ölçeği).
  - Oyuncu seçili → ad, numara, yelek, takım değiştir, bağlantı kur.
  - Çizim seçili → renk, kalınlık, uç tipi, kesik çizgi, öne/arkaya.
  - Çoklu seçim → hizala, dağıt, grupla.
- **Alt sahne şeridi:** Sahne yoksa tek satırlık "Animasyon başlat" çubuğu; sahne eklenince replay şeridine dönüşür.
- **Üst çubuk:** Taktik adı tıklanınca yeniden adlandırılır; açılır menüde Kayıtlarım, Yeni, Çoğalt, JSON içe/dışa aktar.
  Hesap ve tema avatar menüsünde. Kısayollar `?` ile, komut paleti `Ctrl+K` ile açılır.

### Mobil (dikey)

```
┌──────────────────────────┐
│ ◩  4-3-3 Yüksek Pres ▾ ⋯ │
├──────────────────────────┤
│                          │
│          SAHA            │
│        (dikey)           │
│                          │
├──────────────────────────┤
│ Seç  Çiz  Takım Sahne  ⋯ │  ← 5 sekmeli alt çubuk, 44 px
└──────────────────────────┘
 Denetçi = alttan açılan sayfa (bottom sheet), iki yükseklik
```

### İlk açılış
Tahta boş açılmayacak: 4-3-3'e karşı 4-4-2, iki hazır sahneyle örnek bir "yüksek pres" taktiği yüklenir.
Üstte tek satır: "Örnek taktik. Oyuncuları sürükle veya Yeni ile boş başla." Koç Kaan turu ilk ziyarette sağ alttan
küçük bir davetle gelir ve ekranı kaplamaz.

---

## 5. Yeni kod yapısı

**Teknoloji:** Vite + React 18 + **TypeScript**. Durum yönetimi **Zustand** + `immer` + `zundo` (geri al/yinele, ileri al dâhil).
Erişilebilir temel bileşenler **Radix UI** (Dialog, Popover, DropdownMenu, Tooltip, Tabs, Slider, ToggleGroup).
Stil: CSS Modules + `tokens.css` (CSS değişkenleri). İkonlar `lucide-react` ve özel futbol glifleri.
Test: **Vitest** (model, geometri, şema geçişi) + **Playwright** (uçtan uca + görsel karşılaştırma).
Supabase, webm-muxer ve mp4-muxer kalıyor.

```
src/
  app/            App.tsx, providers, router (/ ve /t/:id paylaşım)
  model/          tactic.ts (tipler), schema-v2.ts, migrate-v1.ts, defaults.ts, formations.ts
  store/          board.ts (Zustand: belge + seçim + araç), history.ts (zundo), ui.ts
  canvas/         Board.tsx, layers/ (Pitch, Zones, Drawings, Equipment, Players, Ball, Links),
                  projection.ts (perspektif), hit-test.ts, shapes.ts (findCycles, findLineShapes)
  tools/          her araç bir modül: select, line, arrow, curve, pen, rect, zone, text, eraser, link…
                  ortak arayüz: onPointerDown/Move/Up, cursor, preview()
  features/
    inspector/    BoardInspector, PlayerInspector, DrawingInspector, MultiInspector
    scenes/       SceneStrip, playback.ts (interpolasyon), recorder.ts
    export/       png.ts, svg.ts, video.ts (WebCodecs + muxer, Web Worker'da)
    account/      AuthDialog, AccountMenu, supabase.ts
    library/      Kayıtlarım (bulut + yerel taslaklar)
    onboarding/   Tour (Koç Kaan), sample-tactic.ts
    legal/        Gizlilik, Şartlar, KVKK
  ui/             Button, IconButton, Segmented, Swatch, Field, Sheet, Toast, Kbd…
  styles/         tokens.css, base.css, fonts
  lib/            geometry.ts, color.ts, keyboard.ts, storage.ts (IndexedDB)
```

**Belge modeli (v2):** `Tactic { id, name, version: 2, pitch, teams: [home, away], objects: TacticObject[], scenes: Scene[] }`.
Tüm çizimler, malzemeler, metinler, toplar, logolar ve bağlantılar tek bir `objects` dizisinde, ortak
`id / kind / z / locked` alanlarıyla. Sahneler tam kopya değil, nesne konumlarının anahtar kareleri.
**`migrate-v1.ts`** Supabase'deki eski kayıtları açılışta v2'ye çevirir; mevcut kullanıcıların taktikleri bozulmaz.
Bunun için gerçek eski kayıtlardan örnekler test verisi olarak tutulur.

**Yeni yetenekler (yapı değişikliğinin getirdiği):**
- Tarayıcıda otomatik taslak (IndexedDB), yenilemede iş kaybolmaz; çevrimdışı çalışır.
- Yinele (redo), çoklu seçim, kopyala/yapıştır, nesne kilitleme.
- Salt okunur paylaşım bağlantısı (`/t/:id`, Supabase'de `is_public` sütunu ve okuma politikası gerekir).
- SVG dışa aktarım; video kodlaması Web Worker'da, kayıt sırasında arayüz donmaz.
- Komut paleti (`Ctrl+K`).

---

## 6. Aşamalar

| # | Aşama | Çıktı | Bitiş ölçütü |
|---|---|---|---|
| 0 | Onay | Yön (A/B/C), tanıtım sayfası kararı, Koç Kaan kararı | Bu belgedeki sorular yanıtlandı |
| 1 | Temel | TS + klasör yapısı, `tokens.css`, Archivo, `ui/` bileşenleri, PRODUCT.md, DESIGN.md | Boş kabuk iki temada çalışıyor |
| 2 | Model + depo | v2 şeması, Zustand deposu, geri al/yinele, v1 geçişi, Vitest | Eski kayıt örnekleri sorunsuz açılıyor |
| 3 | Tuval | Saha, perspektif, çim, bölgeler, oyuncular, top, sürükleme | Görsel karşılaştırmada eski sahayla eşdeğer veya daha iyi |
| 4 | Araçlar | 12 çizim aracı + malzeme + bağla + şekil algılama, imza animasyonu | Eşlik listesinin çizim maddeleri işaretli |
| 5 | Denetçi + kabuk | Sol ray, sağ denetçi, üst çubuk, mobil alt çubuk ve sayfa | 390 px ve 1440 px'te tüm özellikler erişilebilir |
| 6 | Sahneler + dışa aktarım | Replay şeridi, oynatma, PNG/JPEG/SVG, WebM/MP4 (Worker) | Eski sürümle aynı video çıktıyı veriyor |
| 7 | Hesap + kayıt | Supabase akışları, Kayıtlarım, yerel taslak, paylaşım bağlantısı | KURULUM.md 7. adımdaki denemeler geçiyor |
| 8 | İlk açılış + tur | Örnek taktik, yeni Koç Kaan turu, boş durumlar | İlk dışa aktarıma 60 saniyede ulaşılıyor |
| 9 | Kalite kapısı | impeccable `audit` + `critique` + `detect`, aislopmeter, Lighthouse, klavye testi | Bölüm 8'deki eşikler sağlandı |
| 10 | (İsteğe bağlı) Tanıtım sayfası | `/` tanıtım, `/tahta` uygulama (taste-skill, Persuade modu) | taste-skill gate geçiyor |

Her aşama ayrı bir dalda, ayrı bir çekme isteğiyle ilerler; eski sürüm son aşamaya kadar yayında kalır.

---

## 7. Eşlik kontrol listesi
Bölüm 1'deki envanterin her maddesi bir Playwright testine bağlanır. Yeni sürüm, listedeki her madde yeşil olmadan `main` dalına alınmaz.

## 8. Kalite eşikleri
- **aislopmeter.netlify.app:** Yayınlanan sitenin skoru her aşamada ölçülüp bu belgeye yazılır. (Not: Bu bulut oturumunun ağ izni bu siteyi engelledi; ölçümü ya ortam ağ izni açılınca ya da senin tarayıcından yapacağız.)
- **impeccable `detect`:** Sıfır "absolute ban" bulgusu.
- **Erişilebilirlik:** WCAG 2.2 AA kontrast, tam klavye kullanımı (araçlar `V L A P R T E` vb.), görünür odak, `prefers-reduced-motion`.
- **Dokunma:** Tüm hedefler en az 44×44 px (mobil).
- **Performans:** Lighthouse mobil ≥ 90; ilk JS ≤ 180 KB gzip (video ve hesap modülleri tembel yüklenir); 22 oyuncu + 50 çizimde sürükleme 60 fps.
- **Metin:** Cümle düzeni, BÜYÜK HARF etiket yok, butonlar ne yaptığını söyler ("Kaydet" → "Kaydedildi").

## 9. Senden beklenen kararlar
1. Yön: **A Telestratör** (önerim), B Manyetik Tahta, C Soyunma Odası?
2. Ayrı bir tanıtım sayfası (`/`) olsun mu, yoksa site doğrudan tahtayla mı açılsın?
3. Koç Kaan maskotu kalsın mı (yeni stile uyarlanarak), yoksa sade bir ipucu turuna mı geçelim?
4. Paylaşım bağlantısı (Supabase'de küçük bir tablo değişikliği gerektirir) bu sürüme girsin mi?
