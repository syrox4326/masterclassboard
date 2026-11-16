import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from "webm-muxer";
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from "mp4-muxer";
import type { BoardState, Scene } from "../../model/types";
import { useBoard } from "../../store/board";
import { registry } from "../../canvas/registry";
import { placeAttr } from "../../canvas/projection";
import { ballFacesMarkup, matMul, rotAxis, type Mat3 } from "../../canvas/layers/Ball";
import type { BallStyle } from "../../model/types";
import { canvasToBlob, download, fileBase, snapBoard } from "../export/capture";

/* Scenes play as one continuous move: players, equipment and balls glide from each
   scene to the next while the ball really rolls. Recording renders every frame as a
   sharp image and encodes it at an exact 60 fps (WebCodecs, MP4 first), so the video
   is smooth on any computer. */

const SEGMENT_MS = 1100;
const REC_FPS = 60;
const REC_WIDTH = 1920;
const BALL_ROLL_RADIUS = 1.55;

let cancel = false;
export const stopPlayback = () => { cancel = true; };

type Pair = { p: { id: string; x: number; y: number }; target?: { x: number; y: number }; type: "token" | "equip" | "ball"; style?: BallStyle };

function buildPairs(from: Scene, to: Scene): Pair[] {
  const pair = <T extends { id: string; x: number; y: number }>(a: T[], b: T[], type: Pair["type"]): Pair[] =>
    a.map((p) => ({ p, target: (b || []).find((x) => x.id === p.id), type }));
  const out = [...pair(from.players, to.players, "token"), ...pair(from.oppPlayers, to.oppPlayers, "token"), ...pair(from.equipment || [], to.equipment || [], "equip")];
  if (from.balls && to.balls && from.balls.length === to.balls.length) {
    from.balls.forEach((b, i) => out.push({ p: b, target: to.balls[i], type: "ball", style: b.style }));
  }
  return out;
}

// rotation of a ball that rolled from a to b, a fraction f of the way, on top of what it already had
function rollMatrix(a: { id: string; x: number; y: number }, b: { x: number; y: number }, f: number): Mat3 | null {
  const P = registry.proj!.P;
  const A = P(a.x, a.y), B = P(b.x, b.y);
  const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
  const base = (registry.ballRot[a.id] as Mat3) || null;
  if (len < 1e-6) return base;
  const th = (Math.hypot(b.x - a.x, b.y - a.y) / BALL_ROLL_RADIUS) * f;
  const R = rotAxis(-dy / len, dx / len, th);
  return base ? matMul(R, base) : R;
}

function applyPairs(pairs: Pair[], t: number) {
  const P = registry.proj!.P;
  const ov: Record<string, { x: number; y: number }> = {};
  pairs.forEach(({ p, target, type, style }) => {
    if (!target) return;
    const node = registry.nodes[p.id];
    if (!node) return;
    const x = p.x + (target.x - p.x) * t, y = p.y + (target.y - p.y) * t;
    node.setAttribute("transform", placeAttr(P, x, y, Number(node.dataset.k) || 1));
    const front = registry.nodes[p.id + "~f"];
    if (front) front.setAttribute("transform", placeAttr(P, x, y, Number(front.dataset.k) || 1));
    if (type === "ball") {
      const fg = node.querySelector("[data-ball-faces]");
      if (fg) fg.innerHTML = ballFacesMarkup(style || "classic", rollMatrix(p, target, t));
    } else if (type === "token") ov[p.id] = { x, y };
  });
  registry.setLive?.(ov);
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const nextPaint = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const speed = () => useBoard.getState().playSpeed || 1;

function tweenSegment(from: Scene, to: Scene) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const duration = SEGMENT_MS / speed();
    const pairs = buildPairs(from, to);
    const step = (now: number) => {
      if (cancel) { resolve(); return; }
      const t = Math.min(1, (now - start) / duration);
      applyPairs(pairs, t);
      if (t < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}

type Sink = { grab: () => Promise<void>; hold: (k: number) => Promise<void>; ext: string; finish: () => Promise<Blob> };

async function makeSink(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<Sink> {
  if (typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined") {
    try {
      const w = canvas.width, h = canvas.height;
      const choices = [
        { codec: "avc1.64002A", kind: "mp4", mc: "avc" },
        { codec: "vp09.00.50.08", kind: "webm", mc: "V_VP9" },
        { codec: "vp8", kind: "webm", mc: "V_VP8" },
      ] as const;
      let pick: (typeof choices)[number] | null = null;
      for (const c of choices) {
        const r = await VideoEncoder.isConfigSupported({ codec: c.codec, width: w, height: h, bitrate: 16_000_000, framerate: REC_FPS });
        if (r && r.supported) { pick = c; break; }
      }
      if (pick) {
        const chosen = pick;
        const muxer: any = chosen.kind === "mp4"
          ? new Mp4Muxer({ target: new Mp4Target(), video: { codec: "avc", width: w, height: h }, fastStart: "in-memory" })
          : new WebmMuxer({ target: new WebmTarget(), video: { codec: chosen.mc, width: w, height: h, frameRate: REC_FPS } });
        let failed: unknown = null;
        const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failed = e; } });
        enc.configure({ codec: chosen.codec, width: w, height: h, bitrate: 16_000_000, framerate: REC_FPS });
        let n = 0;
        const push = async () => {
          if (failed) throw failed;
          while (enc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 4));
          const vf = new VideoFrame(canvas, { timestamp: Math.round((n * 1e6) / REC_FPS), duration: Math.round(1e6 / REC_FPS) });
          enc.encode(vf, { keyFrame: n % REC_FPS === 0 });
          vf.close();
          n++;
        };
        return {
          grab: async () => { await snapBoard(canvas, ctx); await push(); },
          hold: async (k) => { for (let i = 0; i < k; i++) await push(); },
          ext: chosen.kind,
          finish: async () => {
            await enc.flush();
            if (failed) throw failed;
            muxer.finalize();
            return new Blob([muxer.target.buffer], { type: chosen.kind === "mp4" ? "video/mp4" : "video/webm" });
          },
        };
      }
    } catch { /* fall back below */ }
  }
  // fallback: pre-rendered frames replayed into MediaRecorder at a steady rate
  if (typeof MediaRecorder === "undefined") throw new Error("no recorder");
  const frames: Blob[] = [];
  return {
    grab: async () => { await snapBoard(canvas, ctx); frames.push(await canvasToBlob(canvas, "image/jpeg", 0.93)); },
    hold: async (k) => { const f = frames[frames.length - 1]; for (let i = 0; i < k; i++) frames.push(f); },
    ext: "webm",
    finish: async () => {
      const stream = canvas.captureStream(REC_FPS);
      const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 24_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.start();
      const t0 = performance.now();
      let last = -1;
      while (last < frames.length - 1 && !cancel) {
        const idx = Math.min(frames.length - 1, Math.floor(((performance.now() - t0) * REC_FPS) / 1000));
        if (idx !== last) { ctx.drawImage(await createImageBitmap(frames[idx]), 0, 0); last = idx; }
        await frame();
      }
      await new Promise((r) => setTimeout(r, 250));
      const stopped = new Promise((res) => { rec.onstop = res; });
      rec.stop();
      await stopped;
      return new Blob(chunks, { type: "video/webm" });
    },
  };
}

export async function playScenes(record: boolean) {
  const st = useBoard.getState();
  const scenes = st.scenes;
  if (scenes.length < 2 || st.isPlaying) return;
  cancel = false;
  registry.ballRot = {};
  const before: BoardState = st.board;
  st.select(null);
  st.setPlayback({ isPlaying: true });
  st.replace(scenes[0]);
  await new Promise((r) => setTimeout(r, 70));

  let canvas: HTMLCanvasElement | null = null, ctx: CanvasRenderingContext2D | null = null, sink: Sink | null = null;
  if (record) {
    try {
      const vb = registry.svg!.viewBox.baseVal;
      canvas = document.createElement("canvas");
      canvas.width = REC_WIDTH;
      const h = Math.round((REC_WIDTH * vb.height) / vb.width);
      canvas.height = h + (h % 2);
      ctx = canvas.getContext("2d")!;
      sink = await makeSink(canvas, ctx);
      st.setPlayback({ isRecording: true, recLabel: "Video hazırlanıyor %0" });
    } catch {
      st.notify("Bu tarayıcı video kaydını desteklemiyor; animasyon yalnızca oynatılıyor.");
      record = false;
    }
  }

  const framesPer = () => Math.max(2, Math.round((SEGMENT_MS / speed() / 1000) * REC_FPS));
  const total = record ? (scenes.length - 1) * framesPer() : 0;
  let done = 0;
  const layerOf = (s: Scene) => ({ links: s.links || [], strokes: s.strokes || [], texts: s.texts || [] });

  if (record && sink) {
    st.setPlayback({ playLayer: layerOf(scenes[0]) });
    await nextPaint();
    await sink.grab();
    await sink.hold(17);
  }

  for (let i = 0; i < scenes.length - 1; i++) {
    if (cancel) break;
    useBoard.getState().setPlayback({ playLayer: layerOf(scenes[i]) });
    if (record && sink) {
      const pairs = buildPairs(scenes[i], scenes[i + 1]);
      const n = framesPer();
      for (let k = 1; k <= n; k++) {
        if (cancel) break;
        applyPairs(pairs, k / n);
        await nextPaint();
        await sink.grab();
        done++;
        if (done % 6 === 0) useBoard.getState().setPlayback({ recLabel: `Video hazırlanıyor %${Math.min(99, Math.round((done / total) * 100))}` });
      }
    } else {
      await tweenSegment(scenes[i], scenes[i + 1]);
    }
    const a = scenes[i], b = scenes[i + 1];
    if (a.balls && b.balls && a.balls.length === b.balls.length) {
      a.balls.forEach((bl, idx) => { const m = rollMatrix(bl, b.balls[idx], 1); if (m) registry.ballRot[bl.id] = m; });
    }
  }

  const s = useBoard.getState();
  if (record && sink) {
    if (!cancel) {
      try {
        await sink.hold(30);
        s.setPlayback({ recLabel: "Video tamamlanıyor" });
        const blob = await sink.finish();
        download(blob, `${fileBase()}.${sink.ext}`);
        s.notify(`Video indirildi (${sink.ext.toUpperCase()}).`);
      } catch {
        s.notify("Video oluşturulamadı.");
      }
    }
    s.setPlayback({ isRecording: false, recLabel: "" });
  }

  registry.setLive?.(null);
  s.setPlayback({ playLayer: null, isPlaying: false });
  if (!cancel) {
    s.replace(scenes[scenes.length - 1]);
    s.setActiveScene(scenes.length - 1);
  } else {
    // put every node back where the board says
    s.replace({ ...before });
    s.bumpEpoch();
  }
}
