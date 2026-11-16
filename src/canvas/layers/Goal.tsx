type SP = { x: number; y: number };

/* A goal as a real box: front frame (posts and crossbar), lower back frame, side nets,
   roof net and back net. FL/FR are the ground points of the front posts, BL is the ground
   point behind FL (it gives the direction the net runs). Posts stand vertical on screen.
   part="back" draws what sits behind players and balls, part="front" what sits in front. */
export function GoalFrame({ FL, FR, BL, color = "#FFFFFF", part = "all", heightRatio = 0.34 }: {
  FL: SP; FR: SP; BL: SP; color?: string; part?: "all" | "back" | "front"; heightRatio?: number;
}) {
  const W = Math.hypot(FR.x - FL.x, FR.y - FL.y) || 1;
  let ux = BL.x - FL.x, uy = BL.y - FL.y;
  const ul = Math.hypot(ux, uy) || 1;
  const dl = Math.max(ul, W * 0.2);
  ux = (ux / ul) * dl; uy = (uy / ul) * dl;
  const hh = W * heightRatio, hb = hh * 0.6;
  const up = (p: SP, h: number) => ({ x: p.x, y: p.y - h });
  const add = (p: SP, x: number, y: number) => ({ x: p.x + x, y: p.y + y });
  const TL = up(FL, hh), TR = up(FR, hh);
  const BLg = add(FL, ux, uy), BRg = add(FR, ux, uy);
  const BTL = up(BLg, hb), BTR = up(BRg, hb);
  const pts = (...ps: SP[]) => ps.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const tw = W / 7.32; // tube widths follow the goal size
  const net = (ps: SP[], op: number) => (
    <polygon points={pts(...ps)} fill="url(#netPat)" fillOpacity={op} stroke={color} strokeWidth={0.08 * tw} strokeOpacity={0.5} strokeLinejoin="round" />
  );
  const tube = (ps: SP[], w: number) => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={pts(...ps)} stroke="rgba(8,12,20,0.5)" strokeWidth={w + 0.22 * tw} />
      <polyline points={pts(...ps)} stroke={color} strokeWidth={w} />
      <polyline points={pts(...ps)} stroke="#fff" strokeOpacity={0.6} strokeWidth={w * 0.32} transform={`translate(${-0.05 * tw},${-0.05 * tw})`} />
    </g>
  );
  const back = (
    <g>
      <polygon points={pts(FL, FR, BRg, BLg)} fill="#000" fillOpacity={0.18} />
      {net([BLg, BRg, BTR, BTL], 1)}
    </g>
  );
  const front = (
    <g>
      {tube([BLg, BTL, BTR, BRg], 0.18 * tw)}
      {tube([TL, BTL], 0.18 * tw)}
      {tube([TR, BTR], 0.18 * tw)}
      {net([FL, BLg, BTL, TL], 0.6)}
      {net([FR, BRg, BTR, TR], 0.6)}
      {net([TL, TR, BTR, BTL], 0.5)}
      {tube([FL, TL, TR, FR], 0.4 * tw)}
    </g>
  );
  return <g>{part !== "front" && back}{part !== "back" && front}</g>;
}

// a placeable goal in local units (metres), turned by `ang` degrees on the ground plane
export function GoalLocal({ w, d, ang = 0, sq, part = "all" }: { w: number; d: number; ang?: number; sq: number; part?: "all" | "back" | "front" }) {
  const th = (ang * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  const pt = (x: number, y: number) => ({ x: x * c - y * s, y: (x * s + y * c) * sq });
  return <GoalFrame FL={pt(-w / 2, d / 2)} FR={pt(w / 2, d / 2)} BL={pt(-w / 2, -d / 2)} part={part} heightRatio={0.34} />;
}
