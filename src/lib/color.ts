export function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16), g = parseInt(c.substring(2, 4), 16), b = parseInt(c.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

// mix a colour toward black (amt < 0) or white (amt > 0)
export function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) => parseInt(c.substring(i, i + 2), 16));
  const target = amt < 0 ? 0 : 255, a = Math.abs(amt);
  return "#" + ch.map((v) => Math.round(v + (target - v) * a).toString(16).padStart(2, "0")).join("");
}
