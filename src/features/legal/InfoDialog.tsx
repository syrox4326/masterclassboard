import { CONTACT_EMAIL, OWNER_NAME } from "../../config";
import { useUI, type InfoTab } from "../../store/ui";
import { Dialog, Segmented } from "../../ui/kit";
import "./legal.css";

const SITE = "Masterclass Board";
const TABS: { id: InfoTab; label: string }[] = [
  { id: "about", label: "Hakkında" }, { id: "privacy", label: "Gizlilik" }, { id: "terms", label: "Şartlar" },
  { id: "kvkk", label: "KVKK" }, { id: "contact", label: "İletişim" },
];

const BODY: Record<InfoTab, { title: string; body: JSX.Element }> = {
  about: {
    title: SITE,
    body: (
      <>
        <p>{SITE}, antrenörler, analistler ve oyuncular için ücretsiz bir futbol taktik tahtasıdır. Diziliş kurabilir, oyuncuları ve malzemeleri sürükleyebilir, ok ve çizgilerle hareketleri anlatabilir, sahneleri animasyon olarak oynatıp video olarak kaydedebilirsin.</p>
        <p>Üye olmadan kullanabilirsin; tahtan bu tarayıcıda taslak olarak saklanır. Üye olursan taktiklerini buluta kaydedip başka cihazdan da açabilirsin.</p>
      </>
    ),
  },
  privacy: {
    title: "Gizlilik Politikası",
    body: (
      <>
        <p><b>Hangi bilgileri topluyoruz?</b> Üye olurken verdiğin e-posta adresi, kullanıcı adı ve şifren (şifre yalnızca şifrelenmiş olarak saklanır) ile kaydettiğin taktikler. Üye olmadan kullandığında senden hiçbir kişisel bilgi istenmez.</p>
        <p><b>Bu bilgileri neden kullanıyoruz?</b> Hesabını oluşturmak, e-posta adresini doğrulamak, şifreni sıfırlamak ve taktiklerini sana göstermek için. Başka hiçbir amaçla kullanmaz, satmaz ve reklam için paylaşmayız.</p>
        <p><b>Nerede saklanıyor?</b> Hesap ve taktik verileri, hizmet aldığımız bulut veritabanı sağlayıcısında (Supabase) saklanır. E-posta doğrulama mesajları bu sağlayıcı üzerinden gönderilir. Sağlayıcının sunucuları Türkiye dışında olabilir.</p>
        <p><b>Çerezler ve tarayıcı belleği.</b> Giriş yaptığında oturumunu açık tutmak için tarayıcının yerel belleğine bir oturum bilgisi yazılır; çıkış yapınca silinir. Üzerinde çalıştığın tahta da yalnızca senin tarayıcında taslak olarak tutulur. Reklam veya takip çerezi kullanmıyoruz.</p>
        <p><b>Ne kadar saklıyoruz?</b> Hesabını sildirene kadar. Silme isteği için <b>{CONTACT_EMAIL}</b> adresine yazabilirsin.</p>
        <p><b>Hakların.</b> Verilerine erişme, düzeltme ve sildirme hakkına sahipsin. Ayrıntılar için KVKK Aydınlatma Metni'ne bak.</p>
      </>
    ),
  },
  terms: {
    title: "Kullanım Şartları",
    body: (
      <>
        <p>{SITE}'u kullanarak bu şartları kabul etmiş olursun.</p>
        <p><b>1. Hizmet.</b> Site ücretsizdir ve olduğu gibi sunulur. Kesintisiz veya hatasız çalışacağını garanti etmeyiz; özellikleri değiştirebilir veya sonlandırabiliriz.</p>
        <p><b>2. Hesap.</b> Verdiğin bilgilerin doğru olması ve şifreni güvende tutman senin sorumluluğundadır. Hesabın üzerinden yapılan işlemlerden sen sorumlusun.</p>
        <p><b>3. İçerik.</b> Yüklediğin logolar, yazdığın metinler ve kaydettiğin taktikler sana aittir. Başkalarının haklarını ihlal eden veya yasa dışı içerik yüklememelisin.</p>
        <p><b>4. Yasaklı kullanım.</b> Siteyi veya diğer kullanıcıları zarara uğratacak, sistemi aşırı yoracak veya yetkisiz erişim deneyecek kullanımlar yasaktır. Bu durumda hesabı kapatma hakkımız saklıdır.</p>
        <p><b>5. Sorumluluk.</b> Sitenin kullanımından doğabilecek dolaylı zararlardan, veri kaybından sorumlu değiliz. Önemli taktiklerini ayrıca dışa aktarıp (PNG/video) saklamanı öneririz.</p>
        <p><b>6. Değişiklik.</b> Bu şartları güncelleyebiliriz; güncel hali bu sayfada yer alır.</p>
        <p><b>7. İletişim.</b> {CONTACT_EMAIL}</p>
      </>
    ),
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    body: (
      <>
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi gereğince bilgilendirme:</p>
        <p><b>Veri sorumlusu:</b> {OWNER_NAME}. İletişim: {CONTACT_EMAIL}</p>
        <p><b>İşlenen veriler:</b> e-posta adresi, kullanıcı adı, şifre (şifrelenmiş), kayıtlı taktik içerikleri, oturum bilgisi.</p>
        <p><b>Amaç ve hukuki sebep:</b> Üyelik hizmetini sunmak, e-posta doğrulaması ve şifre yenileme yapmak, taktiklerini saklamak. Hukuki sebep: bir sözleşmenin kurulması ve ifasıyla doğrudan ilgili olması ve açık rızan.</p>
        <p><b>Aktarım:</b> Veriler, barındırma ve e-posta hizmeti aldığımız sağlayıcıya (Supabase) aktarılır; bu aktarım yurt dışına yapılabilir. Başka üçüncü kişilerle paylaşılmaz.</p>
        <p><b>Toplama yöntemi:</b> Üyelik formu aracılığıyla, elektronik ortamda.</p>
        <p><b>Hakların (md. 11):</b> Verinin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarar halinde tazminat talep etme. Başvuru için {CONTACT_EMAIL} adresine yazabilirsin.</p>
      </>
    ),
  },
  contact: {
    title: "İletişim",
    body: (
      <>
        <p>Soru, öneri, hata bildirimi veya hesap silme talebi için:</p>
        <p className="legal-mail">{CONTACT_EMAIL}</p>
        <p>Hesabınla ilgili bir talepte, hesabına kayıtlı e-posta adresinden yazman işlemi hızlandırır.</p>
      </>
    ),
  },
};

export default function InfoDialog() {
  const tab = useUI((s) => s.info);
  const set = useUI((s) => s.set);
  if (!tab) return null;
  const page = BODY[tab];
  return (
    <Dialog open onClose={() => set({ info: null })} size="md" title={page.title}>
      <Segmented label="Bölüm" size="sm" value={tab} onChange={(t) => set({ info: t })} options={TABS} />
      <div className="legal">{page.body}</div>
    </Dialog>
  );
}
