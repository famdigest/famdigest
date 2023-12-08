create table if not exists public.sessions (
  id uuid unique not null default uuid_generate_v4() primary key,
  data jsonb,
  expires timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.sessions
  enable row level security;
