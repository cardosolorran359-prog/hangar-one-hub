create or replace function private.accept_org_invite_impl()
returns table (organization_id uuid, role text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  pending_invite public.organization_invites%rowtype;
begin
  if current_user_id is null or current_email = '' then
    return;
  end if;

  select *
  into pending_invite
  from public.organization_invites
  where lower(email) = current_email
    and status = 'pending'
    and expires_at > now()
  order by created_at asc
  limit 1
  for update;

  if not found then
    return;
  end if;

  insert into public.organization_members (organization_id, user_id, role, active)
  values (pending_invite.organization_id, current_user_id, pending_invite.role, true)
  on conflict (organization_id, user_id)
  do update set role = excluded.role, active = true;

  insert into public.organization_member_profiles (user_id, display_name, email, updated_at)
  values (current_user_id, null, current_email, now())
  on conflict (user_id)
  do update set email = excluded.email, updated_at = now();

  update public.organization_invites
  set status = 'accepted',
      accepted_at = now(),
      accepted_user_id = current_user_id
  where id = pending_invite.id;

  return query select pending_invite.organization_id, pending_invite.role;
end;
$$;

revoke all on function private.accept_org_invite_impl() from public, anon, authenticated;
grant execute on function private.accept_org_invite_impl() to authenticated;

create or replace function public.accept_org_invite()
returns table (organization_id uuid, role text)
language sql
security invoker
set search_path = public, auth
as $$
  select * from private.accept_org_invite_impl();
$$;

revoke all on function public.accept_org_invite() from public, anon, authenticated;
grant execute on function public.accept_org_invite() to authenticated;