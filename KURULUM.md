# Masterclass Board — Üyelik ve E-posta Doğrulama Kurulumu

Siteyi yayınlamadan önce bu adımları bir kez yapman gerekiyor. Üyelik sistemi için ücretsiz bir hizmet olan **Supabase** kullanılıyor. Hesapları, şifreleri (şifrelenmiş), e-posta doğrulamayı ve "şifremi unuttum" e-postalarını o yönetiyor. Sitede artık demo hesap ve düz yazı şifre yok.

## 1) Supabase hesabı ve proje
1. supabase.com adresine gir, ücretsiz hesap aç.
2. "New project" de, bir isim ver, bir veritabanı şifresi belirle (bir yere not et) ve sana yakın bir bölge seç.
3. Proje hazır olunca soldan **Project Settings → API** sayfasını aç. Orada iki şey göreceksin:
   - **Project URL** (https://....supabase.co)
   - **anon public key** (uzun bir yazı; bunu sayfaya koymak güvenlidir)

## 2) Bu iki bilgiyi siteye yaz
`App.jsx` dosyasının en üstünde (yaklaşık 130. satır civarı, "ACCOUNTS (Supabase)" yazan bölüm) şunları doldur:

```js
const SUPABASE_URL = "https://SENIN-PROJEN.supabase.co";
const SUPABASE_ANON_KEY = "uzun-anon-anahtar";
const CONTACT_EMAIL = "destek@seninsiten.com";      // sitede görünecek iletişim adresi
const OWNER_NAME = "Ad Soyad veya Şirket Unvanı";   // KVKK metninde veri sorumlusu olarak yazar
```

## 3) Taktikler için tabloyu oluştur
Supabase'de soldan **SQL Editor → New query** aç, aşağıdakini yapıştırıp **Run** de. Bu, kaydedilen taktikleri tutar ve her kullanıcının yalnızca kendi taktiklerini görmesini sağlar.

```sql
create table public.tactics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.tactics enable row level security;

create policy "kendi taktiklerini gor" on public.tactics
  for select using (auth.uid() = user_id);
create policy "kendi taktigini ekle" on public.tactics
  for insert with check (auth.uid() = user_id);
create policy "kendi taktigini guncelle" on public.tactics
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kendi taktigini sil" on public.tactics
  for delete using (auth.uid() = user_id);
```

## 4) E-posta doğrulamayı aç
**Authentication → Sign In / Providers → Email** sayfasında:
- **Confirm email** açık olsun (varsayılan olarak açıktır).
- Minimum şifre uzunluğunu **8** yap.

## 5) Site adresini tanıt
**Authentication → URL Configuration** sayfasında:
- **Site URL**: sitenin gerçek adresi (örnek: https://seninsiten.com)
- **Redirect URLs**: aynı adresi ekle (örnek: https://seninsiten.com/**)

Bunu yapmazsan, e-postadaki doğrulama bağlantısı kullanıcıyı yanlış sayfaya götürür.

## 6) E-posta gönderimini gerçek hale getir (önemli)
Supabase'in kendi gönderim hizmeti yayına uygun değil: saatte çok az e-posta atar ve sadece proje ekibindeki adreslere gönderebilir. Yayından önce kendi e-posta hizmetini bağla:
- **Authentication → Emails → SMTP Settings** bölümünde "Enable custom SMTP" aç.
- Resend, Brevo veya Mailgun gibi bir hizmetten SMTP bilgilerini al (hepsinin ücretsiz paketi var) ve oraya yaz.
- Gönderen adresi için kendi alan adını kullanman gerekir (örnek: no-reply@seninsiten.com). Hizmetin bunu doğrulaması için alan adına birkaç kayıt eklemeni isteyecek, adımları kendi ekranında gösterir.

**Authentication → Emails** altında e-posta metinlerini Türkçeye çevirebilirsin ("Confirm signup" ve "Reset password" şablonları).

## 7) Denemeyi yap
1. Siteden kendi e-postanla kayıt ol.
2. Gelen kutundaki doğrulama bağlantısına tıkla; site seni içeri alır.
3. Bir taktik kaydet, çıkış yap, tekrar giriş yap ve taktiğin orada mı bak.
4. "Şifremi unuttum" ile sıfırlama e-postasını da dene.

## Notlar
- Hesap silme: Hesabım penceresinde kullanıcıya iletişim adresine yazması söyleniyor. İstersen Supabase panelinde **Authentication → Users** sayfasından hesabı silebilirsin; kullanıcının taktikleri de birlikte silinir.
- Gizlilik, Kullanım Şartları ve KVKK metinleri genel bir şablondur. Yayından önce bir hukukçuya gösterip kendi durumuna göre düzeltmeni öneririm.
