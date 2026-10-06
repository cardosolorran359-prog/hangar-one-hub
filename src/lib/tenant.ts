import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TenantRole = "Owner" | "Admin" | "Gerente" | "Técnico" | "Atendente";
export type TenantModule =
  | "dashboard"
  | "android"
  | "apple"
  | "clientes"
  | "aparelhos"
  | "ordens"
  | "diagnostico"
  | "tecnico"
  | "orcamentos"
  | "estoque"
  | "relatorios"
  | "admin";

export interface TenantOrganization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  plan: string;
  status: string;
}

export interface TenantContext {
  userId: string;
  email: string;
  organization: TenantOrganization;
  role: TenantRole;
  modules: Record<string, boolean>;
}

const DEFAULT_MODULES: TenantModule[] = [
  "dashboard", "android", "apple", "clientes", "aparelhos", "ordens",
  "diagnostico", "tecnico", "orcamentos", "estoque", "relatorios", "admin",
];

let context: TenantContext | null = null;
let loading = false;
let error: Error | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function subscribeTenant(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTenant() {
  return useSyncExternalStore(subscribeTenant, () => context, () => context);
}

export function getTenant() {
  return context;
}

export function getTenantError() {
  return error;
}

export function isTenantLoading() {
  return loading;
}

function safeSlug(value: string) {
  const base = value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "empresa";
  return base + "-" + crypto.randomUUID().slice(0, 8);
}

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\\b\\w/g, (c) => c.toUpperCase()) : "Minha empresa";
}

async function loadMemberships(userId: string) {
  const { data, error: queryError } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug, owner_id, logo_url, plan, status)")
    .eq("user_id", userId)
    .eq("active", true);

  if (queryError) throw queryError;

  return (data ?? [])
    .map((row) => {
      const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
      if (!org) return null;
      return {
        organization: org as TenantOrganization,
        role: row.role as TenantRole,
      };
    })
    .filter((item): item is { organization: TenantOrganization; role: TenantRole } => Boolean(item));
}

async function createFirstOrganization(userId: string, email: string) {
  const name = displayNameFromEmail(email) + " — Hangar One";
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({ name, slug: safeSlug(name), owner_id: userId })
    .select("id, name, slug, owner_id, logo_url, plan, status")
    .single();

  if (organizationError) throw organizationError;

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ organization_id: organization.id, user_id: userId, role: "Owner", active: true });

  if (memberError) {
    await supabase.from("organizations").delete().eq("id", organization.id);
    throw memberError;
  }

  const modules = DEFAULT_MODULES.map((module_key) => ({
    organization_id: organization.id,
    module_key,
    enabled: true,
  }));

  const { error: moduleError } = await supabase
    .from("organization_modules")
    .upsert(modules, { onConflict: "organization_id,module_key" });

  if (moduleError) throw moduleError;

  return { organization: organization as TenantOrganization, role: "Owner" as TenantRole };
}

export async function initializeTenant(force = false) {
  if (context && !force) return context;
  if (loading) return context;

  loading = true;
  error = null;
  emit();

  try {
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!data.user) throw new Error("Você precisa entrar no Hangar One.");

    let memberships = await loadMemberships(data.user.id);
    let selected = memberships[0];

    // A new account may have been invited to an existing company.
    // The invite is only readable/usable when its email matches the authenticated account.
    if (!selected) {
      const email = data.user.email ?? "";
      const { data: inviteRows, error: inviteError } = await supabase
        .from("organization_invites")
        .select("organization_id, role")
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .ilike("email", email)
        .order("created_at", { ascending: true })
        .limit(1);

      if (inviteError) throw inviteError;

      const invite = inviteRows?.[0];
      if (invite) {
        const { error: membershipError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: invite.organization_id,
            user_id: data.user.id,
            role: invite.role,
            active: true,
          });

        if (membershipError && membershipError.code !== "23505") throw membershipError;
        memberships = await loadMemberships(data.user.id);
        selected = memberships[0];
      }
    }

    // No membership and no matching invite means this is the first owner account.
    if (!selected) {
      selected = await createFirstOrganization(data.user.id, data.user.email ?? "");
      memberships = [selected];
    }

    await supabase
      .from("organization_member_profiles")
      .upsert(
        {
          user_id: data.user.id,
          display_name: data.user.user_metadata?.name ?? null,
          email: data.user.email ?? "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    const { data: moduleRows, error: moduleError } = await supabase
      .from("organization_modules")
      .select("module_key, enabled")
      .eq("organization_id", selected.organization.id);

    if (moduleError) throw moduleError;

    const modules = Object.fromEntries(
      DEFAULT_MODULES.map((key) => [key, true]),
    ) as Record<string, boolean>;

    for (const row of moduleRows ?? []) modules[row.module_key] = row.enabled;

    context = {
      userId: data.user.id,
      email: data.user.email ?? "",
      organization: selected.organization,
      role: selected.role,
      modules,
    };
    emit();
    return context;
  } catch (cause) {
    error = cause instanceof Error ? cause : new Error("Não foi possível inicializar a empresa.");
    context = null;
    emit();
    throw error;
  } finally {
    loading = false;
    emit();
  }
}

export async function signIn(email: string, password: string) {
  const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (authError) throw authError;
  return initializeTenant(true);
}

export async function signUp(email: string, password: string) {
  const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
  if (authError) throw authError;

  if (data.session) return initializeTenant(true);

  throw new Error("Conta criada. Confirme seu e-mail para concluir o primeiro acesso e depois entre novamente.");
}

export async function signOut() {
  await supabase.auth.signOut();
  context = null;
  error = null;
  emit();
}

export function canAccessModule(moduleKey: string, role = context?.role) {
  if (!role) return false;
  if (role === "Owner" || role === "Admin") return true;

  const permissions: Record<TenantRole, string[]> = {
    Owner: ["*"],
    Admin: ["*"],
    Gerente: ["dashboard", "clientes", "aparelhos", "ordens", "diagnostico", "tecnico", "orcamentos", "estoque", "relatorios"],
    Técnico: ["dashboard", "aparelhos", "ordens", "diagnostico", "tecnico"],
    Atendente: ["dashboard", "clientes", "aparelhos", "ordens", "orcamentos"],
  };

  return permissions[role].includes(moduleKey);
}

export async function loadOrganizationState<T>(organizationId: string) {
  const { data, error: queryError } = await supabase
    .from("organization_state")
    .select("state, version, updated_at")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (queryError) throw queryError;
  return data as { state: T; version: number; updated_at: string } | null;
}

export async function saveOrganizationState<T>(organizationId: string, state: T) {
  if (!context) return;

  const { error: saveError } = await supabase
    .from("organization_state")
    .upsert({
      organization_id: organizationId,
      state: state as never,
      updated_by: context.userId,
    }, { onConflict: "organization_id" });

  if (saveError) throw saveError;
}

export async function appendAuditLog(action: string, entity?: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  if (!context) return;
  const { error: auditError } = await supabase.from("audit_logs").insert({
    organization_id: context.organization.id,
    actor_id: context.userId,
    action,
    entity: entity ?? null,
    entity_id: entityId ?? null,
    metadata: metadata as never,
  });
  if (auditError) console.warn("[Hangar One] Falha ao registrar auditoria", auditError);
}

export async function renameOrganization(name: string) {
  if (!context || !name.trim()) return;
  const { data, error: updateError } = await supabase
    .from("organizations")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", context.organization.id)
    .select("id, name, slug, logo_url, plan, status")
    .single();

  if (updateError) throw updateError;
  context = { ...context, organization: data as TenantOrganization };
  emit();
}
