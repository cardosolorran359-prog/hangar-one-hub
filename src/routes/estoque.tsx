import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Package, Plus, Search, TriangleAlert, Boxes, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Stat } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, logActivity, setState, uid, useStore, type Part } from "@/lib/store";

export const Route = createFileRoute("/estoque")({
  head: () => ({ meta: [
    { title: "Estoque — Hangar One" },
    { name: "description", content: "Peças, quantidades, estoque mínimo, localização e movimentações." },
    { property: "og:title", content: "Estoque — Hangar One" },
    { property: "og:description", content: "Controle de peças da assistência." },
  ] }),
  component: Estoque,
});

const blank = { code: "", desc: "", category: "", compat: "", supplier: "", cost: 0, price: 0, qty: 0, min: 1, location: "" };

function Estoque() {
  const parts = useStore((s) => s.parts);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const list = parts.filter((p) => [p.code, p.desc, p.compat, p.category].join(" ").toLowerCase().includes(q.toLowerCase()));
  const low = parts.filter((p) => p.qty <= p.min);
  const move = (p: Part, delta: number) => {
    if (p.qty + delta < 0) return;
    setState((s) => ({ ...s, parts: s.parts.map((x) => (x.id === p.id ? { ...x, qty: x.qty + delta } : x)) }));
    if (p.qty + delta <= p.min) logActivity(`Estoque baixo: ${p.desc}`, "warn");
  };
  const save = () => {
    if (!f.desc || !f.code) { toast.error("Código e descrição são obrigatórios."); return; }
    setState((s) => ({ ...s, parts: [{ ...f, id: uid() }, ...s.parts] }));
    toast.success("Peça cadastrada"); setOpen(false); setF(blank);
  };

  return (
    <div>
      <PageHeader eyebrow="Suprimentos" title="Estoque" desc="Entradas e saídas rápidas direto da bancada." actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Nova peça</Button>} />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat label="Itens cadastrados" value={parts.length} icon={<Boxes className="size-4" />} />
        <Stat label="Abaixo do mínimo" value={low.length} tone="orange" icon={<TriangleAlert className="size-4" />} hint={low.map((p) => p.code).join(", ") || "Tudo certo"} />
        <Stat label="Valor em estoque (custo)" value={brl(parts.reduce((a, p) => a + p.cost * p.qty, 0))} tone="green" icon={<Wallet className="size-4" />} />
      </div>
      <Panel title="Peças" icon={<Package className="size-3.5 text-primary" />} action={<div className="relative w-64"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar peça" value={q} onChange={(e) => setQ(e.target.value)} /></div>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="label-tech border-b border-border text-left">{["Código", "Descrição", "Categoria", "Compatível", "Local", "Custo", "Preço", "Quantidade", ""].map((h) => <th key={h} className="px-3 pb-3">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/40">
                  <td className="px-3 py-3 font-mono text-primary">{p.code}</td>
                  <td className="px-3 py-3">{p.desc}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.compat}</td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">{p.location}</td>
                  <td className="px-3 py-3 font-mono">{brl(p.cost)}</td>
                  <td className="px-3 py-3 font-mono">{brl(p.price)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="size-7" onClick={() => move(p, -1)}><Minus className="size-3" /></Button>
                      <span className="w-8 text-center font-mono font-semibold">{p.qty}</span>
                      <Button size="icon" variant="outline" className="size-7" onClick={() => move(p, 1)}><Plus className="size-3" /></Button>
                    </div>
                  </td>
                  <td className="px-3 py-3">{p.qty === 0 ? <Pill tone="red">Sem estoque</Pill> : p.qty <= p.min ? <Pill tone="orange">Baixo</Pill> : <Pill tone="green">OK</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="font-display">Nova peça</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {([["code", "Código"], ["desc", "Descrição"], ["category", "Categoria"], ["compat", "Modelo compatível"], ["supplier", "Fornecedor"], ["location", "Localização"]] as const).map(([k, l]) => (
              <div key={k} className="grid gap-1.5"><Label>{l}</Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
            ))}
            {([["cost", "Custo"], ["price", "Preço"], ["qty", "Quantidade"], ["min", "Estoque mínimo"]] as const).map(([k, l]) => (
              <div key={k} className="grid gap-1.5"><Label>{l}</Label><Input type="number" value={f[k]} onChange={(e) => setF({ ...f, [k]: Number(e.target.value) })} /></div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
