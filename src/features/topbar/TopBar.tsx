import * as Popover from "@radix-ui/react-popover";
import { useBoard } from "../../store/board";
import { useUI } from "../../store/ui";
import { useAuth } from "../account/auth";
import { BrandMark, Icon } from "../../ui/icons";
import { IconButton } from "../../ui/kit";
import "./topbar.css";

export default function TopBar() {
  const name = useBoard((s) => s.name);
  const setName = useBoard((s) => s.setName);
  const canUndo = useBoard((s) => s.past.length > 0);
  const canRedo = useBoard((s) => s.future.length > 0);
  const undo = useBoard((s) => s.undo);
  const redo = useBoard((s) => s.redo);
  const theme = useBoard((s) => s.theme);
  const setTheme = useBoard((s) => s.setTheme);
  const user = useAuth((s) => s.user);
  const ui = useUI((s) => s.set);

  const startTour = () => window.dispatchEvent(new Event("mb-tour-start"));
  const openAccount = () => (user ? ui({ account: true }) : ui({ auth: "login" }));

  return (
    <header className="topbar">
      <a className="tb-brand" href="./" aria-label="Masterclass Board">
        <BrandMark size={32} />
        <span className="tb-wordmark">Masterclass Board</span>
      </a>

      <div className="tb-doc">
        <label className="tb-name">
          <span className="sr-only">Taktik adı</span>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Adsız taktik" spellCheck={false} />
          <Icon name="edit" size={14} className="tb-name-ic" />
        </label>
        <IconButton icon="plus" label="Yeni tahta" onClick={() => ui({ newBoard: true })} data-tour="new" />
      </div>

      <div className="tb-actions">
        <IconButton icon="undo" label="Geri al" shortcut="Ctrl Z" disabled={!canUndo} onClick={undo} data-tour="undo" />
        <IconButton icon="redo" label="Yinele" shortcut="Ctrl ⇧ Z" disabled={!canRedo} onClick={redo} />
        <span className="tb-sep" />
        <div className="tb-wide">
          <IconButton icon="keyboard" label="Klavye kısayolları" shortcut="?" onClick={() => ui({ shortcuts: true })} />
          <IconButton icon="help" label="Yılmaz Hoca ile tur" onClick={startTour} data-tour="help" />
          <IconButton icon="info" label="Hakkında ve yasal metinler" onClick={() => ui({ info: "about" })} />
          <IconButton icon={theme === "dark" ? "sun" : "moon"} label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} data-tour="theme" />
        </div>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="ibtn tb-narrow" aria-label="Diğer"><Icon name="more" size={19} /></button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="menu" align="end" sideOffset={8}>
              <Popover.Close asChild><button className="menu-item" onClick={startTour}><Icon name="help" size={17} />Yılmaz Hoca ile tur</button></Popover.Close>
              <Popover.Close asChild><button className="menu-item" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><Icon name={theme === "dark" ? "sun" : "moon"} size={17} />{theme === "dark" ? "Açık tema" : "Koyu tema"}</button></Popover.Close>
              <Popover.Close asChild><button className="menu-item" onClick={() => ui({ info: "about" })}><Icon name="info" size={17} />Hakkında ve yasal metinler</button></Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <button className="tb-account" onClick={openAccount} data-tour="account">
          {user ? <span className="tb-avatar" aria-hidden="true">{user.charAt(0).toUpperCase()}</span> : <Icon name="login" size={17} />}
          <span className="tb-account-label">{user || "Giriş yap"}</span>
        </button>
      </div>
    </header>
  );
}
