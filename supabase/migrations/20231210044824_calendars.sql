create table if not exists public.calendars (
  id uuid unique not null default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles not null,
  connection_id uuid references public.connections not null,
  external_id text not null,
  enabled boolean not null default true,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.calendars
  enable row level security;

create policy "users can do all things to their own calendars" on public.calendars
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
