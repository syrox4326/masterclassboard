import { useEffect, useState } from "react";
import { TOOLS } from "../model/constants";
import type { Tool } from "../model/types";
import { useBoard } from "../store/board";
import { anyDialogOpen, useUI } from "../store/ui";
import Board, { eraseFrom } from "../canvas/Board";
import TopBar from "../features/topbar/TopBar";
import ToolPill from "../features/toolbar/ToolPill";
import Timeline from "../features/timeline/Timeline";
import Inspector from "../features/inspector/Inspector";
import { DockPanel, DockRail } from "../features/dock/Dock";
import { ContextMenu, NewBoardDialog, ShortcutsDialog, TextDialog, Toast } from "../features/dialogs/Dialogs";
import { AccountDialog, AuthDialog, NewPasswordDialog } from "../features/account/AccountDialogs";
import InfoDialog from "../features/legal/InfoDialog";
import Tour from "../features/onboarding/Tour";
import { initAuth } from "../features/account/auth";
import { TokenThumbDefs } from "../features/dock/thumbs";
import { TipProvider } from "../ui/kit";
import { grassOf } from "../model/constants";
import "./app.css";

const KEY_TOOLS: Record<string, Tool> = Object.fromEntries(
  Object.values(TOOLS).filter((t) => t.key).map((t) => [t.key!.toLowerCase(), t.id]),
);

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (anyDialogOpen()) return;
      const st = useBoard.getState();
      if (st.isPlaying) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); if (e.shiftKey) st.redo(); else st.undo(); return; }
      if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); st.redo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (k === "?" || (k === "/" && e.shiftKey)) { useUI.getState().set({ shortcuts: true }); return; }
      if ((k === "delete" || k === "backspace") && st.selectedId && !"ha".includes(st.selectedId[0])) {
        e.preventDefault();
        const id = st.selectedId;
        st.commit((b) => eraseFrom(b, id));
        st.select(null);
        return;
      }
      if (k === "escape") { useUI.getState().set({ flyout: null }); if (st.tool !== "move") st.setTool("move"); return; }
      if (KEY_TOOLS[k]) st.setTool(KEY_TOOLS[k]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function ToolHint() {
  const tool = useBoard((s) => s.tool);
  const setTool = useBoard((s) => s.setTool);
  const hint = TOOLS[tool]?.hint;
  if (tool === "move" || !hint) return null;
  return (
    <div className="tool-hint" role="status">
      <span>{hint}</span>
      <button className="btn btn-secondary btn-sm" onClick={() => setTool("move")}>Bitti</button>
    </div>
  );
}

export default function App() {
  const theme = useBoard((s) => s.theme);
  const grass = useBoard((s) => grassOf(s.board.grassColor).a);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  useShortcuts();
  useEffect(() => { initAuth(); }, []);
  useEffect(() => {
    document.documentElement.style.background = theme === "dark" ? "#15181a" : "#e7ebe8";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#1c1f22" : "#ffffff");
  }, [theme]);

  return (
    <TipProvider delayDuration={350}>
      <div className="app" data-theme={theme}>
        <TopBar />
        <div className="workspace">
          <main className="stage" ref={setStage} style={{ background: grass }}>
            <Board />
            <ToolPill />
            <Timeline />
            <ToolHint />
            <Inspector stage={stage} />
          </main>
          <DockPanel />
          <DockRail />
        </div>
        <NewBoardDialog />
        <TextDialog />
        <ShortcutsDialog />
        <AuthDialog />
        <AccountDialog />
        <NewPasswordDialog />
        <InfoDialog />
        <ContextMenu />
        <Toast />
        <TokenThumbDefs />
        <Tour />
      </div>
    </TipProvider>
  );
}
