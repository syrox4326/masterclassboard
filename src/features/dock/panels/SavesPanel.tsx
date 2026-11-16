import { useEffect, useState } from "react";
import { useBoard } from "../../../store/board";
import { useUI } from "../../../store/ui";
import { authConfigured } from "../../account/supabase";
import { deleteTactic, openTactic, refreshSaved, saveTactic, useAuth } from "../../account/auth";
import { Icon } from "../../../ui/icons";
import { Button, Section } from "../../../ui/kit";

export default function SavesPanel() {
  const user = useAuth((s) => s.user);
  const names = useAuth((s) => s.savedNames);
  const busy = useAuth((s) => s.savesBusy);
  const msg = useAuth((s) => s.savesMsg);
  const current = useBoard((s) => s.name);
  const [name, setName] = useState(current);
  const [del, setDel] = useState<string | null>(null);

  useEffect(() => { if (user) refreshSaved(); }, [user]);
  useEffect(() => { setName(current); }, [current]);

  if (!user) {
    return (
      <Section title="Bulut kayıtları">
        <div className="empty empty-lg">
          <Icon name="lock" size={26} />
          <p>{authConfigured() ? "Taktiklerini kaydetmek ve başka cihazdan açmak için ücretsiz bir hesapla giriş yap." : "Üyelik sistemi henüz etkin değil."}</p>
          <Button variant="primary" icon="login" disabled={!authConfigured()} onClick={() => useUI.getState().set({ auth: "login" })}>Giriş yap</Button>
        </div>
        <p className="note">Hesap olmadan da çalışabilirsin: tahtan bu tarayıcıda taslak olarak saklanır.</p>
      </Section>
    );
  }

  const exists = names.includes(name.trim());
  return (
    <>
      <Section title="Kaydet">
        <form className="save-form" onSubmit={(e) => { e.preventDefault(); saveTactic(name); }}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Taktik adı" aria-label="Taktik adı" />
          <Button type="submit" variant="primary" icon="check" disabled={!name.trim() || busy}>{exists ? "Üzerine yaz" : "Kaydet"}</Button>
        </form>
        {exists && <p className="note">Bu adla bir kayıt var; kaydedersen onun yerini alır.</p>}
        {msg && <p className="note note-warn">{msg}</p>}
      </Section>
      <Section title={`Kayıtlı taktikler${names.length ? ` (${names.length})` : ""}`}>
        {busy && names.length === 0 && <p className="note">Yükleniyor…</p>}
        {!busy && names.length === 0 && <p className="note">Henüz kayıt yok.</p>}
        <ul className="list">
          {names.map((n) => (
            <li key={n} className="list-row">
              <Icon name="pitch" size={18} className="list-ic" />
              <span className="list-name">{n}</span>
              {del === n ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setDel(null)}>Vazgeç</Button>
                  <Button size="sm" variant="danger" onClick={() => { deleteTactic(n); setDel(null); }}>Sil</Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={() => openTactic(n)} disabled={busy}>Aç</Button>
                  <button className="ibtn" aria-label={`${n} kaydını sil`} onClick={() => setDel(n)}><Icon name="trash" size={17} /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
