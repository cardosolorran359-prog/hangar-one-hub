import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Plus, Search, Trash2, Users, Smartphone, Apple } from "lucide-react";
import { toast } from "sonner";
import { Empty, Field, PageHeader, Panel, Pill } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmtDate, logActivity, osNum, setState, statusTone, uid, useStore, type Customer } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clientes")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({ meta: [
    { title: "Clientes — Hangar One" },
    { name: "description", content: "Cadastro de clientes com histórico de aparelhos e ordens de serviço." },
    { property: "og:title", content: "Clientes — Hangar One" },
    { property: "og:description", content: "Clientes, aparelhos e histórico completo." },
  ] }),
  component: Clientes,
});

const blank: Omit<Customer, "id" | "createdAt"> = { name: "", cpf: "", phone: "", email: "", address: "", notes: "" };

function Clientes() {
  const { id } = Route.useSearch();
  const nav = useNavigate({ from: "/clientes" });
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const orders = useStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Customer | null>(null);
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);

  const list = customers.filter((c) => [c.name, c.cpf, c.phone, c.phone.replace(/\D/g, ""), c.email].join(" ").toLowerCase().includes(q.toLowerCase()));
  const sel = customers.find((c) => c.id === id) ?? list[0];

  const openNew = () => { setEdit(null); setForm(blank); setOpen(true); };
  const openEdit = (c: Customer) => { setEdit(c); setForm(c); setOpen(true); };
  const save = () => {
    if (!form.name.trim() || !form.phone.trim()) { toast.error("Nome e telefone são obrigatórios."); return; }
    if (edit) setState((s) => ({ ...s, customers: s.customers.map((c) => (c.id === edit.id ? { ...c, ...form } : c)) }));
    else {
      const nc: Customer = { ...form, id: uid(), createdAt: new Date().toISOString() };
      setState((s) => ({ ...s, customers: [nc, ...s.customers] }));
      logActivity(`Cliente ${nc.name} cadastrado`, "ok");
      nav({ search: { id: nc.id } });
    }
    toast.success("Cliente salvo"); setOpen(false);
  };
  const remove = (c: Customer) => {
    if (orders.some((o) => o.customerId === c.id)) { toast.error("Cliente possui ordens de serviço e não pode ser excluído."); return; }
    if (!confirm(`Excluir ${c.name}?`)) return;
    setState((s) => ({ ...s, customers: s.customers.filter((x) => x.id !== c.id), devices: s.devices.filter((d) => d.customerId !== c.id) }));
    nav({ search: {} });
  };

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Clientes" desc="Cada cliente guarda seus aparelhos e todo o histórico de atendimento." actions={<Button onClick={openNew}><Plus className="size-4" /> Novo cliente</Button>} />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Panel className="p-3">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Nome, CPF ou telefone" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <ul className="max-h-[65vh] space-y-1 overflow-y-auto">
            {list.map((c) => (
              <li key={c.id}>
                <button onClick={() => nav({ search: { id: c.id } })} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors", sel?.id === c.id ? "bg-primary/12 ring-1 ring-primary/30" : "hover:bg-muted/50")}>
                  <span className="grid size-9 place-items-center rounded-lg bg-violet/15 font-display font-bold text-violet">{c.name[0]}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{c.name}</span><span className="block font-mono text-xs text-muted-foreground">{c.phone}</span></span>
                  <span className="font-mono text-xs text-muted-foreground">{orders.filter((o) => o.customerId === c.id).length} OS</span>
                </button>
              </li>
            ))}
            {!list.length && <Empty icon={<Users className="size-5" />} title="Nenhum cliente encontrado" />}
          </ul>
        </Panel>

        {sel ? (
          <div className="space-y-6">
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="label-tech">Cliente desde {fmtDate(sel.createdAt)}</div>
                  <h2 className="mt-1 font-display text-2xl font-semibold">{sel.name}</h2>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm"><a href={`https://wa.me/55${sel.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(sel)}>Editar</Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(sel)}><Trash2 className="size-4" /></Button>
                </div>
              </div>
              <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                <Field label="CPF" value={sel.cpf} mono /><Field label="Telefone" value={sel.phone} mono />
                <Field label="E-mail" value={sel.email} /><Field label="Endereço" value={sel.address} />
              </div>
              {sel.notes && <p className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">{sel.notes}</p>}
            </Panel>
            <div className="grid gap-6 md:grid-cols-2">
              <Panel title="Aparelhos" action={<Link to="/aparelhos" className="text-xs text-primary hover:underline">Gerenciar</Link>}>
                <ul className="space-y-2">
                  {devices.filter((d) => d.customerId === sel.id).map((d) => (
                    <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                      {d.platform === "apple" ? <Apple className="size-5 text-violet" /> : <Smartphone className="size-5 text-success" />}
                      <div className="flex-1"><div className="text-sm font-medium">{d.brand} {d.model}</div><div className="font-mono text-xs text-muted-foreground">{d.imei || d.serial}</div></div>
                    </li>
                  ))}
                  {!devices.some((d) => d.customerId === sel.id) && <p className="text-sm text-muted-foreground">Nenhum aparelho cadastrado.</p>}
                </ul>
              </Panel>
              <Panel title="Ordens de serviço">
                <ul className="space-y-2">
                  {orders.filter((o) => o.customerId === sel.id).sort((a, b) => b.number - a.number).map((o) => (
                    <li key={o.id}>
                      <Link to="/ordens/$id" params={{ id: o.id }} className="flex items-center gap-3 rounded-lg border border-border/70 p-3 hover:border-primary/40">
                        <span className="font-mono text-sm text-primary">{osNum(o.number)}</span>
                        <span className="flex-1 truncate text-sm">{o.service}</span>
                        <Pill tone={statusTone(o.status)}>{o.status}</Pill>
                      </Link>
                    </li>
                  ))}
                  {!orders.some((o) => o.customerId === sel.id) && <p className="text-sm text-muted-foreground">Sem ordens de serviço.</p>}
                </ul>
              </Panel>
            </div>
          </div>
        ) : <Panel><Empty icon={<Users className="size-5" />} title="Selecione um cliente" /></Panel>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{edit ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {([["name", "Nome", 2], ["cpf", "CPF", 1], ["phone", "Telefone / WhatsApp", 1], ["email", "E-mail", 2], ["address", "Endereço", 2]] as const).map(([k, l, span]) => (
              <div key={k} className={cn("grid gap-1.5", span === 2 && "col-span-2")}><Label>{l}</Label><Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div className="col-span-2 grid gap-1.5"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
