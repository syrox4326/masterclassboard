import { grassOf } from "../../model/constants";
import { useBoard } from "../../store/board";
import { registry } from "../../canvas/registry";

/* The board is drawn into a canvas as a sharp vector image at the target pixel size.
   Selection rings and other editing marks (data-ui) are left out of the picture. */

export const canvasToBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), type, q));

// fonts used inside the board, embedded so the exported image keeps them
let fontCss: string | null = null;
async function embeddedFonts(): Promise<string> {
  if (fontCss != null) return fontCss;
  const faces: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const r of Array.from(rules)) {
      // only the Barlow faces the board draws with (600/700, Latin and Turkish letters)
      if (r instanceof CSSFontFaceRule && /Barlow/.test(r.style.getPropertyValue("font-family"))) {
        const w = r.style.getPropertyValue("font-weight");
        const range = r.style.getPropertyValue("unicode-range");
        if (!/600|700/.test(w) || (range && !/U\+0000-00FF|U\+0100-02BA/i.test(range))) continue;
        const m = r.cssText.match(/url\(["']?([^"')]+)["']?\)/);
        if (!m) continue;
        try {
          const buf = await (await fetch(m[1])).arrayBuffer();
          let bin = "";
          new Uint8Array(buf).forEach((b) => { bin += String.fromCharCode(b); });
          faces.push(r.cssText.replace(m[0], `url(data:font/woff2;base64,${btoa(bin)})`));
        } catch { /* draw with fallback */ }
      }
    }
  }
  fontCss = faces.join("\n");
  return fontCss;
}

export async function snapBoard(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const svg = registry.svg;
  if (!svg) throw new Error("no board");
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-ui]").forEach((n) => n.remove());
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(canvas.width));
  clone.setAttribute("height", String(canvas.height));
  clone.style.width = canvas.width + "px";
  clone.style.height = canvas.height + "px";
  const css = await embeddedFonts();
  if (css) {
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = css;
    clone.insertBefore(style, clone.firstChild);
  }
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  img.src = url;
  try { await img.decode(); } finally { URL.revokeObjectURL(url); }
  ctx.fillStyle = grassOf(useBoard.getState().board.grassColor).a;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

export function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export const fileBase = () => {
  const n = useBoard.getState().name.trim() || "taktik";
  return n.toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşöçı]+/gi, "-").replace(/^-|-$/g, "") || "taktik";
};

// 4K still: the long side is 3840 px
export async function exportImage() {
  const st = useBoard.getState();
  try {
    const svg = registry.svg!;
    const vb = svg.viewBox.baseVal;
    const s = 3840 / Math.max(vb.width, vb.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vb.width * s);
    canvas.height = Math.round(vb.height * s);
    await snapBoard(canvas, canvas.getContext("2d")!);
    download(await canvasToBlob(canvas, "image/png"), `${fileBase()}.png`);
    st.notify("Görsel indirildi (4K PNG).");
  } catch {
    st.notify("Görsel oluşturulamadı. Sayfayı yenileyip yeniden dene.");
  }
}
