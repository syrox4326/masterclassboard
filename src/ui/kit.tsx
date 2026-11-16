import React from "react";
import * as RDialog from "@radix-ui/react-dialog";
import * as RTooltip from "@radix-ui/react-tooltip";
import * as RSlider from "@radix-ui/react-slider";
import { TEAM_COLORS } from "../model/constants";
import { Icon, type IconName } from "./icons";
import "./kit.css";

/* ---------- buttons ---------- */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: IconName;
  block?: boolean;
};
export const Button = React.forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "secondary", size = "md", icon, block, className = "", children, type = "button", ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} className={`btn btn-${variant} btn-${size} ${block ? "btn-block" : ""} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children && <span>{children}</span>}
    </button>
  );
});

type IconBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
  shortcut?: string;
  active?: boolean;
  size?: number;
  tipSide?: "top" | "right" | "bottom" | "left";
};
export const IconButton = React.forwardRef<HTMLButtonElement, IconBtnProps>(function IconButton(
  { icon, label, shortcut, active, size = 19, tipSide = "bottom", className = "", type = "button", ...rest }, ref,
) {
  return (
    <Tip label={label} shortcut={shortcut} side={tipSide}>
      <button ref={ref} type={type} aria-label={label} aria-pressed={active} className={`ibtn ${active ? "is-on" : ""} ${className}`} {...rest}>
        <Icon name={icon} size={size} />
      </button>
    </Tip>
  );
});

/* ---------- tooltip ---------- */

export function Tip({ label, shortcut, side = "bottom", children }: { label: string; shortcut?: string; side?: "top" | "right" | "bottom" | "left"; children: React.ReactElement }) {
  return (
    <RTooltip.Root delayDuration={350}>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content side={side} sideOffset={8} className="tip">
          {label}
          {shortcut && <kbd className="kbd">{shortcut}</kbd>}
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
export const TipProvider = RTooltip.Provider;

/* ---------- segmented control ---------- */

export function Segmented<T extends string>({ value, options, onChange, label, size = "md" }: {
  value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string; size?: "sm" | "md";
}) {
  return (
    <div className={`seg seg-${size}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? "is-on" : ""} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- colour swatches ---------- */

export function Swatches({ value, onChange, colors = TEAM_COLORS, custom = true, label }: {
  value: string; onChange: (c: string) => void; colors?: string[]; custom?: boolean; label: string;
}) {
  const known = colors.some((c) => c.toLowerCase() === value.toLowerCase());
  return (
    <div className="swatches" role="radiogroup" aria-label={label}>
      {colors.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={value.toLowerCase() === c.toLowerCase()} aria-label={c}
          className="sw" style={{ "--c": c } as React.CSSProperties} onClick={() => onChange(c)} />
      ))}
      {custom && (
        <label className={`sw sw-custom ${!known ? "is-custom" : ""}`} style={{ "--c": value } as React.CSSProperties} title="Özel renk">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Özel renk seç" />
          <Icon name="palette" size={15} />
        </label>
      )}
    </div>
  );
}

/* ---------- form field ---------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/* ---------- slider ---------- */

export function Slider({ value, min, max, step = 1, onChange, label, format }: {
  value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string; format?: (v: number) => string;
}) {
  return (
    <div className="slider-row">
      <div className="slider-head"><span>{label}</span><output>{format ? format(value) : value}</output></div>
      <RSlider.Root className="slider" value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} aria-label={label}>
        <RSlider.Track className="slider-track"><RSlider.Range className="slider-range" /></RSlider.Track>
        <RSlider.Thumb className="slider-thumb" aria-label={label} />
      </RSlider.Root>
    </div>
  );
}

/* ---------- panel section ---------- */

export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="sec">
      <header className="sec-head"><h3>{title}</h3>{action}</header>
      {children}
    </section>
  );
}

/* ---------- dialog ---------- */

export function Dialog({ open, onClose, title, description, children, footer, size = "sm" }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; size?: "sm" | "md" | "lg";
}) {
  return (
    <RDialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <RDialog.Portal>
        <RDialog.Overlay className="dlg-scrim" />
        <RDialog.Content className={`dlg dlg-${size}`} aria-describedby={description ? undefined : undefined}>
          <header className="dlg-head">
            <div>
              <RDialog.Title className="dlg-title">{title}</RDialog.Title>
              {description ? <RDialog.Description className="dlg-desc">{description}</RDialog.Description> : <RDialog.Description className="sr-only">{title}</RDialog.Description>}
            </div>
            <RDialog.Close asChild><button className="ibtn" aria-label="Kapat"><Icon name="close" size={18} /></button></RDialog.Close>
          </header>
          <div className="dlg-body">{children}</div>
          {footer && <footer className="dlg-foot">{footer}</footer>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}
