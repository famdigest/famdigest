create type message_role as enum ('assistant', 'user');

create table if not exists public.messages (
  id uuid unique not null default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles on delete cascade not null,
  digest_id uuid references public.digests on delete cascade not null,
  external_id text not null,
  message text not null,
  segments integer not null,
  role message_role not null,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.messages
  enable row level security;

create policy "users can do all things to their own messages" on public.messages
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
