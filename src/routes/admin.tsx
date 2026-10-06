import { createFileRoute } from "@tanstack/react-router";
import { Database, Download, Plug, RotateCcw, Shield, Upload, Users, Building2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Field, PageHeader, Panel, Pill } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getState, logActivity, resetData, useStore } from "@/lib/store";
import { renameOrganization, useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Administração — Hangar One" },
    { name: "description", content: "Usuários, permissões, backup, restauração e plugins do Hangar One." },
    { property: "og:title", content: "Administração — Hangar One" },
    { property: "og:description", content: "Configurações e segurança da estação." },
  ] }),
  component: Admin,
});

const ROLES = [
  ["Owner", "Proprietário da empresa"], ["Admin", "Acesso total"], ["Gerente", "Gestão operacional e financeira"], ["Técnico", "Diagnóstico, reparo e aparelhos"], ["Atendente", "Clientes, aparelhos e OS"],
] as const;
const PLUGINS = [["Android", true], ["Apple", true], ["Samsung", false], ["Xiaomi", false], ["Motorola", false], ["Backup", true]] as const;

function Admin() {
  const user = useStore((s) => s.user);
  const tenant = useTenant();
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const orders = useStore((s) => s.orders);
  const parts = useStore((s) => s.parts);
  const counts = { c: customers.length, d: devices.length, o: orders.length, p: parts.length };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `hangar-one-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    logActivity("Backup manual criado", "ok"); toast.success("Backup criado");
  };
  const importBackup = (file: File) => {
    file.text().then((t) => {
      try {
        const data = JSON.parse(t) as State;
        if (!Array.isArray(data.orders) || !Array.isArray(data.customers)) throw new Error();
        if (!confirm("Restaurar este backup substituirá os dados atuais. Confirmar?")) return;
        setState(() => data); toast.success("Backup restaurado");
      } catch { toast.error("Arquivo de backup inválido."); }
    });
  };

  return (
    <div>
      <PageHeader eyebrow="Sistema" title="Administração" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Sessão e perfil" icon={<Users className="size-3.5 text-primary" />}>
          <Field label="Usuário" value={user.name} />
          <div className="space-y-2">
            <Field label="Empresa" value={tenant?.organization.name ?? "Carregando…"} />
            <Field label="Perfil ativo" value={tenant?.role ?? user.role} />
            <Field label="Plano" value={tenant?.organization.plan ?? "trial"} />
          </div>
          <div className="mt-3 space-y-2">
            {ROLES.map(([r, d]) => <div key={r} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"><span className="font-medium">{r}</span><span className="text-xs text-muted-foreground">{d}</span></div>)}
          </div>
        </Panel>

        <Panel title="Workspace da empresa" icon={<Building2 className="size-3.5 text-primary" />}>
          <div className="space-y-3">
            <Field label="Nome atual" value={tenant?.organization.name ?? "—"} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  const name = prompt("Nome da empresa", tenant?.organization.name ?? "");
                  if (!name?.trim() || name.trim() === tenant?.organization.name) return;
                  try { await renameOrganization(name); toast.success("Empresa atualizada"); }
                  catch { toast.error("Não foi possível atualizar a empresa."); }
                }}
              >Renomear empresa</Button>
              <div className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                <CreditCard className="size-3.5" /> Plano {tenant?.organization.plan ?? "trial"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Este workspace é isolado dos demais clientes do Hangar One. Usuários, dados e permissões pertencem a esta empresa.</p>
          </div>
        </Panel>

        <Panel title="Backup e restauração" icon={<Database className="size-3.5 text-primary" />}>
          <div className="grid grid-cols-4 gap-2 text-center">
            {([["Clientes", counts.c], ["Aparelhos", counts.d], ["OS", counts.o], ["Peças", counts.p]] as const).map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-muted/20 p-3"><div className="font-mono text-xl font-semibold">{v}</div><div className="label-tech text-[9px]">{l}</div></div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Os dados ficam guardados neste computador. Crie backups regularmente.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={exportBackup}><Download className="size-4" /> Criar backup</Button>
            <Button variant="outline" asChild><label className="cursor-pointer"><Upload className="size-4" /> Restaurar<input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} /></label></Button>
            <Button variant="ghost" className="text-destructive" onClick={() => { if (confirm("Apagar todos os dados desta estação? Esta ação não pode ser desfeita.")) { resetData(); toast.success("Dados apagados"); } }}><RotateCcw className="size-4" /> Limpar todos os dados</Button>
          </div>
        </Panel>

        <Panel title="Plugins" icon={<Plug className="size-3.5 text-primary" />}>
          <div className="grid grid-cols-2 gap-2">
            {PLUGINS.map(([n, on]) => <div key={n} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5 text-sm"><span>{n}</span>{on ? <Pill tone="green">Ativo</Pill> : <Pill>Em breve</Pill>}</div>)}
          </div>
        </Panel>

        <Panel title="Segurança" icon={<Shield className="size-3.5 text-primary" />}>
          <Field label="Confirmação de operações críticas" value={<Pill tone="green">Ativa</Pill>} />
          <Field label="Senha/PIN de aparelhos" value="Restrito" />
          <Field label="Log de atividade" value={<Pill tone="green">Registrando</Pill>} />
          <Field label="Instalação desktop" value="Use “Instalar app” no Chrome/Edge" />
        </Panel>
      </div>
    </div>
  );
}
