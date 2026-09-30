import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Clock, Plus, Printer, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Field, Panel, Pill, Empty } from "@/components/hangar/ui";
import { Checklist } from "@/components/hangar/Checklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  brl, budgetTotal, fmtDate, fmtTime, getState, logActivity, OS_STATUSES, osNum, setState, statusTone, TECHS, uid, useStore,
  type Approval, type OsStatus, type WorkOrder,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ordens/$id")({
  head: () => ({ meta: [
    { title: "Ordem de serviço — Hangar One" },
    { name: "description", content: "Detalhes da OS: diagnóstico, orçamento, reparo, testes e histórico." },
    { property: "og:title", content: "Ordem de serviço — Hangar One" },
    { property: "og:description", content: "Detalhes completos da ordem de serviço." },
  ] }),
  component: OrderPage,
});

const FLOW: OsStatus[] = ["Aberta", "Em diagnóstico", "Orçamento enviado", "Aprovado", "Em reparo", "Em testes", "Pronto", "Entregue"];

function OrderPage() {
  const { id } = Route.useParams();
  const o = useStore((s) => s.orders.find((x) => x.id === id));
  const c = useStore((s) => s.customers.find((x) => x.id === o?.customerId));
  const d = useStore((s) => s.devices.find((x) => x.id === o?.deviceId));
  const parts = useStore((s) => s.parts);
  const [newItem, setNewItem] = useState({ desc: "", price: "" });

  if (!o) return <Empty icon={<X className="size-5" />} title="OS não encontrada"><Button asChild variant="outline" size="sm"><Link to="/ordens">Voltar</Link></Button></Empty>;

  const update = (fn: (o: WorkOrder) => WorkOrder) => setState((s) => ({ ...s, orders: s.orders.map((x) => (x.id === o.id ? fn(x) : x)) }));
  const setStatus = (status: OsStatus, note?: string) => {
    if (status === o.status) return;
    update((x) => ({ ...x, status, history: [...x.history, { at: new Date().toISOString(), status, note, user: getState().user.name }] }));
    logActivity(`OS ${osNum(o.number)}: ${o.status} → ${status}`, status === "Pronto" ? "ok" : "info");
    toast.success(`Status: ${status}`);
  };
  const setApproval = (a: Approval) => {
    update((x) => ({ ...x, budget: { ...x.budget, approval: a } }));
    if (a === "Aprovado") setStatus("Aprovado", "Orçamento aprovado pelo cliente");
    if (a === "Recusado") setStatus("Cancelado", "Orçamento recusado");
  };
  const addItem = (desc: string, price: number, kind: "servico" | "peca" | "mao" = "servico") =>
    update((x) => ({ ...x, budget: { ...x.budget, items: [...x.budget.items, { id: uid(), desc, kind, qty: 1, price }] } }));
  const idx = FLOW.indexOf(o.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="icon"><Link to="/ordens"><ArrowLeft className="size-4" /></Link></Button>
        <div>
          <div className="label-tech text-primary">Ordem de serviço</div>
          <h1 className="font-mono text-3xl font-semibold">{osNum(o.number)}</h1>
        </div>
        <Pill tone={statusTone(o.status)} className="text-xs">{o.status}</Pill>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Imprimir</Button>
          <Select value={o.status} onValueChange={(v) => setStatus(v as OsStatus)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>{OS_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Panel className="p-4">
        <div className="flex items-center">
          {FLOW.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <button onClick={() => setStatus(s)} className="group flex flex-col items-center gap-1.5">
                <span className={cn("grid size-7 place-items-center rounded-full border text-[11px] font-mono transition-all",
                  i < idx ? "border-success bg-success/20 text-success" : i === idx ? "border-primary bg-primary text-primary-foreground glow" : "border-border text-muted-foreground group-hover:border-primary/50")}>
                  {i < idx ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn("hidden whitespace-nowrap text-[10px] uppercase tracking-wider lg:block", i === idx ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              </button>
              {i < FLOW.length - 1 && <div className={cn("mx-2 h-px flex-1", i < idx ? "bg-success/60" : "bg-border")} />}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Tabs defaultValue="resumo">
          <TabsList className="mb-4">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
            <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            <TabsTrigger value="reparo">Reparo e testes</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Panel title="Cliente">
                <Link to="/clientes" search={{ id: c?.id }} className="font-display text-lg font-semibold hover:text-primary">{c?.name}</Link>
                <Field label="Telefone" value={c?.phone} mono /><Field label="CPF" value={c?.cpf} mono /><Field label="E-mail" value={c?.email} />
              </Panel>
              <Panel title="Aparelho">
                <div className="font-display text-lg font-semibold">{d?.brand} {d?.model}</div>
                <Field label="IMEI" value={d?.imei} mono /><Field label="Serial" value={d?.serial} mono /><Field label="Sistema" value={d?.os} />
              </Panel>
            </div>
            <Panel title="Dados da OS">
              <div className="grid gap-x-8 md:grid-cols-2">
                <Field label="Entrada" value={`${fmtDate(o.createdAt)} ${fmtTime(o.createdAt)}`} mono />
                <Field label="Previsão" value={fmtDate(o.dueAt)} mono />
                <div className="flex items-center justify-between border-b border-border/60 py-2">
                  <span className="text-xs text-muted-foreground">Responsável</span>
                  <Select value={o.tech} onValueChange={(v) => update((x) => ({ ...x, tech: v }))}>
                    <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{TECHS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Field label="Serviço" value={o.service} />
              </div>
              <div className="mt-4 label-tech">Problema relatado</div>
              <Textarea className="mt-2" value={o.problem} onChange={(e) => update((x) => ({ ...x, problem: e.target.value }))} />
            </Panel>
          </TabsContent>

          <TabsContent value="diagnostico" className="space-y-6">
            <Panel title="Laudo técnico">
              <Textarea rows={4} placeholder="Descreva o diagnóstico encontrado…" value={o.diagnosis} onChange={(e) => update((x) => ({ ...x, diagnosis: e.target.value }))} />
            </Panel>
            <Panel title="Checklist de entrada">
              <Checklist value={o.checklist} onChange={(v) => update((x) => ({ ...x, checklist: v }))} />
            </Panel>
          </TabsContent>

          <TabsContent value="orcamento" className="space-y-6">
            <Panel title="Itens do orçamento" action={<Pill tone={o.budget.approval === "Aprovado" ? "green" : o.budget.approval === "Recusado" ? "red" : "orange"}>{o.budget.approval}</Pill>}>
              <table className="w-full text-sm">
                <tbody>
                  {o.budget.items.map((it) => (
                    <tr key={it.id} className="border-b border-border/50">
                      <td className="py-2 uppercase">{it.desc}</td>
                      <td className="w-16"><Input type="number" min={1} className="h-8" value={it.qty} onChange={(e) => update((x) => ({ ...x, budget: { ...x.budget, items: x.budget.items.map((i) => i.id === it.id ? { ...i, qty: Number(e.target.value) || 1 } : i) } }))} /></td>
                      <td className="w-32 py-2 text-right font-mono">{brl(it.price * it.qty)}</td>
                      <td className="w-10 text-right"><Button variant="ghost" size="icon" className="size-8" onClick={() => update((x) => ({ ...x, budget: { ...x.budget, items: x.budget.items.filter((i) => i.id !== it.id) } }))}><Trash2 className="size-3.5" /></Button></td>
                    </tr>
                  ))}
                  {!o.budget.items.length && <tr><td className="py-6 text-center text-muted-foreground" colSpan={4}>Nenhum item ainda.</td></tr>}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap gap-2">
                <Input className="min-w-48 flex-1" placeholder="Serviço ou mão de obra" value={newItem.desc} onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })} />
                <Input className="w-32" type="number" placeholder="Valor" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                <Button variant="outline" onClick={() => { if (!newItem.desc || !newItem.price) return; addItem(newItem.desc, Number(newItem.price)); setNewItem({ desc: "", price: "" }); }}><Plus className="size-4" /> Adicionar</Button>
                <Select onValueChange={(pid) => { const p = parts.find((x) => x.id === pid); if (p) addItem(p.desc, p.price, "peca"); }}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="+ Peça do estoque" /></SelectTrigger>
                  <SelectContent>{parts.map((p) => <SelectItem key={p.id} value={p.id}>{p.desc} · {brl(p.price)} ({p.qty} un.)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="mt-6 grid gap-3 border-t border-border pt-4 md:grid-cols-3">
                <div className="grid gap-1"><span className="label-tech">Desconto (R$)</span><Input type="number" value={o.budget.discount} onChange={(e) => update((x) => ({ ...x, budget: { ...x.budget, discount: Number(e.target.value) || 0 } }))} /></div>
                <div className="grid gap-1"><span className="label-tech">Garantia (dias)</span><Input type="number" value={o.budget.warrantyDays} onChange={(e) => update((x) => ({ ...x, budget: { ...x.budget, warrantyDays: Number(e.target.value) || 0 } }))} /></div>
                <div className="text-right"><span className="label-tech">Total</span><div className="font-mono text-3xl font-semibold text-primary">{brl(budgetTotal(o))}</div></div>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => { setApproval("Pendente"); setStatus("Orçamento enviado"); }}>Marcar como enviado</Button>
                <Button variant="outline" className="text-destructive" onClick={() => setApproval("Recusado")}><X className="size-4" /> Recusado</Button>
                <Button onClick={() => setApproval("Aprovado")}><Check className="size-4" /> Aprovado</Button>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="reparo" className="space-y-6">
            <Panel title="Reparo">
              <div className="label-tech mb-2">Procedimento realizado</div>
              <Textarea rows={4} value={o.repair.procedure} onChange={(e) => update((x) => ({ ...x, repair: { ...x.repair, procedure: e.target.value } }))} placeholder="Ex.: Substituição do display, limpeza de conectores…" />
              <div className="label-tech mb-2 mt-4">Observações / resultado dos testes</div>
              <Textarea rows={3} value={o.repair.notes} onChange={(e) => update((x) => ({ ...x, repair: { ...x.repair, notes: e.target.value } }))} />
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setStatus("Em reparo")}>Iniciar reparo</Button>
                <Button variant="outline" onClick={() => setStatus("Em testes")}>Enviar para testes</Button>
                <Button onClick={() => setStatus("Pronto", "Aprovação técnica concluída")}><Check className="size-4" /> Aprovar e marcar pronto</Button>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>

        <Panel title="Histórico de status" icon={<Clock className="size-3.5 text-primary" />} className="h-fit">
          <ol className="relative ml-2 border-l border-border">
            {[...o.history].reverse().map((h, i) => (
              <li key={i} className="mb-5 ml-5 last:mb-0">
                <span className={cn("absolute -left-[5px] mt-1.5 size-2.5 rounded-full", i === 0 ? "bg-primary shadow-[0_0_10px_var(--primary)]" : "bg-muted-foreground/50")} />
                <div className="font-mono text-xs text-muted-foreground">{fmtDate(h.at)} · {fmtTime(h.at)}</div>
                <div className="text-sm font-medium">{h.status}</div>
                <div className="text-xs text-muted-foreground">{h.note ? `${h.note} · ` : ""}{h.user}</div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
