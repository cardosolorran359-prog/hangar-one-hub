create or replace function private.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    join public.organizations o on o.id = m.organization_id
    where m.organization_id = target_org
      and m.user_id = (select auth.uid())
      and m.active = true
      and o.status = 'active'
  );
$$;

revoke all on function private.is_org_member(uuid) from public, anon, authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;