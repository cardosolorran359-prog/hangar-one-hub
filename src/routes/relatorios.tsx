import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, ClipboardList, Wallet, XCircle } from "lucide-react";
import { PageHeader, Panel, Stat } from "@/components/hangar/ui";
import { brl, budgetTotal, TECHS, useStore } from "@/lib/store";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios — Hangar One" },
    { name: "description", content: "Relatórios operacionais, financeiros e técnicos da assistência." },
    { property: "og:title", content: "Relatórios — Hangar One" },
    { property: "og:description", content: "Faturamento, fabricantes, serviços e desempenho por técnico." },
  ] }),
  component: Reports,
});

function Bars({ data, color }: { data: [string, number][]; color: string }) {
  const max = Math.max(1, ...data.map(([, v]) => v));
  return (
    <div className="space-y-3">
      {data.map(([l, v]) => (
        <div key={l}>
          <div className="flex justify-between text-sm"><span>{l}</span><span className="font-mono text-muted-foreground">{v}</span></div>
          <div className="mt-1 h-2 rounded-full bg-muted"><div className={`h-full rounded-full ${color}`} style={{ width: `${(v / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const orders = useStore((s) => s.orders);
  const devices = useStore((s) => s.devices);
  const parts = useStore((s) => s.parts);
  const done = orders.filter((o) => ["Pronto", "Entregue"].includes(o.status));
  const revenue = done.reduce((a, o) => a + budgetTotal(o), 0);
  const partsRevenue = done.reduce((a, o) => a + o.budget.items.filter((i) => i.kind === "peca").reduce((x, i) => x + i.price * i.qty, 0), 0);
  const partsCost = done.reduce((a, o) => a + o.budget.items.filter((i) => i.kind === "peca").reduce((x, i) => x + (parts.find((p) => p.desc === i.desc)?.cost ?? i.price * 0.5) * i.qty, 0), 0);
  const count = (fn: (o: (typeof orders)[number]) => string) => Object.entries(orders.reduce<Record<string, number>>((a, o) => { const k = fn(o); a[k] = (a[k] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader eyebrow="Gestão" title="Relatórios" desc="Visão consolidada da operação." />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="OS abertas" value={orders.filter((o) => !["Entregue", "Cancelado", "Pronto"].includes(o.status)).length} icon={<ClipboardList className="size-4" />} />
        <Stat label="OS concluídas" value={done.length} tone="green" icon={<CheckCircle2 className="size-4" />} />
        <Stat label="OS canceladas" value={orders.filter((o) => o.status === "Cancelado").length} tone="red" icon={<XCircle className="size-4" />} />
        <Stat label="Faturamento" value={brl(revenue)} tone="orange" icon={<Wallet className="size-4" />} hint={`Lucro estimado em peças: ${brl(partsRevenue - partsCost)}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Aparelhos por fabricante" icon={<BarChart3 className="size-3.5 text-primary" />}><Bars data={count((o) => devices.find((d) => d.id === o.deviceId)?.brand ?? "Outro")} color="bg-primary" /></Panel>
        <Panel title="Serviços mais comuns"><Bars data={count((o) => o.service)} color="bg-violet" /></Panel>
        <Panel title="Serviços por técnico"><Bars data={TECHS.map((t) => [t, orders.filter((o) => o.tech === t).length])} color="bg-success" /></Panel>
      </div>
    </div>
  );
}
