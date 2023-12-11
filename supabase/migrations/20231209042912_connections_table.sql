drop table if exists public.connections;

create type provider_type as enum ('google', 'outlook', 'yahoo', 'aol', 'zoho', 'protonmail', 'icloud', 'live', 'hotmail');

create table if not exists public.connections (
  id uuid unique not null default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles on delete cascade not null,
  email text not null,
  provider provider_type not null,
  enabled boolean not null default true,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.connections
  enable row level security;

create policy "users can do all things to their own connections" on public.connections
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
