import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Apple, Plus, Search, Smartphone, Tablet, Lock } from "lucide-react";
import { toast } from "sonner";
import { Empty, PageHeader, Panel, Pill } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logActivity, osNum, setState, statusTone, uid, useStore, type Device, type Platform } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aparelhos")({
  head: () => ({ meta: [
    { title: "Aparelhos — Hangar One" },
    { name: "description", content: "Aparelhos vinculados a clientes, com IMEI, serial e histórico próprio." },
    { property: "og:title", content: "Aparelhos — Hangar One" },
    { property: "og:description", content: "Registro de aparelhos e histórico de serviços." },
  ] }),
  component: Aparelhos,
});

const blank = { customerId: "", brand: "", model: "", platform: "android" as Platform, imei: "", imei2: "", serial: "", os: "", color: "", storage: "", notes: "" };

function Aparelhos() {
  const devices = useStore((s) => s.devices);
  const customers = useStore((s) => s.customers);
  const orders = useStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<"todos" | Platform>("todos");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [sel, setSel] = useState<string | null>(null);

  const list = devices.filter((d) => (pf === "todos" || d.platform === pf) && [d.brand, d.model, d.imei, d.serial, customers.find((c) => c.id === d.customerId)?.name].join(" ").toLowerCase().includes(q.toLowerCase()));
  const save = () => {
    if (!f.customerId || !f.brand || !f.model) { toast.error("Cliente, fabricante e modelo são obrigatórios."); return; }
    const nd: Device = { ...f, id: uid() };
    setState((s) => ({ ...s, devices: [nd, ...s.devices] }));
    logActivity(`${nd.brand} ${nd.model} cadastrado`, nd.platform === "apple" ? "apple" : "android");
    toast.success("Aparelho cadastrado"); setOpen(false); setF(blank);
  };
  const cur = devices.find((d) => d.id === sel);

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Aparelhos" desc="Cada aparelho é um registro independente, com histórico próprio." actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Novo aparelho</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["todos", "android", "apple", "outro"] as const).map((p) => (
          <button key={p} onClick={() => setPf(p)} className={cn("rounded-lg border px-3 py-1.5 text-sm capitalize", pf === p ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-panel text-muted-foreground")}>{p}</button>
        ))}
        <div className="relative ml-auto w-full max-w-xs"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Modelo, IMEI, serial, cliente" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => {
          const c = customers.find((x) => x.id === d.customerId);
          const n = orders.filter((o) => o.deviceId === d.id).length;
          return (
            <button key={d.id} onClick={() => setSel(d.id)} className="panel group p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="flex items-start gap-4">
                <span className={cn("grid size-12 place-items-center rounded-xl border", d.platform === "apple" ? "border-violet/30 bg-violet/10 text-violet" : d.platform === "android" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning")}>
                  {d.platform === "apple" ? <Apple className="size-6" /> : d.platform === "android" ? <Smartphone className="size-6" /> : <Tablet className="size-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold">{d.brand} {d.model}</div>
                  <div className="text-sm text-muted-foreground">{c?.name}</div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{n} OS</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div><div className="label-tech">IMEI</div><div className="font-mono">{d.imei || "Não disponível"}</div></div>
                <div><div className="label-tech">Sistema</div><div>{d.os || "Não disponível"}</div></div>
                <div><div className="label-tech">Armazenamento</div><div>{d.storage || "—"}</div></div>
                <div><div className="label-tech">Cor</div><div>{d.color || "—"}</div></div>
              </div>
            </button>
          );
        })}
      </div>
      {!list.length && <Panel><Empty icon={<Tablet className="size-5" />} title="Nenhum aparelho" desc="Cadastre um aparelho vinculado a um cliente." /></Panel>}

      <Dialog open={!!cur} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-lg">
          {cur && <>
            <DialogHeader><DialogTitle className="font-display">{cur.brand} {cur.model}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([["IMEI", cur.imei], ["IMEI 2", cur.imei2], ["Serial", cur.serial], ["Sistema", cur.os], ["Armazenamento", cur.storage], ["Cor", cur.color]] as const).map(([l, v]) => (
                <div key={l}><div className="label-tech">{l}</div><div className={cn("font-mono", !v && "italic text-muted-foreground")}>{v || "Não disponível"}</div></div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground"><Lock className="size-3.5" /> Senha/PIN do aparelho é tratado como dado restrito e não é exibido aqui.</div>
            <div className="label-tech">Histórico</div>
            <ul className="space-y-2">
              {orders.filter((o) => o.deviceId === cur.id).map((o) => (
                <li key={o.id}><Link to="/ordens/$id" params={{ id: o.id }} className="flex items-center gap-3 rounded-lg border border-border p-2.5 hover:border-primary/40">
                  <span className="font-mono text-sm text-primary">{osNum(o.number)}</span><span className="flex-1 text-sm">{o.service}</span><Pill tone={statusTone(o.status)}>{o.status}</Pill>
                </Link></li>
              ))}
            </ul>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="font-display">Novo aparelho</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 grid gap-1.5"><Label>Cliente</Label>
              <Select value={f.customerId} onValueChange={(v) => setF({ ...f, customerId: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid gap-1.5"><Label>Plataforma</Label>
              <Select value={f.platform} onValueChange={(v) => setF({ ...f, platform: v as Platform })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="android">Android</SelectItem><SelectItem value="apple">Apple</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select>
            </div>
            {([["brand", "Fabricante"], ["model", "Modelo"], ["imei", "IMEI"], ["imei2", "IMEI 2"], ["serial", "Serial"], ["os", "Sistema / versão"], ["color", "Cor"], ["storage", "Armazenamento"]] as const).map(([k, l]) => (
              <div key={k} className="grid gap-1.5"><Label>{l}</Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
