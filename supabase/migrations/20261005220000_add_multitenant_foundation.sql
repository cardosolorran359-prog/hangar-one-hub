create schema if not exists private;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  logo_url text,
  plan text not null default 'trial' check (plan in ('trial','basic','pro','enterprise')),
  status text not null default 'active' check (status in ('active','suspended','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'Admin' check (role in ('Owner','Admin','Gerente','Técnico','Atendente')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.organization_modules (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, module_key)
);

create table if not exists public.organization_state (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_members_user_idx on public.organization_members(user_id, active);
create index if not exists organization_members_org_idx on public.organization_members(organization_id, active);
create index if not exists audit_logs_org_created_idx on public.audit_logs(organization_id, created_at desc);

create or replace function private.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_org and m.user_id = auth.uid() and m.active = true
  );
$$;

create or replace function private.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_org and m.user_id = auth.uid()
      and m.active = true and m.role in ('Owner','Admin')
  );
$$;

grant usage on schema private to authenticated;
revoke all on function private.is_org_member(uuid) from public, anon, authenticated;
revoke all on function private.is_org_admin(uuid) from public, anon, authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_modules enable row level security;
alter table public.organization_state enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table public.organizations, public.organization_members, public.organization_modules, public.organization_state, public.audit_logs from anon;
grant select, insert, update, delete on table public.organizations to authenticated;
grant select, insert, update, delete on table public.organization_members to authenticated;
grant select, insert, update, delete on table public.organization_modules to authenticated;
grant select, insert, update, delete on table public.organization_state to authenticated;
grant select, insert on table public.audit_logs to authenticated;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations for select to authenticated using (private.is_org_member(id) or owner_id = auth.uid());

drop policy if exists "organizations_insert_owner" on public.organizations;
create policy "organizations_insert_owner" on public.organizations for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "organizations_update_admin" on public.organizations;
create policy "organizations_update_admin" on public.organizations for update to authenticated using (private.is_org_admin(id)) with check (private.is_org_admin(id) and owner_id = organizations.owner_id);

drop policy if exists "organizations_delete_owner" on public.organizations;
create policy "organizations_delete_owner" on public.organizations for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "organization_members_select_member" on public.organization_members;
create policy "organization_members_select_member" on public.organization_members for select to authenticated using (private.is_org_member(organization_id) or user_id = auth.uid());

drop policy if exists "organization_members_insert_admin_or_self" on public.organization_members;
create policy "organization_members_insert_admin_or_self" on public.organization_members for insert to authenticated with check (user_id = auth.uid() or private.is_org_admin(organization_id));

drop policy if exists "organization_members_update_admin" on public.organization_members;
create policy "organization_members_update_admin" on public.organization_members for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));

drop policy if exists "organization_members_delete_admin" on public.organization_members;
create policy "organization_members_delete_admin" on public.organization_members for delete to authenticated using (private.is_org_admin(organization_id));

drop policy if exists "organization_modules_select_member" on public.organization_modules;
create policy "organization_modules_select_member" on public.organization_modules for select to authenticated using (private.is_org_member(organization_id));

drop policy if exists "organization_modules_manage_admin" on public.organization_modules;
create policy "organization_modules_manage_admin" on public.organization_modules for all to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));

drop policy if exists "organization_state_member_read" on public.organization_state;
create policy "organization_state_member_read" on public.organization_state for select to authenticated using (private.is_org_member(organization_id));

drop policy if exists "organization_state_member_write" on public.organization_state;
create policy "organization_state_member_write" on public.organization_state for insert to authenticated with check (private.is_org_member(organization_id) and updated_by = auth.uid());

drop policy if exists "organization_state_member_update" on public.organization_state;
create policy "organization_state_member_update" on public.organization_state for update to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id) and updated_by = auth.uid());

drop policy if exists "organization_state_admin_delete" on public.organization_state;
create policy "organization_state_admin_delete" on public.organization_state for delete to authenticated using (private.is_org_admin(organization_id));

drop policy if exists "audit_logs_member_read" on public.audit_logs;
create policy "audit_logs_member_read" on public.audit_logs for select to authenticated using (private.is_org_member(organization_id));

drop policy if exists "audit_logs_member_insert" on public.audit_logs;
create policy "audit_logs_member_insert" on public.audit_logs for insert to authenticated with check (private.is_org_member(organization_id) and actor_id = auth.uid());