import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Database,
  Download,
  Mail,
  Plug,
  RotateCcw,
  Shield,
  Upload,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Field, PageHeader, Panel, Pill } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { getState, logActivity, resetData, setState, useStore, type State } from "@/lib/store";
import { appendAuditLog, renameOrganization, useTenant, type TenantRole } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Hangar One" },
      { name: "description", content: "Equipe, permissões, backup, restauração e plugins do Hangar One." },
      { property: "og:title", content: "Administração — Hangar One" },
      { property: "og:description", content: "Configurações, equipe e segurança do workspace." },
    ],
  }),
  component: Admin,
});

const ROLES = [
  ["Owner", "Proprietário da empresa"],
  ["Admin", "Acesso total"],
  ["Gerente", "Gestão operacional e financeira"],
  ["Técnico", "Diagnóstico, reparo e aparelhos"],
  ["Atendente", "Clientes, aparelhos e OS"],
] as const;

const MANAGEABLE_ROLES: TenantRole[] = ["Admin", "Gerente", "Técnico", "Atendente"];
const PLUGIN_FALLBACKS = [
  ["android", "Android", true],
  ["apple", "Apple", true],
  ["samsung", "Samsung", true],
  ["xiaomi", "Xiaomi", true],
  ["motorola", "Motorola", true],
  ["backup", "Backup", true],
] as const;

type TeamMember = {
  id: string;
  user_id: string;
  role: TenantRole;
  active: boolean;
  email: string;
  display_name: string | null;
  created_at: string;
};

type TeamInvite = {
  id: string;
  email: string;
  role: TenantRole;
  status: string;
  expires_at: string;
  created_at: string;
};

type WorkspacePlugin = {
  plugin_key: string;
  name: string;
  category: string;
  enabled: boolean;
  version: string;
  description: string | null;
};

function Admin() {
  const user = useStore((s) => s.user);
  const tenant = useTenant();
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const orders = useStore((s) => s.orders);
  const parts = useStore((s) => s.parts);
  const counts = { c: customers.length, d: devices.length, o: orders.length, p: parts.length };

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantRole>("Atendente");
  const [teamBusy, setTeamBusy] = useState(false);
  const [plugins, setPlugins] = useState<WorkspacePlugin[]>(
    PLUGIN_FALLBACKS.map(([plugin_key, name, enabled]) => ({
      plugin_key,
      name,
      category: plugin_key === "backup" ? "system" : plugin_key === "android" || plugin_key === "apple" ? "platform" : "manufacturer",
      enabled,
      version: "1.0.0",
      description: null,
    })),
  );

  const canManageTeam = tenant?.role === "Owner" || tenant?.role === "Admin";

  const loadTeam = async () => {
    if (!tenant || !canManageTeam) return;
    setTeamBusy(true);
    try {
      const { data: memberRows, error: memberError } = await supabase
        .from("organization_members")
        .select("id, user_id, role, active, created_at")
        .eq("organization_id", tenant.organization.id)
        .order("created_at", { ascending: true });

      if (memberError) throw memberError;

      const userIds = (memberRows ?? []).map((row) => row.user_id);
      let profileRows: Array<{ user_id: string; email: string; display_name: string | null }> = [];
      if (userIds.length) {
        const { data, error: profileError } = await supabase
          .from("organization_member_profiles")
          .select("user_id, email, display_name")
          .in("user_id", userIds);
        if (profileError) throw profileError;
        profileRows = data ?? [];
      }

      const profiles = new Map(profileRows.map((row) => [row.user_id, row]));
      setMembers((memberRows ?? []).map((row) => {
        const profile = profiles.get(row.user_id);
        return {
          id: row.id,
          user_id: row.user_id,
          role: row.role as TenantRole,
          active: row.active,
          email: profile?.email ?? "E-mail não disponível",
          display_name: profile?.display_name ?? null,
          created_at: row.created_at,
        };
      }));

      const { data: inviteRows, error: inviteError } = await supabase
        .from("organization_invites")
        .select("id, email, role, status, expires_at, created_at")
        .eq("organization_id", tenant.organization.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (inviteError) throw inviteError;
      const memberEmails = new Set(
        (memberRows ?? []).map((row) => profiles.get(row.user_id)?.email?.toLowerCase()).filter(Boolean),
      );
      setInvites(
        (inviteRows ?? [])
          .filter((row) => !memberEmails.has(row.email.toLowerCase()))
          .map((row) => ({ ...row, role: row.role as TenantRole })),
      );
    } catch (error) {
      console.error("[Hangar One] Falha ao carregar equipe", error);
      toast.error("Não foi possível carregar a equipe.");
    } finally {
      setTeamBusy(false);
    }
  };

  useEffect(() => {
    void loadTeam();
  }, [tenant?.organization.id, tenant?.role]);

  useEffect(() => {
    const loadPlugins = async () => {
      if (!tenant) return;
      const { data, error } = await supabase
        .from("organization_plugins")
        .select("plugin_key, name, category, enabled, version, description")
        .eq("organization_id", tenant.organization.id)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.warn("[Hangar One] Falha ao carregar plugins", error);
        return;
      }
      if (data?.length) setPlugins(data as WorkspacePlugin[]);
    };
    void loadPlugins();
  }, [tenant?.organization.id]);

  const activeMembers = useMemo(() => members.filter((member) => member.active).length, [members]);

  const createInvite = async () => {
    if (!tenant || !canManageTeam) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Informe o e-mail do colaborador.");
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === email)) {
      toast.error("Esse e-mail já pertence à equipe.");
      return;
    }
    if (invites.some((invite) => invite.email.toLowerCase() === email)) {
      toast.error("Já existe um convite pendente para esse e-mail.");
      return;
    }

    setTeamBusy(true);
    try {
      const { error } = await supabase.from("organization_invites").insert({
        organization_id: tenant.organization.id,
        email,
        role: inviteRole,
        invited_by: tenant.userId,
      });
      if (error) throw error;
      await appendAuditLog("Convite de equipe criado", "organization_invites", email, { role: inviteRole });
      setInviteEmail("");
      toast.success("Convite criado.");
      await loadTeam();
    } catch (error) {
      console.error("[Hangar One] Falha ao criar convite", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o convite.");
    } finally {
      setTeamBusy(false);
    }
  };

  const updateMember = async (member: TeamMember, changes: { role?: TenantRole; active?: boolean }) => {
    if (!tenant || !canManageTeam || member.user_id === tenant.userId) return;
    setTeamBusy(true);
    try {
      const { error } = await supabase
        .from("organization_members")
        .update(changes)
        .eq("id", member.id);
      if (error) throw error;

      await appendAuditLog(
        changes.active === undefined ? "Função de membro alterada" : changes.active ? "Membro ativado" : "Membro desativado",
        "organization_members",
        member.user_id,
        { email: member.email, ...changes },
      );
      toast.success(changes.active === undefined ? "Função atualizada." : changes.active ? "Membro ativado." : "Membro desativado.");
      await loadTeam();
    } catch (error) {
      console.error("[Hangar One] Falha ao atualizar membro", error);
      toast.error("Não foi possível atualizar o membro.");
    } finally {
      setTeamBusy(false);
    }
  };

  const revokeInvite = async (invite: TeamInvite) => {
    if (!tenant || !canManageTeam) return;
    setTeamBusy(true);
    try {
      const { error } = await supabase
        .from("organization_invites")
        .update({ status: "revoked" })
        .eq("id", invite.id);
      if (error) throw error;
      await appendAuditLog("Convite de equipe revogado", "organization_invites", invite.id, { email: invite.email });
      toast.success("Convite revogado.");
      await loadTeam();
    } catch {
      toast.error("Não foi possível revogar o convite.");
    } finally {
      setTeamBusy(false);
    }
  };

  const copyAccessAddress = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Endereço do Hangar One copiado.");
    } catch {
      toast.error("Não foi possível copiar o endereço.");
    }
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hangar-one-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    logActivity("Backup manual criado", "ok");
    toast.success("Backup criado");
  };

  const importBackup = (file: File) => {
    file.text().then((t) => {
      try {
        const data = JSON.parse(t) as State;
        if (!Array.isArray(data.orders) || !Array.isArray(data.customers)) throw new Error();
        if (!confirm("Restaurar este backup substituirá os dados atuais. Confirmar?")) return;
        setState(() => data);
        toast.success("Backup restaurado");
      } catch {
        toast.error("Arquivo de backup inválido.");
      }
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
            {ROLES.map(([r, d]) => (
              <div key={r} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm">
                <span className="font-medium">{r}</span>
                <span className="text-xs text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Workspace da empresa" icon={<Building2 className="size-3.5 text-primary" />}>
          <div className="space-y-3">
            <Field label="Nome atual" value={tenant?.organization.name ?? "—"} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={!canManageTeam}
                onClick={async () => {
                  const name = prompt("Nome da empresa", tenant?.organization.name ?? "");
                  if (!name?.trim() || name.trim() === tenant?.organization.name) return;
                  try {
                    await renameOrganization(name);
                    toast.success("Empresa atualizada");
                  } catch {
                    toast.error("Não foi possível atualizar a empresa.");
                  }
                }}
              >
                Renomear empresa
              </Button>
              <div className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                <CreditCard className="size-3.5" /> Plano {tenant?.organization.plan ?? "trial"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Este workspace é isolado dos demais clientes do Hangar One. Usuários, dados e permissões pertencem a esta empresa.
            </p>
          </div>
        </Panel>

        {canManageTeam && (
          <Panel title="Equipe e permissões" icon={<UserPlus className="size-3.5 text-primary" />}>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4 text-primary" /> Adicionar colaborador
                </div>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  Crie o convite usando o e-mail profissional. O colaborador deverá criar a conta do Hangar One usando exatamente esse e-mail; ao primeiro acesso ele será vinculado automaticamente a esta empresa com a função escolhida.
                </p>
                <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="colaborador@empresa.com"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                  <select
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as TenantRole)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    {MANAGEABLE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <Button disabled={teamBusy} onClick={() => void createInvite()}>
                    <UserPlus className="size-4" /> Convidar
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => void copyAccessAddress()}>
                    <Copy className="size-3.5" /> Copiar endereço de acesso
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">Membros da empresa</div>
                    <div className="text-[11px] text-muted-foreground">{activeMembers} ativos · {members.length} cadastrados</div>
                  </div>
                  <Button variant="ghost" size="sm" disabled={teamBusy} onClick={() => void loadTeam()}>Atualizar</Button>
                </div>
                <div className="divide-y divide-border/70">
                  {members.map((member) => {
                    const isOwner = member.role === "Owner";
                    const isSelf = member.user_id === tenant?.userId;
                    return (
                      <div key={member.id} className="grid gap-3 px-3 py-3 lg:grid-cols-[1fr_125px_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="truncate">{member.display_name || member.email}</span>
                            {isOwner && <Pill tone="green">Owner</Pill>}
                            {!member.active && <Pill>Inativo</Pill>}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                        </div>
                        <select
                          value={member.role}
                          disabled={isOwner || isSelf || teamBusy}
                          onChange={(event) => void updateMember(member, { role: event.target.value as TenantRole })}
                          className="h-9 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-primary disabled:opacity-60"
                        >
                          {MANAGEABLE_ROLES.includes(member.role) || isOwner ? null : <option value={member.role}>{member.role}</option>}
                          {isOwner ? <option value="Owner">Owner</option> : MANAGEABLE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <div className="flex justify-end">
                          {!isOwner && !isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={teamBusy}
                              className={member.active ? "text-destructive" : ""}
                              onClick={() => void updateMember(member, { active: !member.active })}
                            >
                              {member.active ? <><UserX className="size-3.5" /> Desativar</> : <><UserCheck className="size-3.5" /> Ativar</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!members.length && (
                    <div className="px-3 py-5 text-center text-xs text-muted-foreground">Nenhum membro encontrado.</div>
                  )}
                </div>
              </div>

              {invites.length > 0 && (
                <div className="rounded-xl border border-border/70 overflow-hidden">
                  <div className="border-b border-border/70 px-3 py-2.5">
                    <div className="text-sm font-medium">Convites pendentes</div>
                    <div className="text-[11px] text-muted-foreground">Aceitação automática pelo e-mail no primeiro acesso.</div>
                  </div>
                  <div className="divide-y divide-border/70">
                    {invites.map((invite) => {
                      const expired = new Date(invite.expires_at).getTime() <= Date.now();
                      return (
                        <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
                          <div>
                            <div className="text-sm font-medium">{invite.email}</div>
                            <div className="text-xs text-muted-foreground">
                              Função {invite.role} · {expired ? "Expirado" : `expira em ${new Date(invite.expires_at).toLocaleDateString("pt-BR")}`}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive" disabled={teamBusy} onClick={() => void revokeInvite(invite)}>
                            Revogar
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground"><CheckCircle2 className="size-4 text-primary" /> Permissões aplicadas por função</div>
                Owner e Admin possuem acesso administrativo; Gerente cuida da operação; Técnico fica focado em aparelhos, OS, diagnóstico e centro técnico; Atendente fica com clientes, aparelhos, OS e orçamentos. O Owner não pode ser removido ou desativado.
              </div>
            </div>
          </Panel>
        )}

        <Panel title="Backup e restauração" icon={<Database className="size-3.5 text-primary" />}>
          <div className="grid grid-cols-4 gap-2 text-center">
            {([["Clientes", counts.c], ["Aparelhos", counts.d], ["OS", counts.o], ["Peças", counts.p]] as const).map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="font-mono text-xl font-semibold">{v}</div>
                <div className="label-tech text-[9px]">{l}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Os dados deste workspace ficam sincronizados na nuvem. Ainda é possível exportar um backup manual a qualquer momento.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={exportBackup}><Download className="size-4" /> Criar backup</Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="size-4" /> Restaurar
                <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
              </label>
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                if (confirm("Apagar todos os dados desta empresa? Esta ação não pode ser desfeita.")) {
                  resetData();
                  toast.success("Dados apagados");
                }
              }}
            >
              <RotateCcw className="size-4" /> Limpar todos os dados
            </Button>
          </div>
        </Panel>

        <Panel title="Plugins" icon={<Plug className="size-3.5 text-primary" />}>
          <div className="grid gap-2 sm:grid-cols-2">
            {plugins.map((plugin) => (
              <div key={plugin.plugin_key} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{plugin.name}</span>
                  {plugin.enabled ? <Pill tone="green">Ativo</Pill> : <Pill>Desativado</Pill>}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {plugin.category} · v{plugin.version}
                </div>
                {plugin.description && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{plugin.description}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Todos os plugins-base do Hangar One estão registrados neste workspace: Android, Apple, Samsung, Xiaomi, Motorola e Backup.
          </p>
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
