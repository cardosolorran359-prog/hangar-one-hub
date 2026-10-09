create table if not exists public.organization_member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'Atendente' check (role in ('Admin','Gerente','Técnico','Atendente')),
  invited_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists organization_invites_pending_email_idx
  on public.organization_invites (organization_id, lower(email))
  where status = 'pending';

create index if not exists organization_invites_org_idx
  on public.organization_invites (organization_id, status, created_at desc);

create index if not exists organization_member_profiles_email_idx
  on public.organization_member_profiles (lower(email));

alter table public.organization_member_profiles enable row level security;
alter table public.organization_invites enable row level security;

revoke all on table public.organization_member_profiles, public.organization_invites from anon;
grant select, insert, update on table public.organization_member_profiles to authenticated;
grant select, insert, update, delete on table public.organization_invites to authenticated;
grant all on table public.organization_member_profiles, public.organization_invites to service_role;

create policy "member_profiles_select_member"
on public.organization_member_profiles for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.organization_members target
    join public.organization_members viewer on viewer.organization_id = target.organization_id
    where target.user_id = organization_member_profiles.user_id
      and target.active = true
      and viewer.user_id = auth.uid()
      and viewer.active = true
  )
);

create policy "member_profiles_insert_self_or_admin"
on public.organization_member_profiles for insert to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.organization_members target
    join public.organization_members viewer on viewer.organization_id = target.organization_id
    where target.user_id = organization_member_profiles.user_id
      and target.active = true
      and viewer.user_id = auth.uid()
      and viewer.active = true
      and viewer.role in ('Owner','Admin')
  )
);

create policy "member_profiles_update_self_or_admin"
on public.organization_member_profiles for update to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.organization_members target
    join public.organization_members viewer on viewer.organization_id = target.organization_id
    where target.user_id = organization_member_profiles.user_id
      and target.active = true
      and viewer.user_id = auth.uid()
      and viewer.active = true
      and viewer.role in ('Owner','Admin')
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.organization_members target
    join public.organization_members viewer on viewer.organization_id = target.organization_id
    where target.user_id = organization_member_profiles.user_id
      and target.active = true
      and viewer.user_id = auth.uid()
      and viewer.active = true
      and viewer.role in ('Owner','Admin')
  )
);

create policy "organization_invites_select_admin"
on public.organization_invites for select to authenticated
using (private.is_org_admin(organization_id));

create policy "organization_invites_insert_admin"
on public.organization_invites for insert to authenticated
with check (
  private.is_org_admin(organization_id)
  and invited_by = auth.uid()
  and role <> 'Owner'
);

create policy "organization_invites_update_admin"
on public.organization_invites for update to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id) and role <> 'Owner');

create policy "organization_invites_delete_admin"
on public.organization_invites for delete to authenticated
using (private.is_org_admin(organization_id));

insert into public.organization_member_profiles (user_id, display_name, email)
select u.id, coalesce(u.raw_user_meta_data ->> 'name', null), u.email
from auth.users u
join public.organization_members m on m.user_id = u.id
on conflict (user_id) do update
set email = excluded.email,
    display_name = coalesce(public.organization_member_profiles.display_name, excluded.display_name),
    updated_at = now();

drop policy if exists "organization_members_update_admin" on public.organization_members;
create policy "organization_members_update_admin" on public.organization_members for update to authenticated
using (
  private.is_org_admin(organization_id)
  and not exists (
    select 1 from public.organizations o
    where o.id = organization_id and o.owner_id = user_id
  )
)
with check (
  private.is_org_admin(organization_id)
  and role <> 'Owner'
  and not exists (
    select 1 from public.organizations o
    where o.id = organization_id and o.owner_id = user_id
  )
);