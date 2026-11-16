import React from "react";

/* Masterclass Board icon set: drawn for this product on a 24 px grid,
   1.8 px round strokes. Football-specific glyphs (pitch, cone, kit, ball,
   formation) share the same weight as the generic ones. */

type P = { size?: number; className?: string; title?: string };
const Svg = ({ size = 20, className, title, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    {children}
  </svg>
);

export type IconName = keyof typeof ICONS;

const ICONS = {
  select: <path d="M6 4.5l11.5 6.2-5 1.6-2.2 5-4.3-12.8z" />,
  link: <><circle cx="6" cy="17" r="2.6" /><circle cx="18" cy="7" r="2.6" /><path d="M8.2 15.5l7.6-7" /></>,
  line: <path d="M5 19L19 5" />,
  arrow: <><path d="M5 19L18 6" /><path d="M11 6h7v7" /></>,
  darrow: <><path d="M5 19l2.4-2.4M10 14l2.4-2.4" /><path d="M11 6h7v7" /><path d="M18 6l-3 3" /></>,
  curve: <><path d="M5 19c0-8 5-13 13-13" /><path d="M13.5 3.8L18.2 6l-2.4 4.6" /></>,
  pen: <><path d="M4 20c2.5-.5 3.6-2.3 5-4.6 1.6-2.6 3.4-5.6 6.4-7.4" /><path d="M14 6.2l3.8 3.8 2.2-2.2-3.8-3.8z" /></>,
  rect: <rect x="4.5" y="6" width="15" height="12" rx="1.5" />,
  frect: <><rect x="4.5" y="6" width="15" height="12" rx="1.5" fill="currentColor" fillOpacity="0.28" /></>,
  zone: <><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" strokeDasharray="2.6 2.2" /><circle cx="9" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="2" /></>,
  text: <><path d="M6 6.5V5h12v1.5" /><path d="M12 5v14" /><path d="M9.5 19h5" /></>,
  eraser: <><path d="M8.5 19.5L4 15l9.5-9.5 6 6-8 8" /><path d="M8.5 19.5H20" /><path d="M9 10l5.5 5.5" /></>,
  cone: <><path d="M8.6 17L11 6h2l2.4 11" /><path d="M9.6 12.5h4.8" /><path d="M5 17.5h14" /><path d="M5 17.5c0 1 3 1.8 7 1.8s7-.8 7-1.8" /></>,
  ball: <><circle cx="12" cy="12" r="8" /><path d="M12 8.2l3.2 2.3-1.2 3.8h-4l-1.2-3.8z" /><path d="M12 4v4.2M15.2 10.5L19.4 9M14 14.3l2.6 3.6M10 14.3l-2.6 3.6M8.8 10.5L4.6 9" /></>,
  team: <><circle cx="8.5" cy="9" r="3" /><circle cx="16.5" cy="10" r="2.4" /><path d="M3 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M14.6 14.4c2.6-.6 5 .8 5.9 3.6" /></>,
  kit: <path d="M9 4.5L5 6.4 3.5 11l2.6 1.1.9-1.7V19.5h10V10.4l.9 1.7 2.6-1.1L19 6.4l-4-1.9c-.5 1.3-1.6 2-3 2s-2.5-.7-3-2z" />,
  pitch: <><rect x="3.5" y="5" width="17" height="14" rx="1.4" /><path d="M12 5v14" /><circle cx="12" cy="12" r="2.6" /><path d="M3.5 9.2h2.6v5.6H3.5M20.5 9.2h-2.6v5.6h2.6" /></>,
  formation: <><circle cx="12" cy="18.5" r="1.6" /><circle cx="6.5" cy="13.5" r="1.6" /><circle cx="12" cy="13.5" r="1.6" /><circle cx="17.5" cy="13.5" r="1.6" /><circle cx="8.5" cy="7.5" r="1.6" /><circle cx="15.5" cy="7.5" r="1.6" /><circle cx="12" cy="3.8" r="1.4" /></>,
  scenes: <><rect x="3.5" y="7" width="13" height="10" rx="1.6" /><path d="M19.5 8.5v7M8.5 10l3.5 2-3.5 2z" /></>,
  saves: <path d="M3.5 7.5c0-1.1.9-2 2-2h4l2 2.2h7c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2z" />,
  objects: <><path d="M5.6 18L8.4 7h2.2L13.4 18" /><path d="M6.8 13.4h5.4" /><path d="M3.5 18.5h12" /><circle cx="18" cy="15.5" r="3" /></>,
  undo: <><path d="M9 14L4.5 9.5 9 5" /><path d="M4.5 9.5H15a4.5 4.5 0 010 9h-3" /></>,
  redo: <><path d="M15 14l4.5-4.5L15 5" /><path d="M19.5 9.5H9a4.5 4.5 0 000 9h3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="1.6" fill="currentColor" stroke="none" />,
  record: <><rect x="3.5" y="6.5" width="12" height="11" rx="2" /><path d="M15.5 10.5l5-3v9l-5-3" /></>,
  download: <><path d="M12 4v11" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M5 19.5h14" /></>,
  upload: <><path d="M12 15V4" /><path d="M7.5 8.5L12 4l4.5 4.5" /><path d="M5 19.5h14" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.5a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.8" /><path d="M12 17h.01" strokeWidth={2.4} /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><path d="M12 7.6h.01" strokeWidth={2.4} /></>,
  sun: <><circle cx="12" cy="12" r="3.8" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>,
  moon: <path d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z" />,
  keyboard: <><rect x="3" y="6.5" width="18" height="11" rx="2" /><path d="M6.5 10h.01M9.5 10h.01M12.5 10h.01M15.5 10h.01M17.5 10h.01M7.5 14h9" strokeWidth={2} /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c1-3.6 3.7-5.5 7-5.5s6 1.9 7 5.5" /></>,
  login: <><path d="M14 4.5h3.5a2 2 0 012 2v11a2 2 0 01-2 2H14" /><path d="M10 8l4 4-4 4" /><path d="M14 12H4.5" /></>,
  logout: <><path d="M10 4.5H6.5a2 2 0 00-2 2v11a2 2 0 002 2H10" /><path d="M15 8l4 4-4 4" /><path d="M19 12H9.5" /></>,
  chevronDown: <path d="M7 10l5 5 5-5" />,
  chevronRight: <path d="M10 7l5 5-5 5" />,
  trash: <><path d="M4.5 7h15" /><path d="M9.5 7V4.8h5V7" /><path d="M6.5 7l.8 12.2c.1.8.7 1.3 1.5 1.3h6.4c.8 0 1.4-.5 1.5-1.3L17.5 7" /></>,
  rotate: <><path d="M19 12a7 7 0 11-2.1-5" /><path d="M19.5 4.5v4h-4" /></>,
  duplicate: <><rect x="8" y="8" width="11.5" height="11.5" rx="2" /><path d="M15.5 8V6.5a2 2 0 00-2-2h-7a2 2 0 00-2 2v7a2 2 0 002 2H8" /></>,
  edit: <><path d="M4.5 19.5l1-4L15 6l3 3-9.5 9.5z" /><path d="M13 8l3 3" /></>,
  more: <><circle cx="6" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="18" cy="12" r="1.3" fill="currentColor" /></>,
  arrowUp: <path d="M12 19V5M6.5 10.5L12 5l5.5 5.5" />,
  arrowDown: <path d="M12 5v14M6.5 13.5L12 19l5.5-5.5" />,
  refresh: <><path d="M19.5 12a7.5 7.5 0 01-13.2 4.9" /><path d="M4.5 12a7.5 7.5 0 0113.2-4.9" /><path d="M18 3.5v4h-4M6 20.5v-4h4" /></>,
  palette: <><path d="M12 3.5a8.5 8.5 0 100 17c1.3 0 1.8-.9 1.4-1.9-.5-1.2.3-2.4 1.6-2.4H17a3.5 3.5 0 003.5-3.5c0-5.1-3.8-9.2-8.5-9.2z" /><circle cx="7.8" cy="11" r="1" fill="currentColor" /><circle cx="10.5" cy="7.4" r="1" fill="currentColor" /><circle cx="15" cy="7.8" r="1" fill="currentColor" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>,
} satisfies Record<string, React.ReactNode>;

export function Icon({ name, ...rest }: P & { name: IconName }) {
  return <Svg {...rest}>{ICONS[name]}</Svg>;
}

// the brand mark: a tilted pitch with a run drawn on it
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="4" width="36" height="32" rx="8" fill="#2E7D32" />
      <rect x="2" y="2" width="36" height="31" rx="8" fill="#4CAF50" />
      <path d="M8.5 8 H31.5 L34 27 H6 Z" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" opacity="0.95" />
      <line x1="7.2" y1="17.5" x2="32.8" y2="17.5" stroke="#fff" strokeWidth="1.05" opacity="0.9" />
      <ellipse cx="20" cy="17.5" rx="4.2" ry="3.1" fill="none" stroke="#fff" strokeWidth="1.05" opacity="0.9" />
      <path d="M12 25 C15 16 21 24 28 12" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M24.4 11 L29.9 10 L28.6 15.3 Z" fill="#fff" />
      <circle cx="11.5" cy="25.5" r="2.2" fill="#fff" />
      <circle cx="11.5" cy="25.5" r="0.85" fill="#4CAF50" />
    </svg>
  );
}
