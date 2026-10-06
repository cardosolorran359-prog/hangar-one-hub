import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformStatus = "active" | "suspended" | "cancelled";
export type PlatformPlan = "trial" | "basic" | "pro" | "enterprise";

export type PlatformOrganization = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  plan: PlatformPlan;
  status: PlatformStatus;
  created_at: string;
  updated_at: string;
  member_count: number;
};

let active = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function subscribePlatform(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlatform() {
  return useSyncExternalStore(subscribePlatform, () => active, () => active);
}

export async function isPlatformAdmin() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    active = false;
    emit();
    return false;
  }

  const { data, error } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .maybeSingle();

  active = !error && Boolean(data);
  emit();
  return active;
}

export async function initializePlatform() {
  return isPlatformAdmin();
}

export async function listPlatformOrganizations() {
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, slug, owner_id, logo_url, plan, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("organization_id, active");

  if (membersError) throw membersError;

  const counts = new Map<string, number>();
  for (const member of members ?? []) {
    if (member.active) counts.set(member.organization_id, (counts.get(member.organization_id) ?? 0) + 1);
  }

  return (organizations ?? []).map((organization) => ({
    ...organization,
    plan: organization.plan as PlatformPlan,
    status: organization.status as PlatformStatus,
    member_count: counts.get(organization.id) ?? 0,
  })) as PlatformOrganization[];
}

export async function setPlatformOrganizationStatus(
  organizationId: string,
  status: PlatformStatus,
) {
  if (!active) throw new Error("Acesso de plataforma não autorizado.");

  const { error } = await supabase
    .from("organizations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", organizationId);

  if (error) throw error;
}

export async function setPlatformOrganizationPlan(
  organizationId: string,
  plan: PlatformPlan,
) {
  if (!active) throw new Error("Acesso de plataforma não autorizado.");

  const { error } = await supabase
    .from("organizations")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", organizationId);

  if (error) throw error;
}

export async function setPlatformOrganizationName(
  organizationId: string,
  name: string,
) {
  if (!active || !name.trim()) throw new Error("Dados inválidos.");

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", organizationId);

  if (error) throw error;
}

export function clearPlatform() {
  active = false;
  emit();
}
