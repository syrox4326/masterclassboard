import { useState } from "react";
import { CONTACT_EMAIL } from "../../config";
import { useUI } from "../../store/ui";
import { Button, Dialog, Field, Segmented } from "../../ui/kit";
import { authConfigured } from "./supabase";
import { forgot, login, logout, register, resend, setNewPassword, useAuth } from "./auth";
import "./account.css";

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export function AuthDialog() {
  const mode = useUI((s) => s.auth);
  const set = useUI((s) => s.set);
  const { busy, error, sentTo } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [terms, setTerms] = useState(false);
  const [local, setLocal] = useState("");
  if (!mode) return null;
  const err = local || error;
  const close = () => { set({ auth: null }); setLocal(""); useAuth.getState().set({ error: "" }); };
  const go = (m: typeof mode) => { setLocal(""); useAuth.getState().set({ error: "" }); set({ auth: m }); };
  const guard = (fn: () => void) => () => { setLocal(""); if (!validEmail(email)) { setLocal("Geçerli bir e-posta adresi yaz."); return; } fn(); };
  const configured = authConfigured();

  if (mode === "sent") return (
    <Dialog open onClose={close} title="E-postanı kontrol et" description={`${sentTo} adresine bir doğrulama bağlantısı gönderdik.`}
      footer={<><Button variant="ghost" disabled={busy} onClick={() => resend(sentTo)}>Yeniden gönder</Button><Button variant="primary" onClick={close}>Tamam</Button></>}>
      <p className="note">Bağlantıya tıklayınca hesabın açılır. Mesajı göremiyorsan gereksiz (spam) klasörüne bak.</p>
      {err && <p className="form-error" role="alert">{err}</p>}
    </Dialog>
  );
  if (mode === "forgotSent") return (
    <Dialog open onClose={close} title="Bağlantı gönderildi" description={`Bu adres kayıtlıysa ${sentTo} adresine şifreni yenileme bağlantısı gönderdik.`}
      footer={<Button variant="primary" onClick={() => go("login")}>Girişe dön</Button>}>
      <p className="note">Gelmezse gereksiz (spam) klasörüne bak.</p>
    </Dialog>
  );
  if (mode === "forgot") return (
    <Dialog open onClose={close} title="Şifremi unuttum" description="Hesabına kayıtlı e-postayı yaz; şifreni yenilemen için bir bağlantı gönderelim."
      footer={<><Button variant="ghost" onClick={() => go("login")}>Geri</Button><Button variant="primary" disabled={busy || !configured} onClick={guard(() => forgot(email))}>Bağlantı gönder</Button></>}>
      <Field label="E-posta"><input className="input" type="email" autoCapitalize="none" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      {err && <p className="form-error" role="alert">{err}</p>}
    </Dialog>
  );

  const isLogin = mode === "login";
  return (
    <Dialog open onClose={close} title={isLogin ? "Giriş yap" : "Hesap oluştur"}
      description={isLogin ? "Taktiklerini buluta kaydet, her cihazdan aç." : "Ücretsiz. Kayıttan sonra e-postana bir doğrulama bağlantısı gelir."}
      footer={<>
        <Button variant="ghost" onClick={close}>Vazgeç</Button>
        <Button variant="primary" disabled={busy || !configured}
          onClick={guard(() => (isLogin ? login(email, password) : register({ username, email, password, password2, terms })))}>
          {isLogin ? "Giriş yap" : "Hesap oluştur"}
        </Button>
      </>}>
      <Segmented label="Giriş ya da kayıt" value={mode} onChange={(m) => go(m)} options={[{ id: "login", label: "Giriş yap" }, { id: "register", label: "Kayıt ol" }]} />
      {!configured && <p className="form-error">Üyelik sistemi henüz etkin değil. Site yöneticisinin ayarları tamamlaması gerekiyor.</p>}
      <form className="form" onSubmit={(e) => { e.preventDefault(); guard(() => (isLogin ? login(email, password) : register({ username, email, password, password2, terms })))(); }}>
        {!isLogin && <Field label="Kullanıcı adı"><input className="input" autoCapitalize="none" maxLength={30} value={username} onChange={(e) => setUsername(e.target.value)} /></Field>}
        <Field label="E-posta"><input className="input" type="email" autoCapitalize="none" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Şifre" hint={isLogin ? undefined : "En az 8 karakter"}>
          <input className="input" type="password" autoComplete={isLogin ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {!isLogin && <Field label="Şifre (tekrar)"><input className="input" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} /></Field>}
        {!isLogin && (
          <label className="check-row">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span><button type="button" className="link" onClick={() => set({ info: "terms" })}>Kullanım Şartları</button>'nı ve <button type="button" className="link" onClick={() => set({ info: "privacy" })}>Gizlilik Politikası</button>'nı okudum, kabul ediyorum.</span>
          </label>
        )}
        <button type="submit" hidden />
      </form>
      {err && <p className="form-error" role="alert">{err}</p>}
      {isLogin && sentTo && err.includes("doğrulanmadı") && <button className="link" onClick={() => resend(sentTo)}>Doğrulama e-postasını yeniden gönder</button>}
      {isLogin && <button className="link" onClick={() => go("forgot")}>Şifremi unuttum</button>}
    </Dialog>
  );
}

function PasswordFields({ onDone, submitLabel }: { onDone?: () => void; submitLabel: string }) {
  const [p1, setP1] = useState(""), [p2, setP2] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const go = async () => {
    if (p1.length < 8) { setMsg("Şifre en az 8 karakter olmalı."); return; }
    if (p1 !== p2) { setMsg("Şifreler aynı değil."); return; }
    setBusy(true); const e = await setNewPassword(p1); setBusy(false);
    setMsg(e);
    if (!e) { setP1(""); setP2(""); onDone?.(); }
  };
  return (
    <div className="form">
      <Field label="Yeni şifre" hint="En az 8 karakter"><input className="input" type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
      <Field label="Yeni şifre (tekrar)"><input className="input" type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
      {msg && <p className="form-error" role="alert">{msg}</p>}
      <div><Button disabled={busy} onClick={go}>{submitLabel}</Button></div>
    </div>
  );
}

export function NewPasswordDialog() {
  const recovery = useAuth((s) => s.recovery);
  if (!recovery) return null;
  const close = () => useAuth.getState().set({ recovery: null, session: null });
  return (
    <Dialog open onClose={close} title="Yeni şifre belirle" description="Hesabın için yeni bir şifre seç.">
      <PasswordFields submitLabel="Şifreyi kaydet" onDone={() => useAuth.getState().set({ recovery: null })} />
    </Dialog>
  );
}

export function AccountDialog() {
  const open = useUI((s) => s.account);
  const set = useUI((s) => s.set);
  const { user, email } = useAuth();
  if (!open || !user) return null;
  return (
    <Dialog open onClose={() => set({ account: false })} title="Hesabım"
      footer={<><Button variant="ghost" onClick={() => set({ account: false })}>Kapat</Button><Button icon="logout" onClick={logout}>Çıkış yap</Button></>}>
      <div className="account-card">
        <span className="account-avatar" aria-hidden="true">{user.charAt(0).toUpperCase()}</span>
        <div><strong>{user}</strong><span>{email}</span></div>
      </div>
      <h3 className="form-heading">Şifreyi değiştir</h3>
      <PasswordFields submitLabel="Şifreyi güncelle" />
      <p className="note">Hesabının ve verilerinin silinmesini istersen kayıtlı e-postandan <b>{CONTACT_EMAIL}</b> adresine yaz. Ayrıntılar <button className="link" onClick={() => set({ account: false, info: "kvkk" })}>KVKK Aydınlatma Metni</button>'nde.</p>
    </Dialog>
  );
}
