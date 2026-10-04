import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Apple, CheckCircle2, ClipboardList, FilePlus2, Info, Smartphone, TriangleAlert, Users, BarChart3, Wrench, Clock, Wallet } from "lucide-react";
import { UsbPanel } from "@/components/hangar/UsbPanel";
import { Panel, Pill, Stat, type Tone } from "@/components/hangar/ui";
import { brl, budgetTotal, fmtDate, fmtTime, osNum, statusTone, useStore, type Activity as Act, indexById, isOpen } from "@/lib/store";
import { NewOrderDialog } from "@/components/hangar/NewOrderDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hangar One" },
      { name: "description", content: "Central operacional da bancada: conexão USB, atividade, estatísticas e últimos serviços." },
      { property: "og:title", content: "Dashboard — Hangar One" },
      { property: "og:description", content: "Central operacional da assistência técnica de celulares." },
    ],
  }),
  component: Dashboard,
});

const actIcon: Record<Act["kind"], [React.ReactNode, Tone]> = {
  android: [<Smartphone key="a" className="size-4" />, "green"],
  apple: [<Apple key="b" className="size-4" />, "violet"],
  ok: [<CheckCircle2 key="c" className="size-4" />, "green"],
  info: [<Info key="d" className="size-4" />, "blue"],
  warn: [<TriangleAlert key="e" className="size-4" />, "orange"],
};

function Dashboard() {
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const activity = useStore((s) => s.activity);

  const open = orders.filter(isOpen);
  const ready = orders.filter((o) => o.status === "Pronto");
  const revenue = orders.filter((o) => ["Pronto", "Entregue"].includes(o.status)).reduce((a, o) => a + budgetTotal(o), 0);
  const devById = indexById(devices); const custById = indexById(customers);
  const dev = (id: string) => devById.get(id);
  const plat = { android: 0, apple: 0, outro: 0 };
  orders.forEach((o) => { const p = dev(o.deviceId)?.platform ?? "outro"; plat[p]++; });
  const total = orders.length || 1;

  return (
    <div className="dashboard-page space-y-6">
      <div className="dashboard-grid-motion" aria-hidden="true" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-tech text-primary">Estação de bancada</div>
          <h1 className="mt-1 font-display text-3xl font-semibold">Bom trabalho hoje.</h1>
        </div>
        <NewOrderDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="OS em andamento" value={open.length} tone="blue" icon={<Wrench className="size-4" />} hint="Abertas até entrega" />
        <Stat label="Prontas p/ retirada" value={ready.length} tone="green" icon={<CheckCircle2 className="size-4" />} hint="Avisar cliente" />
        <Stat label="Clientes" value={customers.length} tone="violet" icon={<Users className="size-4" />} hint={`${devices.length} aparelhos cadastrados`} />
        <Stat label="Faturamento" value={brl(revenue)} tone="orange" icon={<Wallet className="size-4" />} hint="Serviços prontos e entregues" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <UsbPanel />
        <Panel title="Atividade recente" icon={<Activity className="size-3.5 text-primary" />}>
          <ul className="space-y-1">
            {activity.slice(0, 7).map((a) => {
              const [icon, tone] = actIcon[a.kind];
              return (
                <li key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg border", tone === "green" ? "border-success/30 bg-success/10 text-success" : tone === "violet" ? "border-violet/30 bg-violet/10 text-violet" : tone === "orange" ? "border-warning/30 bg-warning/10 text-warning" : "border-primary/30 bg-primary/10 text-primary")}>{icon}</span>
                  <span className="flex-1 text-sm leading-snug">{a.text}</span>
                  <span className="font-mono text-xs text-muted-foreground">{fmtTime(a.at)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Estatísticas" icon={<BarChart3 className="size-3.5 text-primary" />}>
          <div className="flex items-center gap-6">
            <Donut parts={[[plat.android, "var(--success)"], [plat.apple, "var(--violet)"], [plat.outro, "var(--warning)"]]} total={orders.length} />
            <div className="flex-1 space-y-3">
              {([["Android", plat.android, "bg-success"], ["Apple", plat.apple, "bg-violet"], ["Outros", plat.outro, "bg-warning"]] as const).map(([l, v, c]) => (
                <div key={l}>
                  <div className="flex justify-between text-sm"><span>{l}</span><span className="font-mono text-muted-foreground">{v} · {Math.round((v / total) * 100)}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className={cn("h-full rounded-full", c)} style={{ width: `${(v / total) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Acesso rápido" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {([
              ["/clientes", "Clientes", Users, "violet"],
              ["/ordens", "Ordens de serviço", ClipboardList, "blue"],
              ["/diagnostico", "Diagnóstico", FilePlus2, "green"],
              ["/relatorios", "Relatórios", BarChart3, "orange"],
            ] as const).map(([to, l, Icon, tone]) => (
              <Link key={to} to={to} className="group flex flex-col gap-3 rounded-xl border border-border bg-panel p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <span className={cn("grid size-10 place-items-center rounded-lg border", tone === "violet" ? "border-violet/30 bg-violet/10 text-violet" : tone === "blue" ? "border-primary/30 bg-primary/10 text-primary" : tone === "green" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning")}><Icon className="size-5" /></span>
                <span className="text-sm font-medium">{l}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> Dica: pressione <kbd className="rounded border border-border px-1 font-mono">Ctrl K</kbd> para buscar por IMEI, telefone ou número da OS.
          </div>
        </Panel>
      </div>

      <Panel title="Últimos serviços" action={<Link to="/ordens" className="text-xs text-primary hover:underline">Ver todas</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="label-tech border-b border-border text-left">
              {["OS", "Data", "Cliente", "Dispositivo", "Serviço", "Técnico", "Valor", "Status"].map((h) => <th key={h} className="px-3 pb-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {[...orders].sort((a, b) => b.number - a.number).slice(0, 6).map((o) => {
                const c = custById.get(o.customerId); const d = dev(o.deviceId);
                return (
                  <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                    <td className="px-3 py-3"><Link to="/ordens/$id" params={{ id: o.id }} className="font-mono text-primary hover:underline">{osNum(o.number)}</Link></td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">{fmtDate(o.createdAt)}</td>
                    <td className="px-3 py-3">{c?.name}</td>
                    <td className="px-3 py-3">{d?.brand} {d?.model}</td>
                    <td className="px-3 py-3">{o.service}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.tech}</td>
                    <td className="px-3 py-3 font-mono">{o.budget.items.length ? brl(budgetTotal(o)) : "—"}</td>
                    <td className="px-3 py-3"><Pill tone={statusTone(o.status)}>{o.status}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Donut({ parts, total }: { parts: [number, string][]; total: number }) {
  const r = 44, C = 2 * Math.PI * r; let off = 0; const sum = parts.reduce((a, [v]) => a + v, 0) || 1;
  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
        {parts.map(([v, c], i) => { const len = (v / sum) * C; const el = <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={c} strokeWidth="12" strokeDasharray={`${Math.max(len - 3, 0)} ${C}`} strokeDashoffset={-off} strokeLinecap="round" />; off += len; return el; })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="font-mono text-3xl font-semibold">{total}</div><div className="label-tech">Serviços</div></div>
      </div>
    </div>
  );
}
