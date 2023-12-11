create table if not exists public.digests (
  id uuid unique not null default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles on delete cascade not null,
  full_name text not null,
  phone text not null,
  opt_in boolean not null default false,
  enabled boolean not null default true,
  timezone text not null,
  notify_on time with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.digests
  enable row level security;

create policy "users can do all things to their own digests" on public.digests
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
