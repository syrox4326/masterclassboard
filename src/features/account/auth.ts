import { create } from "zustand";
import {
  authConfigured, authErrorText, displayNameOf, readSession, redirectParam, sbFetch, toSession, writeSession, type Session,
} from "./supabase";
import { useBoard } from "../../store/board";
import { useUI } from "../../store/ui";

type AuthStore = {
  user: string | null;
  email: string;
  session: Session | null;
  busy: boolean;
  error: string;
  sentTo: string;
  recovery: string | null;
  savedNames: string[];
  savesBusy: boolean;
  savesMsg: string;
  set: (p: Partial<AuthStore>) => void;
};

export const useAuth = create<AuthStore>((set) => ({
  user: null, email: "", session: null, busy: false, error: "", sentTo: "", recovery: null,
  savedNames: [], savesBusy: false, savesMsg: "",
  set: (p) => set(p),
}));

const S = () => useAuth.getState();
const notify = (t: string) => useBoard.getState().notify(t);

function adopt(sess: Session | null) {
  writeSession(sess);
  S().set({ session: sess, user: sess ? displayNameOf(sess.user) : null, email: sess && sess.user ? sess.user.email || "" : "" });
}

export async function getToken(): Promise<string | null> {
  const sess = S().session;
  if (!sess) return null;
  if (sess.expires_at - Math.floor(Date.now() / 1000) > 60) return sess.access_token;
  const r = await sbFetch("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: sess.refresh_token } });
  const next = r.ok ? toSession(r.data) : null;
  adopt(next);
  return next ? next.access_token : null;
}

// on load: restore the sign-in, or finish an e-mail link (verification / password reset)
export function initAuth() {
  if (!authConfigured()) return;
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.includes("access_token") || hash.includes("error_description")) {
    const q = new URLSearchParams(hash);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (q.get("error_description")) { notify("Bağlantı geçersiz ya da süresi dolmuş. Yeni bir e-posta iste."); return; }
    const sess: Session = {
      access_token: q.get("access_token") || "", refresh_token: q.get("refresh_token") || "",
      expires_at: Number(q.get("expires_at")) || Math.floor(Date.now() / 1000) + Number(q.get("expires_in") || 3600), user: null,
    };
    (async () => {
      const u = await sbFetch("/auth/v1/user", { token: sess.access_token });
      if (u.ok) sess.user = u.data;
      if (q.get("type") === "recovery") S().set({ session: sess, recovery: sess.access_token });
      else { adopt(sess); notify("E-postan doğrulandı. Hoş geldin!"); }
    })();
    return;
  }
  const saved = readSession();
  if (saved) { S().set({ session: saved, user: displayNameOf(saved.user), email: saved.user?.email || "" }); getToken(); }
}

const fail = (msg: string) => { S().set({ error: msg, busy: false }); };

export async function login(email: string, password: string) {
  S().set({ error: "" });
  if (!authConfigured()) return fail("Üyelik sistemi henüz etkin değil.");
  if (!email.trim() || !password) return fail("E-posta ve şifre gerekli.");
  S().set({ busy: true });
  const r = await sbFetch("/auth/v1/token?grant_type=password", { method: "POST", body: { email: email.trim(), password } });
  S().set({ busy: false });
  const sess = r.ok ? toSession(r.data) : null;
  if (!sess) {
    S().set({ error: authErrorText(r), sentTo: String((r.data || {}).error_code) === "email_not_confirmed" ? email.trim() : S().sentTo });
    return;
  }
  adopt(sess);
  useUI.getState().set({ auth: null });
  notify(`Hoş geldin, ${displayNameOf(sess.user)}.`);
}

export async function register(f: { username: string; email: string; password: string; password2: string; terms: boolean }) {
  S().set({ error: "" });
  if (!authConfigured()) return fail("Üyelik sistemi henüz etkin değil.");
  if (!f.username.trim() || !f.email.trim() || !f.password) return fail("Bütün alanları doldur.");
  if (f.password.length < 8) return fail("Şifre en az 8 karakter olmalı.");
  if (f.password !== f.password2) return fail("Şifreler aynı değil.");
  if (!f.terms) return fail("Devam etmek için Kullanım Şartları ve Gizlilik Politikası'nı kabul etmelisin.");
  S().set({ busy: true });
  const r = await sbFetch("/auth/v1/signup" + redirectParam(), { method: "POST", body: { email: f.email.trim(), password: f.password, data: { username: f.username.trim() }, gotrue_meta_security: {} } });
  S().set({ busy: false });
  if (!r.ok) return fail(authErrorText(r));
  const sess = toSession(r.data);
  if (sess) { adopt(sess); useUI.getState().set({ auth: null }); return; }
  S().set({ sentTo: f.email.trim() });
  useUI.getState().set({ auth: "sent" });
}

export async function resend(email: string) {
  S().set({ error: "", busy: true });
  const r = await sbFetch("/auth/v1/resend" + redirectParam(), { method: "POST", body: { type: "signup", email } });
  S().set({ busy: false });
  if (!r.ok) return fail(authErrorText(r));
  S().set({ sentTo: email });
  useUI.getState().set({ auth: "sent" });
  notify("Doğrulama e-postası yeniden gönderildi.");
}

export async function forgot(email: string) {
  S().set({ error: "" });
  if (!email.trim()) return fail("E-posta adresini yaz.");
  S().set({ busy: true });
  const r = await sbFetch("/auth/v1/recover" + redirectParam(), { method: "POST", body: { email: email.trim() } });
  S().set({ busy: false });
  if (!r.ok && (r.status === 0 || r.status === 429)) return fail(authErrorText(r));
  S().set({ sentTo: email.trim() });
  useUI.getState().set({ auth: "forgotSent" });
}

export async function setNewPassword(password: string): Promise<string> {
  const rec = S().recovery;
  const token = rec || (await getToken());
  if (!token) return "Oturum bulunamadı. İşlemi baştan başlat.";
  const r = await sbFetch("/auth/v1/user", { method: "PUT", token, body: { password } });
  if (!r.ok) return authErrorText(r);
  if (rec) { const sess = S().session; if (sess) adopt({ ...sess, user: r.data || sess.user }); S().set({ recovery: null }); }
  notify("Şifren güncellendi.");
  return "";
}

export async function logout() {
  const token = S().session?.access_token;
  adopt(null);
  S().set({ savedNames: [] });
  useUI.getState().set({ account: false });
  if (token && authConfigured()) sbFetch("/auth/v1/logout", { method: "POST", token });
  notify("Çıkış yaptın.");
}

/* ---------- saved tactics ---------- */

export async function refreshSaved() {
  if (!S().user) return;
  S().set({ savesBusy: true });
  const token = await getToken();
  if (token) {
    const r = await sbFetch("/rest/v1/tactics?select=name&order=updated_at.desc", { token });
    if (r.ok && Array.isArray(r.data)) S().set({ savedNames: r.data.map((x: { name: string }) => x.name) });
    else S().set({ savesMsg: "Kayıtlar yüklenemedi." });
  }
  S().set({ savesBusy: false });
}

export async function saveTactic(name: string) {
  const n = name.trim();
  if (!S().user || !n) return;
  S().set({ savesBusy: true, savesMsg: "" });
  const token = await getToken();
  if (!token) { S().set({ savesMsg: "Oturumun sona erdi. Yeniden giriş yap.", savesBusy: false }); return; }
  const st = useBoard.getState();
  const r = await sbFetch("/rest/v1/tactics?on_conflict=user_id,name", {
    method: "POST", token, prefer: "resolution=merge-duplicates,return=minimal",
    body: { user_id: S().session!.user.id, name: n, data: { ...st.board, scenes: st.scenes }, updated_at: new Date().toISOString() },
  });
  if (r.ok) { st.setName(n); notify(`"${n}" kaydedildi.`); } else S().set({ savesMsg: "Kaydedilemedi. Yeniden dene." });
  await refreshSaved();
  S().set({ savesBusy: false });
}

export async function openTactic(name: string) {
  if (!S().user) return;
  S().set({ savesBusy: true, savesMsg: "" });
  const token = await getToken();
  const r = token ? await sbFetch(`/rest/v1/tactics?name=eq.${encodeURIComponent(name)}&select=data`, { token }) : null;
  if (r && r.ok && r.data && r.data[0]) {
    const d = r.data[0].data;
    useBoard.getState().load(d, Array.isArray(d.scenes) ? d.scenes : [], name);
    notify(`"${name}" açıldı.`);
  } else S().set({ savesMsg: "Kayıt bulunamadı." });
  S().set({ savesBusy: false });
}

export async function deleteTactic(name: string) {
  if (!S().user) return;
  S().set({ savesBusy: true });
  const token = await getToken();
  if (token) await sbFetch(`/rest/v1/tactics?name=eq.${encodeURIComponent(name)}`, { method: "DELETE", token });
  await refreshSaved();
  S().set({ savesBusy: false });
  notify(`"${name}" silindi.`);
}
