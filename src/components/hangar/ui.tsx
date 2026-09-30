import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "blue" | "green" | "orange" | "violet" | "cyan" | "red" | "muted";

export const toneText: Record<Tone, string> = {
  blue: "text-primary", green: "text-success", orange: "text-warning", violet: "text-violet",
  cyan: "text-cyan", red: "text-destructive", muted: "text-muted-foreground",
};
export const toneBg: Record<Tone, string> = {
  blue: "bg-primary/12 border-primary/30", green: "bg-success/12 border-success/30", orange: "bg-warning/12 border-warning/30",
  violet: "bg-violet/12 border-violet/30", cyan: "bg-cyan/12 border-cyan/30", red: "bg-destructive/12 border-destructive/30",
  muted: "bg-muted border-border",
};
export const toneDot: Record<Tone, string> = {
  blue: "bg-primary", green: "bg-success", orange: "bg-warning", violet: "bg-violet", cyan: "bg-cyan", red: "bg-destructive", muted: "bg-muted-foreground",
};

export function Panel({ title, action, children, className, icon }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <section className={cn("panel p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="label-tech flex items-center gap-2">{icon}{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Pill({ tone = "muted", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", toneBg[tone], toneText[tone], className)}>
      <span className={cn("size-1.5 rounded-full", toneDot[tone])} />
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow: string; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="label-tech text-primary">{eyebrow}</div>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, tone = "blue", hint, icon }: { label: string; value: ReactNode; tone?: Tone; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="panel relative overflow-hidden p-4">
      <div className={cn("absolute inset-x-0 top-0 h-px", toneDot[tone])} style={{ opacity: 0.7 }} />
      <div className="flex items-center justify-between">
        <span className="label-tech">{label}</span>
        <span className={toneText[tone]}>{icon}</span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Field({ label, value, mono }: { label: string; value?: ReactNode; mono?: boolean }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-right text-sm", mono && "font-mono", empty && "italic text-muted-foreground/70")}>{empty ? "Não disponível" : value}</span>
    </div>
  );
}

export function Empty({ icon, title, desc, children }: { icon: ReactNode; title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">{icon}</div>
      <div className="font-medium">{title}</div>
      {desc && <p className="max-w-sm text-sm text-muted-foreground">{desc}</p>}
      {children}
    </div>
  );
}
