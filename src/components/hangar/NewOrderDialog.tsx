import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getState, logActivity, osNum, setState, TECHS, uid, useStore, type WorkOrder } from "@/lib/store";

export function NewOrderDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const nav = useNavigate();
  const [f, setF] = useState({ customerId: "", deviceId: "", service: "", problem: "", tech: TECHS[0], days: "3" });
  const custDevices = devices.filter((d) => d.customerId === f.customerId);

  const submit = () => {
    if (!f.customerId || !f.deviceId || !f.problem.trim()) { toast.error("Informe cliente, aparelho e problema relatado."); return; }
    const number = Math.max(0, ...getState().orders.map((o) => o.number)) + 1;
    const now = new Date(); const due = new Date(); due.setDate(due.getDate() + Number(f.days || 3));
    const o: WorkOrder = {
      id: uid(), number, customerId: f.customerId, deviceId: f.deviceId, createdAt: now.toISOString(), dueAt: due.toISOString(),
      tech: f.tech, problem: f.problem, service: f.service || "Diagnóstico", diagnosis: "", status: "Aberta",
      budget: { items: [], discount: 0, warrantyDays: 90, approval: "Pendente" }, checklist: {}, repair: { procedure: "", notes: "" },
      history: [{ at: now.toISOString(), status: "Aberta", user: getState().user.name }],
    };
    setState((s) => ({ ...s, orders: [o, ...s.orders] }));
    logActivity(`OS ${osNum(number)} aberta`, "info");
    toast.success(`OS ${osNum(number)} criada`);
    setOpen(false);
    setF({ customerId: "", deviceId: "", service: "", problem: "", tech: TECHS[0], days: "3" });
    nav({ to: "/ordens/$id", params: { id: o.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button><Plus className="size-4" /> Nova ordem de serviço</Button>}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Nova ordem de serviço</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2"><Label>Cliente</Label>
            <Select value={f.customerId} onValueChange={(v) => setF({ ...f, customerId: v, deviceId: "" })}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Aparelho</Label>
            <Select value={f.deviceId} onValueChange={(v) => setF({ ...f, deviceId: v })} disabled={!f.customerId}>
              <SelectTrigger><SelectValue placeholder={f.customerId && !custDevices.length ? "Cliente sem aparelhos — cadastre em Aparelhos" : "Selecione o aparelho"} /></SelectTrigger>
              <SelectContent>{custDevices.map((d) => <SelectItem key={d.id} value={d.id}>{d.brand} {d.model} · {d.imei || d.serial}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Serviço</Label><Input value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} placeholder="Ex.: Troca de tela" /></div>
            <div className="grid gap-2"><Label>Técnico</Label>
              <Select value={f.tech} onValueChange={(v) => setF({ ...f, tech: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TECHS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2"><Label>Problema relatado</Label><Textarea rows={3} value={f.problem} onChange={(e) => setF({ ...f, problem: e.target.value })} placeholder="Descreva o que o cliente relatou" /></div>
          <div className="grid gap-2"><Label>Previsão de entrega (dias)</Label><Input type="number" min={0} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Abrir OS</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
