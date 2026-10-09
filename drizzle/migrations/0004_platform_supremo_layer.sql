create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'Supremo' check (role = 'Supremo'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
revoke all on table public.platform_admins from anon;
grant select on table public.platform_admins to authenticated;
grant all on table public.platform_admins to service_role;

create or replace function private.is_platform_admin(target_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = target_user and active = true
  );
$$;

revoke all on function private.is_platform_admin(uuid) from public, anon, authenticated;
grant execute on function private.is_platform_admin(uuid) to authenticated;

create policy "platform_admins_select_self"
on public.platform_admins for select to authenticated
using (user_id = (select auth.uid()) and active = true);

create policy "organizations_platform_admin_select"
on public.organizations for select to authenticated
using (private.is_platform_admin());

create policy "organizations_platform_admin_update"
on public.organizations for update to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin() and owner_id = organizations.owner_id);

create policy "organization_members_platform_admin_select"
on public.organization_members for select to authenticated
using (private.is_platform_admin());

drop policy if exists "organization_members_select_member" on public.organization_members;
create policy "organization_members_select_member"
on public.organization_members for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    private.is_org_member(organization_id)
    and not private.is_platform_admin(user_id)
  )
);

create index if not exists platform_admins_active_idx on public.platform_admins(active);