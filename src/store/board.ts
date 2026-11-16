import { create } from "zustand";
import { normalizeBoard, sampleBoard } from "../model/board";
import type { BoardState, PanelId, Scene, Tool, BallStyle, EquipType } from "../model/types";

/* One store for the whole board.
   - `board` is the document (same shape as a saved tactic / a scene).
   - Every change goes through `commit`, which keeps an undo / redo history.
     Rapid bursts (typing a name, one pen stroke) merge into a single step.
   - The document, scenes and name are kept as a local draft, so a reload never loses work. */

const HISTORY_LIMIT = 60;
const MERGE_WINDOW = 600;
const DRAFT_KEY = "mb_draft_v2";

export type Orientation = "auto" | "landscape" | "portrait";
export type Theme = "dark" | "light";
export type PlayLayer = { links: BoardState["links"]; strokes: BoardState["strokes"]; texts: BoardState["texts"] } | null;

type Draft = { board: BoardState; scenes: Scene[]; name: string };
function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { board: normalizeBoard(d.board), scenes: Array.isArray(d.scenes) ? d.scenes.map(normalizeBoard) : [], name: typeof d.name === "string" ? d.name : "" };
  } catch {
    return null;
  }
}
function readTheme(): Theme {
  try {
    const v = window.localStorage.getItem("mb_theme");
    if (v === "dark" || v === "light") return v;
  } catch { /* storage blocked */ }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export type BoardStore = {
  board: BoardState;
  past: BoardState[];
  future: BoardState[];
  mergeKey: string | null;
  mergeAt: number;

  name: string;
  scenes: Scene[];
  activeScene: number;

  tool: Tool;
  drawColor: string;
  equipPick: EquipType;
  ballStyle: BallStyle;
  panel: PanelId | null;
  selectedId: string | null;
  linkFrom: string | null;
  orientation: Orientation;
  theme: Theme;

  isPlaying: boolean;
  isRecording: boolean;
  recLabel: string;
  playSpeed: number;
  playLayer: PlayLayer;
  toast: { id: number; text: string } | null;
  epoch: number; // bumped to rebuild board nodes after playback moved them directly

  commit: (fn: (b: BoardState) => BoardState, mergeKey?: string) => void;
  replace: (b: BoardState) => void;
  undo: () => void;
  redo: () => void;
  load: (b: BoardState, scenes?: Scene[], name?: string) => void;

  setName: (n: string) => void;
  setScenes: (fn: (s: Scene[]) => Scene[]) => void;
  setActiveScene: (i: number) => void;

  setTool: (t: Tool) => void;
  setDrawColor: (c: string) => void;
  setEquipPick: (t: EquipType) => void;
  setBallStyle: (s: BallStyle) => void;
  setPanel: (p: PanelId | null) => void;
  select: (id: string | null) => void;
  setLinkFrom: (id: string | null) => void;
  setOrientation: (o: Orientation) => void;
  setTheme: (t: Theme) => void;
  setPlayback: (p: Partial<Pick<BoardStore, "isPlaying" | "isRecording" | "recLabel" | "playLayer">>) => void;
  setPlaySpeed: (v: number) => void;
  notify: (text: string) => void;
  bumpEpoch: () => void;
};

const draft = typeof window !== "undefined" ? readDraft() : null;

export const useBoard = create<BoardStore>((set, get) => ({
  board: draft ? draft.board : sampleBoard(),
  past: [],
  future: [],
  mergeKey: null,
  mergeAt: 0,

  name: draft ? draft.name : "",
  scenes: draft ? draft.scenes : [],
  activeScene: -1,

  tool: "move",
  drawColor: "#FFFFFF",
  equipPick: "cone_orange",
  ballStyle: "classic",
  panel: null,
  selectedId: null,
  linkFrom: null,
  orientation: "auto",
  theme: typeof window !== "undefined" ? readTheme() : "dark",

  isPlaying: false,
  isRecording: false,
  recLabel: "",
  playSpeed: 1,
  playLayer: null,
  toast: null,
  epoch: 0,

  commit: (fn, mergeKey) => {
    const { board, past, mergeKey: lastKey, mergeAt } = get();
    const next = fn(board);
    if (next === board) return;
    const now = Date.now();
    const merging = !!mergeKey && mergeKey === lastKey && now - mergeAt < MERGE_WINDOW;
    set({
      board: next,
      past: merging ? past : [...past, board].slice(-HISTORY_LIMIT),
      future: [],
      mergeKey: mergeKey || null,
      mergeAt: now,
    });
  },
  replace: (b) => set({ board: b }),
  undo: () => {
    const { past, board, future } = get();
    if (!past.length) return;
    set({ board: past[past.length - 1], past: past.slice(0, -1), future: [board, ...future].slice(0, HISTORY_LIMIT), mergeKey: null, selectedId: null });
  },
  redo: () => {
    const { past, board, future } = get();
    if (!future.length) return;
    set({ board: future[0], future: future.slice(1), past: [...past, board].slice(-HISTORY_LIMIT), mergeKey: null, selectedId: null });
  },
  load: (b, scenes, name) => {
    const { board, past } = get();
    set({
      board: normalizeBoard(b),
      past: [...past, board].slice(-HISTORY_LIMIT),
      future: [],
      mergeKey: null,
      selectedId: null,
      linkFrom: null,
      ...(scenes ? { scenes: scenes.map(normalizeBoard), activeScene: scenes.length ? 0 : -1 } : {}),
      ...(name != null ? { name } : {}),
    });
  },

  setName: (name) => set({ name }),
  setScenes: (fn) => set({ scenes: fn(get().scenes) }),
  setActiveScene: (activeScene) => set({ activeScene }),

  setTool: (tool) => set({ tool, linkFrom: null, selectedId: tool === "move" ? get().selectedId : null }),
  setDrawColor: (drawColor) => set({ drawColor }),
  setEquipPick: (equipPick) => set({ equipPick, tool: "equip", selectedId: null }),
  setBallStyle: (ballStyle) => set({ ballStyle, tool: "ball", selectedId: null }),
  setPanel: (panel) => set({ panel }),
  select: (selectedId) => set({ selectedId }),
  setLinkFrom: (linkFrom) => set({ linkFrom }),
  setOrientation: (orientation) => set({ orientation }),
  setTheme: (theme) => {
    try { window.localStorage.setItem("mb_theme", theme); } catch { /* storage blocked */ }
    set({ theme });
  },
  setPlayback: (p) => set(p),
  setPlaySpeed: (playSpeed) => set({ playSpeed }),
  notify: (text) => set({ toast: { id: Date.now(), text } }),
  bumpEpoch: () => set({ epoch: get().epoch + 1 }),
}));

// keep a local draft of the work (debounced)
if (typeof window !== "undefined") {
  let timer: number | undefined;
  useBoard.subscribe((s, prev) => {
    if (s.board === prev.board && s.scenes === prev.scenes && s.name === prev.name) return;
    if (s.isPlaying) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ board: s.board, scenes: s.scenes, name: s.name })); } catch { /* quota or blocked */ }
    }, 400);
  });
}

export const getBoard = () => useBoard.getState();
