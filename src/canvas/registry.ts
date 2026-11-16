import type { Projection } from "./projection";

/* Live handles into the rendered board, shared by the board, playback and export.
   Dragging and playback move nodes directly (no React render per frame). */
export const registry: {
  svg: SVGSVGElement | null;
  nodes: Record<string, SVGGElement>;
  proj: Projection | null;
  ballRot: Record<string, number[][]>;
  setLive: ((ov: Record<string, { x: number; y: number }> | null) => void) | null;
} = { svg: null, nodes: {}, proj: null, ballRot: {}, setLive: null };
