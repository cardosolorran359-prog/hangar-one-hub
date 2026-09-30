import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { PageHeader, Panel, Pill, Empty } from "@/components/hangar/ui";
import { NewOrderDialog } from "@/components/hangar/NewOrderDialog";
import { Input } from "@/components/ui/input";
import { brl, budgetTotal, fmtDate, OS_STATUSES, osNum, statusTone, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ordens/")({
  head: () => ({ meta: [
    { title: "Ordens de serviço — Hangar One" },
    { name: "description", content: "Todas as ordens de serviço da bancada, por status." },
    { property: "og:title", content: "Ordens de serviço — Hangar One" },
    { property: "og:description", content: "Fluxo completo de OS: abertura, diagnóstico, orçamento, reparo e entrega." },
  ] }),
  component: Orders,
});

const GROUPS: Record<string, string[]> = {
  "Todas": [],
  "Diagnóstico": ["Aberta", "Aguardando diagnóstico", "Em diagnóstico"],
  "Orçamento": ["Aguardando orçamento", "Orçamento enviado", "Aguardando aprovação", "Aprovado"],
  "Bancada": ["Aguardando peça", "Em reparo", "Em testes"],
  "Prontas": ["Pronto"],
  "Finalizadas": ["Entregue", "Cancelado"],
};

function Orders() {
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const [g, setG] = useState("Todas");
  const [q, setQ] = useState("");
  const list = [...orders].sort((a, b) => b.number - a.number).filter((o) => {
    if (g !== "Todas" && !GROUPS[g].includes(o.status)) return false;
    if (!q) return true;
    const c = customers.find((x) => x.id === o.customerId); const d = devices.find((x) => x.id === o.deviceId);
    return [osNum(o.number), c?.name, c?.phone, d?.model, d?.imei, o.service].join(" ").toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <PageHeader eyebrow="Operação" title="Ordens de serviço" desc="O centro operacional da assistência." actions={<NewOrderDialog />} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {Object.keys(GROUPS).map((k) => {
          const n = k === "Todas" ? orders.length : orders.filter((o) => GROUPS[k].includes(o.status)).length;
          return (
            <button key={k} onClick={() => setG(k)} className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", g === k ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-panel text-muted-foreground hover:text-foreground")}>
              {k} <span className="ml-1 font-mono text-xs opacity-70">{n}</span>
            </button>
          );
        })}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Filtrar…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <Panel className="p-0">
        {list.length === 0 ? <Empty icon={<ClipboardList className="size-5" />} title="Nenhuma OS aqui" desc="Ajuste os filtros ou abra uma nova ordem de serviço." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="label-tech border-b border-border text-left">
                {["OS", "Entrada", "Previsão", "Cliente", "Aparelho", "Serviço", "Técnico", "Valor", "Status"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr></thead>
              <tbody>
                {list.map((o) => {
                  const c = customers.find((x) => x.id === o.customerId); const d = devices.find((x) => x.id === o.deviceId);
                  const late = new Date(o.dueAt) < new Date() && !["Pronto", "Entregue", "Cancelado"].includes(o.status);
                  return (
                    <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3"><Link to="/ordens/$id" params={{ id: o.id }} className="font-mono font-semibold text-primary hover:underline">{osNum(o.number)}</Link></td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(o.createdAt)}</td>
                      <td className={cn("px-4 py-3 font-mono", late ? "text-destructive" : "text-muted-foreground")}>{fmtDate(o.dueAt)}</td>
                      <td className="px-4 py-3">{c?.name}</td>
                      <td className="px-4 py-3">{d?.brand} {d?.model}</td>
                      <td className="px-4 py-3">{o.service}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.tech}</td>
                      <td className="px-4 py-3 font-mono">{o.budget.items.length ? brl(budgetTotal(o)) : "—"}</td>
                      <td className="px-4 py-3"><Pill tone={statusTone(o.status)}>{o.status}</Pill></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="mt-3 text-xs text-muted-foreground">{OS_STATUSES.length} status disponíveis no fluxo da OS.</p>
    </div>
  );
}
