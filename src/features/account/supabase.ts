import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../../config";

/* A small client for Supabase Auth and the `tactics` table (see KURULUM.md).
   Only the public anon key lives in the page; row-level security keeps each
   user's tactics private. */

export type Session = { access_token: string; refresh_token: string; expires_at: number; user: any };
export type SbResult = { ok: boolean; status: number; data: any };

export const authConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
const SESSION_KEY = "mb_session_v1";

export const readSession = (): Session | null => { try { return JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
export const writeSession = (v: Session | null) => {
  try { if (v) window.localStorage.setItem(SESSION_KEY, JSON.stringify(v)); else window.localStorage.removeItem(SESSION_KEY); } catch { /* storage blocked */ }
};

export const redirectParam = () => "?redirect_to=" + encodeURIComponent(window.location.origin + window.location.pathname);

export async function sbFetch(path: string, { method = "GET", body, token, prefer }: { method?: string; body?: unknown; token?: string | null; prefer?: string } = {}): Promise<SbResult> {
  const headers: Record<string, string> = { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json", Authorization: `Bearer ${token || SUPABASE_ANON_KEY}` };
  if (prefer) headers.Prefer = prefer;
  let res: Response;
  try { res = await fetch(SUPABASE_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { return { ok: false, status: 0, data: null }; }
  let data: any = null;
  try { const t = await res.text(); data = t ? JSON.parse(t) : null; } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export const toSession = (d: any): Session | null => (d && d.access_token ? {
  access_token: d.access_token, refresh_token: d.refresh_token,
  expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600), user: d.user,
} : null);

export const displayNameOf = (u: any): string => (u && ((u.user_metadata && u.user_metadata.username) || (u.email ? u.email.split("@")[0] : ""))) || "";

// plain-language error text; never reveals whether an address is registered
export function authErrorText(r: SbResult): string {
  const d = r.data || {};
  const code = String(d.error_code || d.code || d.error || "");
  const msg = String(d.msg || d.message || d.error_description || "").toLowerCase();
  if (r.status === 0) return "Bağlantı kurulamadı. İnternet bağlantını kontrol edip yeniden dene.";
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) return "E-posta adresin henüz doğrulanmadı.";
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "E-posta ya da şifre hatalı.";
  if (code === "user_already_exists" || msg.includes("already registered")) return "Bu e-postayla zaten bir hesap var. Giriş yapmayı dene.";
  if (code === "weak_password" || msg.includes("password")) return "Şifre yeterince güçlü değil; en az 8 karakter olmalı.";
  if (r.status === 429 || code.includes("rate_limit")) return "Çok sık denendi. Birkaç dakika bekleyip yeniden dene.";
  if (msg.includes("valid email") || code === "validation_failed") return "Geçerli bir e-posta adresi yaz.";
  return "Bir şeyler ters gitti. Biraz sonra yeniden dene.";
}
