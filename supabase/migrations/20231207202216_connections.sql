create table if not exists public.connections (
  id uuid unique not null default uuid_generate_v4() primary key,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.connections
  enable row level security;
