# Masterclass Board — Siteyi Yayınlama (GitHub ile)

Bu klasör hazır bir web sitesi projesidir. Senin yapman gereken: GitHub'a yüklemek ve yayın hizmetine bağlamak. Aşağıda en kolay yol (Cloudflare Pages / Vercel / Netlify) ve GitHub'ın kendi hizmeti (GitHub Pages) var. Hepsi ücretsiz.

## Önce: GitHub'a yükle
1. github.com'da hesabın yoksa aç.
2. Sağ üstteki **+ → New repository** de. İsim ver (örnek: `masterclass-board`), **Public** veya **Private** seç, **Create repository** de.
3. Açılan sayfada **uploading an existing file** bağlantısına tıkla.
4. Bu klasörün **içindekileri** (klasörün kendisini değil) sürükle bırak. `.github` ve `.gitignore` gizli dosya olduğu için görünmeyebilir; Windows'ta Dosya Gezgini'nde "Gizli öğeler"i, Mac'te Cmd+Shift+. ile görünür yap ve onları da ekle.
5. **Commit changes** de.

## Yol A (önerilen): Vercel veya Netlify veya Cloudflare Pages
Üçü de aynı mantıkla çalışır. Örnek olarak Vercel:
1. vercel.com'a GitHub hesabınla giriş yap.
2. **Add New → Project** de, az önce açtığın depoyu seç, **Import** de.
3. Ayarlara dokunma. Vercel projeyi kendisi tanır (Framework: Vite). **Deploy** de.
4. 1–2 dakika sonra sana `https://....vercel.app` adresi verir. Site yayında.
5. Bundan sonra GitHub'daki dosyayı her güncellediğinde site kendiliğinden yenilenir.

Netlify ve Cloudflare Pages'te de depoyu seçersin. Gerekirse şu iki değeri yaz: **Build command: `npm run build`**, **Output directory: `dist`**.

## Yol B: GitHub Pages (ayrı bir hizmet gerekmez)
1. Deponda **Settings → Pages** sayfasını aç.
2. **Source** kısmını **GitHub Actions** yap.
3. Deponun **Actions** sekmesine bak: "Siteyi yayinla" adlı işlem kendiliğinden çalışır. Yeşil olunca bitti.
4. Adresin `https://KULLANICIADIN.github.io/DEPO-ADI/` olur.

## Kendi alan adını bağlamak
Alan adını (örnek: seninsiten.com) bir yerden satın aldıktan sonra Vercel/Netlify/Cloudflare'de proje ayarlarında **Domains** bölümüne ekle; ekranda hangi kaydı yazman gerektiğini gösterir. Alan adı bağlanınca Supabase'deki **Site URL** adresini de yeni adresle değiştirmeyi unutma (KURULUM.md, 5. adım).

## Bilgisayarında denemek istersen (isteğe bağlı)
Bilgisayarında Node.js yüklüyse klasörde şunları çalıştır:
```
npm install
npm run dev
```
Çıkan adresi (genelde http://localhost:5173) tarayıcıda aç.

## Sırada ne var?
Yayına girdikten sonra, `src/App.jsx` dosyasının en üstündeki Supabase bilgilerini doldurmak için `KURULUM.md` dosyasını izle. Dosyayı GitHub'da kalem simgesiyle (Edit) düzenleyip kaydetmen yeterli; site kendini yeniler.
