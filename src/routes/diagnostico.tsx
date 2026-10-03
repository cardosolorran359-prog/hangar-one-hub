import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { Checklist } from "@/components/hangar/Checklist";
import { Empty, PageHeader, Panel, Pill } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { indexById, isOpen, osNum, setState, statusTone, useStore } from "@/lib/store";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({ meta: [
    { title: "Diagnóstico — Hangar One" },
    { name: "description", content: "Fila de diagnóstico com checklist técnico manual por aparelho." },
    { property: "og:title", content: "Diagnóstico — Hangar One" },
    { property: "og:description", content: "Checklist técnico: OK, falha, não testado e não aplicável." },
  ] }),
  component: Diag,
});

function Diag() {
  const allOrders = useStore((s) => s.orders);
  const orders = useMemo(() => allOrders.filter(isOpen), [allOrders]);
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const devById = useMemo(() => indexById(devices), [devices]);
  const custById = useMemo(() => indexById(customers), [customers]);
  const [sel, setSel] = useState<string | null>(null);
  const cur = orders.find((o) => o.id === sel) ?? orders[0];
  const upd = (patch: Partial<typeof cur>) => cur && setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === cur.id ? { ...o, ...patch } : o)) }));

  return (
    <div>
      <PageHeader eyebrow="Bancada" title="Diagnóstico técnico" desc="Selecione um aparelho em atendimento e registre cada teste." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Panel title="Em atendimento" className="p-3">
          <ul className="space-y-1">
            {orders.map((o) => {
              const d = devById.get(o.deviceId);
              const done = Object.keys(o.checklist).length;
              return (
                <li key={o.id}><button onClick={() => setSel(o.id)} className={cn("w-full rounded-lg px-3 py-2.5 text-left", cur?.id === o.id ? "bg-primary/12 ring-1 ring-primary/30" : "hover:bg-muted/50")}>
                  <div className="flex items-center justify-between"><span className="font-mono text-sm text-primary">{osNum(o.number)}</span><span className="font-mono text-[10px] text-muted-foreground">{done}/18</span></div>
                  <div className="text-sm">{d?.brand} {d?.model}</div>
                  <div className="mt-1"><Pill tone={statusTone(o.status)}>{o.status}</Pill></div>
                </button></li>
              );
            })}
          </ul>
        </Panel>
        {cur ? (
          <div className="space-y-6">
            <Panel title={`${osNum(cur.number)} · ${devById.get(cur.deviceId)?.model ?? "—"} · ${custById.get(cur.customerId)?.name ?? "—"}`}
              action={<Button asChild size="sm" variant="outline"><Link to="/ordens/$id" params={{ id: cur.id }}>Abrir OS</Link></Button>}>
              <p className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm"><span className="label-tech mr-2">Relato</span>{cur.problem}</p>
              <Checklist value={cur.checklist} onChange={(v) => upd({ checklist: v })} />
            </Panel>
            <Panel title="Laudo">
              <Textarea rows={4} value={cur.diagnosis} onChange={(e) => upd({ diagnosis: e.target.value })} placeholder="Conclusão técnica…" />
            </Panel>
          </div>
        ) : <Panel><Empty icon={<Stethoscope className="size-5" />} title="Nenhum aparelho em atendimento" /></Panel>}
      </div>
    </div>
  );
}
