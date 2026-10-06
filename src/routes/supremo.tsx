import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, LockKeyhole, LogOut, Search, Shield, Unlock, UserCog, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Panel, Pill, Stat } from "@/components/hangar/ui";
import { Button } from "@/components/ui/button";
import { isPlatformAdmin, listPlatformOrganizations, setPlatformOrganizationName, setPlatformOrganizationPlan, setPlatformOrganizationStatus, type PlatformOrganization, type PlatformPlan, type PlatformStatus } from "@/lib/platform";
import { signOut } from "@/lib/tenant";

export const Route = createFileRoute("/supremo")({
  head: () => ({
    meta: [
      { title: "Supremo — Hangar One" },
      { name: "description", content: "Console privada do operador da plataforma Hangar One." },
    ],
  }),
  component: SupremoPage,
});

const PLAN_LABELS: Record<PlatformPlan, string> = {
  trial: "Trial",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

function SupremoPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try {
      const ok = await isPlatformAdmin();
      setAuthorized(ok);
      if (!ok) return;
      setOrganizations(await listPlatformOrganizations());
    } catch (error) {
      console.error("[Hangar One Supremo] Falha ao carregar organizações", error);
      setAuthorized(false);
      toast.error("Não foi possível carregar o painel Supremo.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    if (!q) return organizations;
    return organizations.filter((organization) =>
      [organization.name, organization.slug, PLAN_LABELS[organization.plan], organization.status]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(q),
    );
  }, [organizations, query]);

  const activeCount = organizations.filter((o) => o.status === "active").length;
  const suspendedCount = organizations.filter((o) => o.status === "suspended").length;
  const cancelledCount = organizations.filter((o) => o.status === "cancelled").length;
  const membersCount = organizations.reduce((total, o) => total + o.member_count, 0);

  if (authorized === null) {
    return <div className="grid min-h-[70vh] place-items-center text-sm text-muted-foreground">Validando acesso Supremo…</div>;
  }

  if (!authorized) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4">
        <Panel title="Acesso restrito" icon={<Shield className="size-4 text-primary" />}>
          <div className="py-6 text-center">
            <XCircle className="mx-auto size-10 text-destructive" />
            <h1 className="mt-4 font-display text-xl font-semibold">Console Supremo</h1>
            <p className="mt-2 text-sm text-muted-foreground">Esta área pertence exclusivamente ao operador da plataforma.</p>
          </div>
        </Panel>
      </div>
    );
  }

  const runAction = async (
    organizationId: string,
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      setOrganizations(await listPlatformOrganizations());
    } catch (error) {
      console.error("[Hangar One Supremo] Ação falhou", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    } finally {
      setBusy(false);
    }
  };

  const statusAction = (organization: PlatformOrganization, status: PlatformStatus) => {
    const labels: Record<PlatformStatus, string> = {
      active: "liberada",
      suspended: "bloqueada",
      cancelled: "cancelada",
    };
    if (!confirm(`Confirma ${labels[status]} o acesso de “${organization.name}”?`)) return;
    void runAction(
      organization.id,
      () => setPlatformOrganizationStatus(organization.id, status),
      `Empresa ${labels[status]}.`,
    );
  };

  const changePlan = (organization: PlatformOrganization) => {
    const value = prompt(
      "Plano (trial, basic, pro ou enterprise)",
      organization.plan,
    )?.trim().toLowerCase() as PlatformPlan | undefined;
    if (!value || !["trial", "basic", "pro", "enterprise"].includes(value)) {
      if (value) toast.error("Plano inválido.");
      return;
    }
    void runAction(
      organization.id,
      () => setPlatformOrganizationPlan(organization.id, value),
      "Plano atualizado.",
    );
  };

  const rename = (organization: PlatformOrganization) => {
    const value = prompt("Nome da empresa", organization.name)?.trim();
    if (!value || value === organization.name) return;
    void runAction(
      organization.id,
      () => setPlatformOrganizationName(organization.id, value),
      "Empresa renomeada.",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-tech text-primary">Camada superior · Hangar One</div>
          <h1 className="mt-1 font-display text-3xl font-semibold">Console Supremo</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Controle da plataforma. As empresas e seus funcionários ficam abaixo desta camada e não enxergam este console.
          </p>
        </div>
        <Button variant="outline" onClick={() => void signOut().then(() => window.location.reload())}>
          <LogOut className="size-4" /> Sair
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Empresas" value={organizations.length} icon={<Building2 className="size-4" />} />
        <Stat label="Ativas" value={activeCount} tone="green" icon={<CheckCircle2 className="size-4" />} />
        <Stat label="Bloqueadas" value={suspendedCount} tone="orange" icon={<LockKeyhole className="size-4" />} />
        <Stat label="Usuários vinculados" value={membersCount} tone="violet" icon={<UserCog className="size-4" />} />
      </div>

      {cancelledCount > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-muted-foreground">
          {cancelledCount} empresa(s) estão canceladas e sem acesso operacional.
        </div>
      )}

      <Panel title="Empresas contratantes" icon={<Shield className="size-3.5 text-primary" />}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar empresa, slug, plano ou status"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => void refresh()}>Atualizar</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="label-tech border-b border-border text-left">
                {["Empresa", "Plano", "Usuários", "Status", "Ações"].map((header) => (
                  <th key={header} className="px-3 pb-3 font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((organization) => (
                <tr key={organization.id} className="border-b border-border/50 align-top last:border-0">
                  <td className="px-3 py-4">
                    <div className="font-medium">{organization.name}</div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">{organization.slug}</div>
                  </td>
                  <td className="px-3 py-4">
                    <button className="text-left hover:text-primary" disabled={busy} onClick={() => changePlan(organization)}>
                      <Pill tone={organization.plan === "enterprise" ? "violet" : organization.plan === "pro" ? "green" : "blue"}>{PLAN_LABELS[organization.plan]}</Pill>
                    </button>
                  </td>
                  <td className="px-3 py-4 font-mono">{organization.member_count}</td>
                  <td className="px-3 py-4">
                    <Pill tone={organization.status === "active" ? "green" : organization.status === "suspended" ? "orange" : "red"}>
                      {organization.status === "active" ? "Ativa" : organization.status === "suspended" ? "Bloqueada" : "Cancelada"}
                    </Pill>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => rename(organization)}>Renomear</Button>
                      {organization.status === "active" ? (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => statusAction(organization, "suspended")}>
                          <LockKeyhole className="size-3.5" /> Bloquear
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => statusAction(organization, "active")}>
                          <Unlock className="size-3.5" /> Liberar
                        </Button>
                      )}
                      {organization.status !== "cancelled" && (
                        <Button size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={() => statusAction(organization, "cancelled")}>
                          <XCircle className="size-3.5" /> Retirar acesso
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="px-3 py-8 text-center text-xs text-muted-foreground" colSpan={5}>
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
