drop policy if exists "organization_members_insert_admin_or_self" on public.organization_members;
create policy "organization_members_insert_admin_or_self"
on public.organization_members for insert to authenticated
with check (
  (user_id = (select auth.uid()) and exists (
    select 1 from public.organizations o
    where o.id = organization_id and o.owner_id = (select auth.uid())
  ))
  or
  (private.is_org_admin(organization_id) and role <> 'Owner')
);

create table if not exists public.organization_plugins (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plugin_key text not null,
  name text not null,
  category text not null default 'device',
  enabled boolean not null default true,
  version text not null default '1.0.0',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, plugin_key)
);

create index if not exists organization_plugins_org_idx
  on public.organization_plugins(organization_id, enabled);

alter table public.organization_plugins enable row level security;

revoke all on table public.organization_plugins from anon;
grant select, insert, update, delete on table public.organization_plugins to authenticated;
grant all on table public.organization_plugins to service_role;

drop policy if exists "organization_plugins_select_member" on public.organization_plugins;
create policy "organization_plugins_select_member"
on public.organization_plugins for select to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "organization_plugins_manage_admin" on public.organization_plugins;
create policy "organization_plugins_manage_admin"
on public.organization_plugins for all to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

insert into public.organization_plugins (organization_id, plugin_key, name, category, enabled, version, description)
select
  o.id,
  p.plugin_key,
  p.name,
  p.category,
  true,
  p.version,
  p.description
from public.organizations o
cross join (
  values
    ('android','Android','platform','1.0.0','Motor Android: ADB, Fastboot e Recovery.'),
    ('apple','Apple','platform','1.0.0','Motor Apple para iPhone e iPad.'),
    ('samsung','Samsung','manufacturer','1.0.0','Perfil Samsung para rotinas de bancada compatíveis.'),
    ('xiaomi','Xiaomi','manufacturer','1.0.0','Perfil Xiaomi para rotinas de bancada compatíveis.'),
    ('motorola','Motorola','manufacturer','1.0.0','Perfil Motorola para rotinas de bancada compatíveis.'),
    ('backup','Backup','system','1.0.0','Backup e restauração do workspace.')
) as p(plugin_key, name, category, version, description)
on conflict (organization_id, plugin_key)
do update set
  name = excluded.name,
  category = excluded.category,
  version = excluded.version,
  description = excluded.description,
  enabled = true,
  updated_at = now();