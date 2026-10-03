create extension if not exists pgcrypto;

create table if not exists public.tech_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.tech_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_name text not null,
  source_kind text not null default 'document',
  manufacturer text,
  model text,
  category_id uuid references public.tech_categories(id) on delete set null,
  description text,
  storage_path text,
  page_count integer,
  search_text text not null default '',
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tech_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  normalized text not null unique,
  term_type text not null default 'keyword',
  created_at timestamptz not null default now()
);

create table if not exists public.tech_synonyms (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.tech_terms(id) on delete cascade,
  synonym text not null,
  normalized text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tech_document_terms (
  document_id uuid not null references public.tech_documents(id) on delete cascade,
  term_id uuid not null references public.tech_terms(id) on delete cascade,
  weight numeric(8,3) not null default 1,
  primary key (document_id, term_id)
);

create table if not exists public.tech_procedures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid references public.tech_categories(id) on delete set null,
  platform text,
  model_family text,
  difficulty text not null default 'intermediário',
  tags text[] not null default '{}',
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tech_procedure_steps (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.tech_procedures(id) on delete cascade,
  step_number integer not null,
  title text not null,
  body text not null,
  risk_note text,
  created_at timestamptz not null default now(),
  unique (procedure_id, step_number)
);

create table if not exists public.tech_procedure_documents (
  procedure_id uuid not null references public.tech_procedures(id) on delete cascade,
  document_id uuid not null references public.tech_documents(id) on delete cascade,
  page_start integer,
  page_end integer,
  primary key (procedure_id, document_id)
);

create table if not exists public.tech_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('document','procedure')),
  entity_id uuid not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table if not exists public.tech_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tech_search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  selected_document_id uuid references public.tech_documents(id) on delete set null,
  selected_procedure_id uuid references public.tech_procedures(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists tech_documents_search_idx on public.tech_documents using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(search_text,'') || ' ' || coalesce(manufacturer,'') || ' ' || coalesce(model,'')));
create index if not exists tech_documents_category_idx on public.tech_documents(category_id);
create index if not exists tech_procedures_category_idx on public.tech_procedures(category_id);
create index if not exists tech_synonyms_term_idx on public.tech_synonyms(term_id);
create index if not exists tech_history_user_idx on public.tech_search_history(user_id, created_at desc);
create index if not exists tech_events_query_idx on public.tech_search_events(query);

alter table public.tech_categories enable row level security;
alter table public.tech_documents enable row level security;
alter table public.tech_terms enable row level security;
alter table public.tech_synonyms enable row level security;
alter table public.tech_document_terms enable row level security;
alter table public.tech_procedures enable row level security;
alter table public.tech_procedure_steps enable row level security;
alter table public.tech_procedure_documents enable row level security;
alter table public.tech_bookmarks enable row level security;
alter table public.tech_search_history enable row level security;
alter table public.tech_search_events enable row level security;

drop policy if exists "tech_categories_auth" on public.tech_categories;
create policy "tech_categories_auth" on public.tech_categories for all to authenticated using (true) with check (true);

drop policy if exists "tech_terms_auth" on public.tech_terms;
create policy "tech_terms_auth" on public.tech_terms for all to authenticated using (true) with check (true);

drop policy if exists "tech_documents_owner" on public.tech_documents;
create policy "tech_documents_owner" on public.tech_documents for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "tech_synonyms_auth" on public.tech_synonyms;
create policy "tech_synonyms_auth" on public.tech_synonyms for all to authenticated using (true) with check (true);

drop policy if exists "tech_document_terms_auth" on public.tech_document_terms;
create policy "tech_document_terms_auth" on public.tech_document_terms for all to authenticated using (
  exists (select 1 from public.tech_documents d where d.id = document_id and d.owner_id = auth.uid())
) with check (
  exists (select 1 from public.tech_documents d where d.id = document_id and d.owner_id = auth.uid())
);

drop policy if exists "tech_procedures_owner" on public.tech_procedures;
create policy "tech_procedures_owner" on public.tech_procedures for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "tech_procedure_steps_owner" on public.tech_procedure_steps;
create policy "tech_procedure_steps_owner" on public.tech_procedure_steps for all to authenticated using (
  exists (select 1 from public.tech_procedures p where p.id = procedure_id and p.owner_id = auth.uid())
) with check (
  exists (select 1 from public.tech_procedures p where p.id = procedure_id and p.owner_id = auth.uid())
);

drop policy if exists "tech_procedure_documents_owner" on public.tech_procedure_documents;
create policy "tech_procedure_documents_owner" on public.tech_procedure_documents for all to authenticated using (
  exists (select 1 from public.tech_procedures p where p.id = procedure_id and p.owner_id = auth.uid())
) with check (
  exists (select 1 from public.tech_procedures p where p.id = procedure_id and p.owner_id = auth.uid())
);

drop policy if exists "tech_bookmarks_self" on public.tech_bookmarks;
create policy "tech_bookmarks_self" on public.tech_bookmarks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "tech_history_self" on public.tech_search_history;
create policy "tech_history_self" on public.tech_search_history for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "tech_events_self" on public.tech_search_events;
create policy "tech_events_self" on public.tech_search_events for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into public.tech_categories (name, slug, description)
values
  ('Celulares', 'celulares', 'Manutenção e diagnóstico de smartphones.'),
  ('Computadores', 'computadores', 'Desktops, notebooks, placas e componentes.'),
  ('Apple', 'apple', 'iPhone, iPad e ecossistema Apple.'),
  ('Android', 'android', 'Samsung, Motorola, Xiaomi e demais Android.')
on conflict (slug) do nothing;
