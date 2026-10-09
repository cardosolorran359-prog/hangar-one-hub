-- Defense-in-depth for the Hangar One tenant boundary.
-- Reviewed for the existing public tables. Apply only to databases with this schema.

begin;

-- Profiles: authenticated users can see themselves and active colleagues in their own org only.
drop policy if exists "Authenticated users can read member profiles" on public.organization_member_profiles;
drop policy if exists member_profiles_select_member on public.organization_member_profiles;
create policy member_profiles_select_member on public.organization_member_profiles
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.organization_members target
    join public.organization_members viewer
      on viewer.organization_id = target.organization_id
    where target.user_id = organization_member_profiles.user_id
      and target.active = true
      and viewer.user_id = (select auth.uid())
      and viewer.active = true
      and private.is_org_member(target.organization_id)
  )
);

-- Only Owner/Admin can manage invitations; invitees can only read their own pending invitation.
drop policy if exists "Org members can manage invites" on public.organization_invites;
drop policy if exists "Invited users can read their own pending invites" on public.organization_invites;
drop policy if exists organization_invites_select_admin on public.organization_invites;
drop policy if exists organization_invites_select_invitee on public.organization_invites;
drop policy if exists organization_invites_select_admin_or_invitee on public.organization_invites;
drop policy if exists organization_invites_insert_admin on public.organization_invites;
drop policy if exists organization_invites_update_admin on public.organization_invites;
drop policy if exists organization_invites_delete_admin on public.organization_invites;

create policy organization_invites_select_admin_or_invitee on public.organization_invites
for select to authenticated
using (
  private.is_org_admin(organization_id)
  or (
    status = 'pending'
    and expires_at > now()
    and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  )
);
create policy organization_invites_insert_admin on public.organization_invites
for insert to authenticated
with check (
  private.is_org_admin(organization_id)
  and invited_by = (select auth.uid())
  and role <> 'Owner'
);
create policy organization_invites_update_admin on public.organization_invites
for update to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id) and role <> 'Owner');
create policy organization_invites_delete_admin on public.organization_invites
for delete to authenticated
using (private.is_org_admin(organization_id));

-- Prevent self-enrollment into arbitrary companies and restrict role changes.
drop policy if exists organization_members_insert_admin_or_self on public.organization_members;
drop policy if exists organization_members_insert_invited_user on public.organization_members;
drop policy if exists organization_members_update_admin on public.organization_members;
drop policy if exists organization_members_delete_admin on public.organization_members;

create policy organization_members_insert_admin_or_self on public.organization_members
for insert to authenticated
with check (
  (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
        and o.owner_id = (select auth.uid())
    )
  )
  or (
    private.is_org_admin(organization_id)
    and role <> 'Owner'
  )
);
create policy organization_members_insert_invited_user on public.organization_members
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and active = true
  and exists (
    select 1 from public.organization_invites i
    where i.organization_id = organization_members.organization_id
      and i.status = 'pending'
      and i.expires_at > now()
      and lower(i.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      and i.role = organization_members.role
  )
);
create policy organization_members_update_admin on public.organization_members
for update to authenticated
using (
  private.is_org_admin(organization_id)
  and not exists (
    select 1 from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = organization_members.user_id
  )
)
with check (
  private.is_org_admin(organization_id)
  and role <> 'Owner'
  and not exists (
    select 1 from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = organization_members.user_id
  )
);
create policy organization_members_delete_admin on public.organization_members
for delete to authenticated
using (
  private.is_org_admin(organization_id)
  and not exists (
    select 1 from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = organization_members.user_id
  )
);

-- Plugins may be read by members, but only admins may change plugin state.
drop policy if exists "Org members can manage plugins" on public.organization_plugins;
drop policy if exists organization_plugins_manage_admin on public.organization_plugins;
create policy organization_plugins_manage_admin on public.organization_plugins
for all to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

-- Audit metadata is administrative information; ordinary technicians need not browse it.
drop policy if exists audit_logs_member_read on public.audit_logs;
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
for select to authenticated
using (private.is_org_admin(organization_id));

-- Tenant lifecycle/deletion belongs to the platform operator, not the tenant owner.
drop policy if exists organizations_delete_owner on public.organizations;

-- RLS WITH CHECK cannot compare old/new owner_id by itself, so guard ownership changes at the table.
create or replace function private.prevent_organization_owner_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $function$
begin
  if new.owner_id is distinct from old.owner_id
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Organization owner changes must use a trusted service-role workflow.'
      using errcode = '42501';
  end if;
  return new;
end;
$function$;

drop trigger if exists organization_owner_immutable on public.organizations;
create trigger organization_owner_immutable
before update of owner_id on public.organizations
for each row execute function private.prevent_organization_owner_change();

drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin on public.organizations
for update to authenticated
using (private.is_org_admin(id))
with check (private.is_org_admin(id));

-- Platform-admin policy exists only on deployments that include the Supremo layer.
do $block$
begin
  if to_regprocedure('private.is_platform_admin()') is not null then
    execute 'drop policy if exists organizations_platform_admin_update on public.organizations';
    execute 'create policy organizations_platform_admin_update on public.organizations for update to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin())';
  end if;
end
$block$;

commit;
