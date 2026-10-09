drop policy if exists "organization_invites_select_invitee" on public.organization_invites;
create policy "organization_invites_select_invitee"
on public.organization_invites for select to authenticated
using (
  status = 'pending'
  and expires_at > now()
  and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

drop policy if exists "organization_members_insert_invited_user" on public.organization_members;
create policy "organization_members_insert_invited_user"
on public.organization_members for insert to authenticated
with check (
  user_id = auth.uid()
  and active = true
  and exists (
    select 1
    from public.organization_invites i
    where i.organization_id = public.organization_members.organization_id
      and i.status = 'pending'
      and i.expires_at > now()
      and lower(i.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      and i.role = public.organization_members.role
  )
);

create index if not exists organization_invites_accepted_user_idx
  on public.organization_invites(accepted_user_id);

create index if not exists organization_invites_invited_by_idx
  on public.organization_invites(invited_by);