import { CHECKLIST_ITEMS, type TestResult } from "@/lib/store";
import { cn } from "@/lib/utils";

const OPTS: { v: TestResult; l: string; c: string }[] = [
  { v: "ok", l: "OK", c: "border-success/40 bg-success/15 text-success" },
  { v: "falha", l: "Falha", c: "border-destructive/40 bg-destructive/15 text-destructive" },
  { v: "nt", l: "N/T", c: "border-border bg-muted text-foreground" },
  { v: "na", l: "N/A", c: "border-border bg-muted text-muted-foreground" },
];

export function Checklist({ value, onChange }: { value: Record<string, TestResult>; onChange: (v: Record<string, TestResult>) => void }) {
  const counts = { ok: 0, falha: 0 };
  CHECKLIST_ITEMS.forEach((i) => { if (value[i] === "ok") counts.ok++; if (value[i] === "falha") counts.falha++; });
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs">
        <span className="text-success">● {counts.ok} OK</span>
        <span className="text-destructive">● {counts.falha} falhas</span>
        <span className="text-muted-foreground">● {CHECKLIST_ITEMS.length - counts.ok - counts.falha} restantes</span>
        <button className="ml-auto text-primary hover:underline" onClick={() => onChange(Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i, value[i] ?? "ok"])))}>Marcar restantes como OK</button>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {CHECKLIST_ITEMS.map((item) => {
          const cur = value[item] ?? "nt";
          return (
            <div key={item} className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
              <span className="text-sm">{item}</span>
              <div className="flex gap-1">
                {OPTS.map((o) => (
                  <button key={o.v} onClick={() => onChange({ ...value, [item]: o.v })}
                    className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase transition-colors", cur === o.v ? o.c : "border-transparent text-muted-foreground hover:bg-muted")}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
