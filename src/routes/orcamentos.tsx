import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Pill, Stat } from "@/components/hangar/ui";
import { brl, budgetTotal, fmtDate, osNum, useStore } from "@/lib/store";
import { CheckCircle2, Clock, XCircle, Receipt } from "lucide-react";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({ meta: [
    { title: "Orçamentos — Hangar One" },
    { name: "description", content: "Orçamentos pendentes, aprovados e recusados com valores e garantia." },
    { property: "og:title", content: "Orçamentos — Hangar One" },
    { property: "og:description", content: "Acompanhe aprovação de orçamentos." },
  ] }),
  component: Budgets,
});

function Budgets() {
  const orders = useStore((s) => s.orders.filter((o) => o.budget.items.length));
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const sum = (a: string) => orders.filter((o) => o.budget.approval === a).reduce((x, o) => x + budgetTotal(o), 0);
  return (
    <div>
      <PageHeader eyebrow="Comercial" title="Orçamentos" desc="Edite itens e aprovação dentro de cada ordem de serviço." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat label="Pendentes" value={brl(sum("Pendente"))} tone="orange" icon={<Clock className="size-4" />} />
        <Stat label="Aprovados" value={brl(sum("Aprovado"))} tone="green" icon={<CheckCircle2 className="size-4" />} />
        <Stat label="Recusados" value={brl(sum("Recusado"))} tone="red" icon={<XCircle className="size-4" />} />
      </div>
      <Panel title="Todos os orçamentos" icon={<Receipt className="size-3.5 text-primary" />}>
        <table className="w-full text-sm">
          <thead><tr className="label-tech border-b border-border text-left">{["OS", "Data", "Cliente", "Aparelho", "Itens", "Garantia", "Total", "Aprovação"].map((h) => <th key={h} className="px-3 pb-3">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-muted/40">
                <td className="px-3 py-3"><Link to="/ordens/$id" params={{ id: o.id }} className="font-mono text-primary hover:underline">{osNum(o.number)}</Link></td>
                <td className="px-3 py-3 font-mono text-muted-foreground">{fmtDate(o.createdAt)}</td>
                <td className="px-3 py-3">{customers.find((c) => c.id === o.customerId)?.name}</td>
                <td className="px-3 py-3">{devices.find((d) => d.id === o.deviceId)?.model}</td>
                <td className="px-3 py-3 text-muted-foreground">{o.budget.items.map((i) => i.desc).join(", ")}</td>
                <td className="px-3 py-3 font-mono">{o.budget.warrantyDays}d</td>
                <td className="px-3 py-3 font-mono font-semibold">{brl(budgetTotal(o))}</td>
                <td className="px-3 py-3"><Pill tone={o.budget.approval === "Aprovado" ? "green" : o.budget.approval === "Recusado" ? "red" : "orange"}>{o.budget.approval}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
