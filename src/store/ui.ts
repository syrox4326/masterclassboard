import { create } from "zustand";

export type TextDraft = { mode: "new" | "edit"; id: string | null; x: number; y: number; content: string; color: string; size: number };
export type InfoTab = "about" | "privacy" | "terms" | "kvkk" | "contact";
export type AuthMode = "login" | "register" | "forgot" | "sent" | "forgotSent";

type UIStore = {
  newBoard: boolean;
  shortcuts: boolean;
  info: InfoTab | null;
  auth: AuthMode | null;
  account: boolean;
  text: TextDraft | null;
  ctx: { x: number; y: number; id: string; label: string } | null;
  flyout: string | null;
  set: (p: Partial<Omit<UIStore, "set">>) => void;
};

export const useUI = create<UIStore>((set) => ({
  newBoard: false,
  shortcuts: false,
  info: null,
  auth: null,
  account: false,
  text: null,
  ctx: null,
  flyout: null,
  set: (p) => set(p),
}));

// a dialog is open: board shortcuts stay quiet
export const anyDialogOpen = () => {
  const s = useUI.getState();
  return !!(s.newBoard || s.shortcuts || s.info || s.auth || s.account || s.text);
};
