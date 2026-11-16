import React from "react";
import { DISC_R } from "../../model/constants";
import type { KitDesign } from "../../model/types";
import { isLight, shade } from "../../lib/color";

/* A player is a glossy token: shirt colour and pattern, a bevel, a soft highlight
   and the shirt number set in Barlow Condensed. */

function KitPattern({ design, c2, R }: { design: KitDesign; c2: string; R: number }) {
  const f = c2;
  const bands = (n: number, vertical: boolean) => Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 1).map((i) => {
    const h = (2 * R) / n;
    return vertical ? <rect key={i} x={-R + i * h} y={-R} width={h} height={2 * R} fill={f} /> : <rect key={i} x={-R} y={-R + i * h} width={2 * R} height={h} fill={f} />;
  });
  switch (design) {
    case "hoops": return <g>{bands(7, false)}</g>;
    case "thinhoops": return <g>{bands(13, false)}</g>;
    case "stripes": return <g>{bands(7, true)}</g>;
    case "thinstripes": return <g>{bands(13, true)}</g>;
    case "halves": return <rect x={0} y={-R} width={R} height={2 * R} fill={f} />;
    case "halvesH": return <rect x={-R} y={0} width={2 * R} height={R} fill={f} />;
    case "quarters": return <g><rect x={0} y={-R} width={R} height={R} fill={f} /><rect x={-R} y={0} width={R} height={R} fill={f} /></g>;
    case "sash": return <rect x={-R * 1.5} y={-R * 0.34} width={R * 3} height={R * 0.68} fill={f} transform="rotate(-45)" />;
    case "band": return <rect x={-R * 0.3} y={-R} width={R * 0.6} height={2 * R} fill={f} />;
    case "cross": return <g><rect x={-R * 0.26} y={-R} width={R * 0.52} height={2 * R} fill={f} /><rect x={-R} y={-R * 0.26} width={2 * R} height={R * 0.52} fill={f} /></g>;
    case "chevron": return <path d={`M ${-R} ${-R * 0.15} L 0 ${R * 0.6} L ${R} ${-R * 0.15} L ${R} ${R * 0.28} L 0 ${R * 1.03} L ${-R} ${R * 0.28} Z`} fill={f} />;
    case "checks": {
      const n = 4, h = (2 * R) / n, out: React.ReactNode[] = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2 === 1) out.push(<rect key={`${i}${j}`} x={-R + i * h} y={-R + j * h} width={h} height={h} fill={f} />);
      return <g>{out}</g>;
    }
    case "diag": return <g transform="rotate(-45)">{bands(9, true)}</g>;
    case "pinstripe": return <g>{[-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((k) => <rect key={k} x={R * k - R * 0.045} y={-R} width={R * 0.09} height={2 * R} fill={f} />)}</g>;
    case "plaid": {
      const ks = [-0.74, -0.37, 0, 0.37, 0.74];
      return (
        <g>
          {ks.map((k) => <rect key={`v${k}`} x={R * k - R * 0.1} y={-R} width={R * 0.2} height={2 * R} fill={f} fillOpacity={0.9} />)}
          {ks.map((k) => <rect key={`h${k}`} x={-R} y={R * k - R * 0.1} width={2 * R} height={R * 0.2} fill={f} fillOpacity={0.9} />)}
          {ks.map((k) => <rect key={`d${k}`} x={R * k + R * 0.16} y={-R} width={R * 0.07} height={2 * R} fill="#0B1B3A" fillOpacity={0.55} />)}
          {ks.map((k) => <rect key={`e${k}`} x={-R} y={R * k + R * 0.16} width={2 * R} height={R * 0.07} fill="#0B1B3A" fillOpacity={0.55} />)}
        </g>
      );
    }
    case "wide": return (
      <g>
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <rect x={sg * R * 0.52 - R * 0.2} y={-R} width={R * 0.4} height={2 * R} fill={f} />
            <rect x={sg * R * 0.52 - R * 0.27} y={-R} width={R * 0.06} height={2 * R} fill="#0B1B3A" />
            <rect x={sg * R * 0.52 + R * 0.21} y={-R} width={R * 0.06} height={2 * R} fill="#0B1B3A" />
          </g>
        ))}
      </g>
    );
    default: return null;
  }
}

export const PlayerDisc = React.memo(function PlayerDisc({ color, c2, design = "plain", number, vest, R = DISC_R }: {
  color: string; c2: string; design?: KitDesign; number?: string | number; vest?: string | null; R?: number;
}) {
  const rim = shade(color, -0.55);
  const plainLight = design === "plain" && isLight(color);
  const numFill = plainLight ? "#0F172A" : "#FFFFFF";
  const numStroke = plainLight ? "rgba(255,255,255,0.7)" : "rgba(8,12,20,0.85)";
  const txt = String(number == null ? "" : number).slice(0, 3);
  const fs = (txt.length >= 3 ? R * 0.72 : txt.length === 2 ? R * 0.92 : R * 1.02) * 1.12;
  return (
    <g>
      <ellipse cx={R * 0.1} cy={R * 0.92} rx={R * 0.98} ry={R * 0.4} fill="#000" opacity={0.28} />
      <circle r={R} fill={color} />
      {design !== "plain" && <g clipPath="url(#discClip)"><KitPattern design={design} c2={c2} R={R} /></g>}
      {vest && (
        <g clipPath="url(#discClip)">
          <rect x={-R * 0.69} y={-R} width={R * 1.38} height={2 * R} fill={vest} opacity={0.94} />
          {[-0.22, 0.22].map((k) => <rect key={k} x={R * k - R * 0.03} y={-R} width={R * 0.06} height={2 * R} fill={shade(vest, -0.5)} opacity={0.8} />)}
          {[-0.66, 0.66].map((k) => <rect key={k} x={R * k - R * 0.035} y={-R} width={R * 0.07} height={2 * R} fill={shade(vest, -0.5)} opacity={0.85} />)}
          <path d={`M ${-R * 0.2} ${-R} L 0 ${-R * 0.78} L ${R * 0.2} ${-R} Z`} fill="#FFFFFF" opacity={0.95} />
        </g>
      )}
      <circle r={R} fill="url(#discShade)" />
      <circle r={R * 0.84} fill="none" stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={R * 0.07} />
      <ellipse cx={-R * 0.18} cy={-R * 0.5} rx={R * 0.62} ry={R * 0.34} fill="url(#discGloss)" />
      <circle r={R} fill="none" stroke={rim} strokeWidth={0.22} />
      {txt && (
        <text y={fs * 0.355} textAnchor="middle" fontFamily="'Barlow Condensed', Barlow, sans-serif" fontWeight={700} fontSize={fs}
          fill={numFill} style={{ paintOrder: "stroke", stroke: numStroke, strokeWidth: R * 0.2, strokeLinejoin: "round" }}>{txt}</text>
      )}
    </g>
  );
});

// shared defs for every token
export function TokenDefs() {
  return (
    <>
      <linearGradient id="discShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="45%" stopColor="#fff" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.26" />
      </linearGradient>
      <radialGradient id="discGloss" cx="0.5" cy="0.35" r="0.6">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <clipPath id="discClip"><circle r={DISC_R} /></clipPath>
    </>
  );
}
