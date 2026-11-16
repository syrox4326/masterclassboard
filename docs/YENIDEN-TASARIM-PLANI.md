# Masterclass Board: Yeniden Tasarım ve Yeniden Yapılandırma Planı

Durum: taslak v2 (referans: thetacticsapp.com), onay bekliyor · Tarih: 16 Kasım 2026

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

## 3. Referans: The Tactics App (thetacticsapp.com) ve onu nasıl geçeriz

İlk taslaktaki "Telestratör" yönü iptal edildi: sahayı küçük bir kutuya hapsedip etrafını gri panellerle doldurdu,
oyuncuları düz disklere çevirdi ve eski sürümün en güçlü yanını, yani sahayı, geri plana itti.
Yeni yön, The Tactics App'in tanıtım videolarından (4 video, 19 kare) çıkarılan çalışma modeline dayanıyor.

### Onlarda gördüklerimiz
- **Saha her şey.** Çim pencerenin dört kenarına kadar uzanıyor, biçme deseni ve perspektif var, kaleler ağlı ve üç boyutlu. Kabuk sahanın üstünde yüzüyor, onu çerçevelemiyor.
- **Üstte sekmeler.** Tarayıcı gibi birden çok proje sekmesi ve ev düğmesi; ince, 32 px.
- **Solda yüzen araç hapı.** Yalnızca ikon: seç, ev takımı, rakip takım, malzeme, top, kalem, eğri, daire, kutu, dolgu, metin. Alt menüsü olanlarda küçük bir ok.
- **Sağda koyu panel, görsel seçiciler.** Saha çizgileri ve çim desenleri yazıyla değil küçük saha resimleriyle seçiliyor. Saha görünümü (yatay, dikey, yarı saha…), çim rengi noktaları. En sağda dikey sekme ikonları (Saha, Notlar, Katmanlar).
- **Yüzen takım paneli.** Pul önizlemesi, yuvarlak/eşkenar dörtgen görünüm, 1–3 renkli desen, boyut kaydırıcısı, numara aç/kapa, isim Kapalı/Üstte/Altta, takımı Yükle ve Farklı Kaydet.
- **Parlak pullar.** Oyuncular forma desenli, hafif kabartmalı, gölgeli jetonlar; numara pulun üstünde, isim altında beyaz bir hap içinde. Kaleci altın rengi.
- **Altta yüzen zaman çizelgesi hapı.** "Animated" anahtarı, numaralı kare çipleri (1…30), kare ekle/çoğalt/sil, oynat, hız, mavi Dışa aktar, geri al/yinele.
- **Yedek kulübesi şeridi.** Sahada olmayan oyuncular altta pullarıyla duruyor, sürükleyip sahaya alınıyor.
- **Oyuncu notları** (scout modu) ve 4K video dışa aktarımı.

### Nerede geçeriz
| Onlar | Biz |
|---|---|
| Yalnızca Windows ve macOS, iPad/iPhone yok | Tarayıcıda, telefonda ve tablette; kurulum yok, çevrimdışı çalışan PWA |
| Ücretli (aylık 8,99–13,99 £) | Çekirdek özellikler ücretsiz |
| İngilizce | Türkçe öncelikli |
| Kare kare animasyon | Kare kare + kareler arasında yumuşak geçiş eğrisi, oyuncu başına yol izi (ghost trail) |
| Video dışa aktarım uygulamada | Tarayıcıda WebCodecs ile 4K'ya kadar, arayüzü dondurmadan (Worker) |
| Paylaşım dosyayla | Tek tıkla salt okunur paylaşım bağlantısı, sosyal medya için dikey 9:16 dışa aktarım |
| Saha bölgeleri sınırlı | Half-space, pozisyonel oyun, 5 kulvar, üçte birler katmanları (bizde zaten var) |
| | Oyuncu bağlantılarından otomatik şekil (üçgen, hat) algılama (bizde zaten var) |

Kopyalamıyoruz: logo, mavi vurgu, yazı tipi ve isimler onların; biz Masterclass Board'un kendi kimliğiyle ilerliyoruz.

## 4. Tasarım yönü: "Saha önde"

- **Tuval eski sürümden korunur ve iyileştirilir.** Bugünkü çim, perspektif ve kaleler kullanıcının en sevdiği kısım; aynı kalitede yeni mimariye taşınır. Saha kutuya alınmaz, pencereyi doldurur.
- **Pullar yeniden çizilir.** Bugünkü düz mavi diskler yerine: forma deseni (mevcut 20 desen), hafif kabartma ve iç gölge, zeminde yumuşak gölge, pul üstünde numara, altında beyaz hap içinde isim. Kaleci ayrı renk. Seçili pulda ince bir halka.
- **Kabuk yüzer.** Solda ikon hapı, altta zaman çizelgesi hapı, üstte ince sekme çubuğu, sağda daraltılabilir panel. Hepsi sahanın üstünde, koyu yarı saydam yüzeyler. Panel kapatılınca saha tam ekran.
- **Görsel seçiciler.** Diziliş, saha tipi, çizgiler, çim rengi ve deseni, bölge katmanı, forma deseni yazı listesi yerine küçük önizleme resimleriyle seçilir.
- **Marka.** Mevcut Masterclass Board logosu ve yeşil kimlik korunur, ama vurgu yeşili sahayla yarışmayacak şekilde yalnızca birincil eylemde (Dışa aktar) ve aktif araçta kullanılır. Kabuk nötr koyu gri; açık tema da korunur.
- **Yazı.** Başlıkta mevcut kalın italik marka yazısı kalır; arayüzde okunaklı bir sans, 13–14 px'ten küçük etiket yok.

### Yeni ekran düzeni (masaüstü)
```
┌─[⌂]─[ 4-3-3 Pres × ]─[ Duran top × ]─[+]──────────────────────────────────────┐
│                                                                  ┌──────────┐│
│ ┌──┐                     ÇİM PENCERENİN KENARINA KADAR           │ Saha     ││
│ │▸ │                  ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲              │ [▦][▦][▦]││
│ │⬤ │ ev takımı       ╱      perspektifli saha     ╲             │ Görünüm  ││
│ │⬤ │ rakip          ╱    parlak pullar + isimler   ╲            │ Çim ● ● ●││
│ │⚑ │ malzeme       ╱__________________________________╲           │ [▦][▦][▦]││
│ │✎ │ çizim                                                        │ Bölgeler ││
│ │T │                                                              └──────────┘│
│ └──┘          ┌ ◉ Animasyon │ 1 2 3 [4] 5 + │ ◀ ▶ │ 1× │ Dışa aktar │ ↶ ↷ ┐       │
│ [yedekler: ⬤12 ⬤13 ⬤14 ⬤15 …]                                                  │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Mobil ve tablet (onların olmadığı yer)
Saha tam ekran; araç hapı alta yatay; panel alttan açılan sayfa; zaman çizelgesi araç hapının üstünde katlanır şerit.
Tablette masaüstü düzeni, dokunma hedefleri 44 px.

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
| 0 | Onay | Yön, tanıtım sayfası kararı, Koç Kaan kararı | Bu belgedeki sorular yanıtlandı |
| 1 | Temel + canlı prototip | Yeni kabuk mevcut tuvalin üstünde çalışır halde (önizleme bağlantısıyla), ardından | TS + klasör yapısı, `tokens.css`, Archivo, `ui/` bileşenleri, PRODUCT.md, DESIGN.md | Boş kabuk iki temada çalışıyor |
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
- **aislopmeter.netlify.app:** Yayınlanan sitenin skoru her aşamada ölçülüp bu belgeye yazılır. Ölçüm aracı kuruldu (`npx aislopmeter`).
- **impeccable `detect`:** Sıfır "absolute ban" bulgusu.
- **Erişilebilirlik:** WCAG 2.2 AA kontrast, tam klavye kullanımı (araçlar `V L A P R T E` vb.), görünür odak, `prefers-reduced-motion`.
- **Dokunma:** Tüm hedefler en az 44×44 px (mobil).
- **Performans:** Lighthouse mobil ≥ 90; ilk JS ≤ 180 KB gzip (video ve hesap modülleri tembel yüklenir); 22 oyuncu + 50 çizimde sürükleme 60 fps.
- **Metin:** Cümle düzeni, BÜYÜK HARF etiket yok, butonlar ne yaptığını söyler ("Kaydet" → "Kaydedildi").

## 9. Kararlar (16 Kasım 2026)
1. "Saha önde" yönü ve The Tactics App'ten alınacaklar: **onaylandı**.
2. Tanıtım sayfası: **olacak** (aşama 10, taste-skill ile).
3. Maskot: **kalıyor**, tasarımı yenilendi ve adı **Yılmaz Hoca** oldu.
4. Paylaşım bağlantısı: henüz karar verilmedi.

## 10. Aşama 1 ilerleme
- Yeni kabuk mevcut tuvalin üstünde çalışıyor: üstte sekme çubuğu, solda yüzen araç hapı (gruplu açılır menüler), sağda sekmeli panel (Takım, Forma, Saha, Çizim, Nesneler, Sahneler, Kayıtlar), altta sahne şeridi ve Dışa aktar.
- Diziliş seçimi küçük saha resimleriyle; pullar daha büyük ve parlak, isimler beyaz etiket içinde; tahta örnek bir 4-3-3'e karşı 4-4-2 ile açılıyor.
- Tema ziyaretçinin sistem ayarını izliyor ve seçim hatırlanıyor. Arayüz yazısı Barlow, marka ve numaralar Barlow Condensed.
- Ölçümler: aislopmeter 17 → 9/100 (kalanlar: JavaScript'siz boş sayfa, tek ikon seti, başlık hiyerarşisi; tanıtım sayfası aşamasında çözülecek). impeccable detect: 0 bulgu.

## 11. Yeniden yazım (aşama 1–9 tamamlandı)
- `src/App.jsx` (280 KB, tek bileşen) kaldırıldı. Yeni yapı: `model/` (tipler, sabitler, diziliş), `store/` (Zustand: belge, geri al/yinele, yerel taslak), `canvas/` (projeksiyon, saha, kaleler, malzemeler, toplar, pullar, etkileşim), `features/` (üst çubuk, araç hapı, panel ve yedi sekmesi, sahne şeridi, seçim düzenleyicisi, oynatma/video, dışa aktarım, hesap, yasal metinler, tur), `ui/` (tasarım sistemi, ikon seti).
- TypeScript (strict), Radix pencereleri ve ipuçları, gömülü Barlow ve Barlow Condensed.
- Yeni: yinele, Delete ile silme, tarayıcıda otomatik taslak, seçilen öğenin yanında düzenleyici, çizim rengini ve türünü sonradan değiştirme, malzeme çoğaltma, "Yeni tahta"da oyuncuları koruma seçeneği.
- Malzemeler perspektife uygun yeniden çizildi; mankenler dik duruyor.
- Eski Supabase kayıtları aynı veri biçimiyle açılıyor (geçiş gerekmez); `src/config.js` → `src/config.ts`.
- Ölçümler: aislopmeter 7/100, impeccable detect 0 bulgu, `tsc` hatasız.
- Sırada: tanıtım sayfası (aşama 10).
