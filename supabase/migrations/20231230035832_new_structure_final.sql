-- create unique workspace code for quick invites
alter table public.workspaces
add column access_code text not null default substring(gen_random_uuid()::text from 1 for 8);

create type event_preference as enum ('same-day', 'next-day');

create table if not exists public.subscriptions (
  id uuid unique not null default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles on delete cascade not null,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references public.profiles on delete set null,
  full_name text not null,
  phone text not null,
  opt_in boolean not null default false,
  enabled boolean not null default true,
  timezone text not null,
  notify_on time with time zone not null,
  event_preferences event_preference not null default 'same-day'::event_preference,
  access_code text not null default substring(gen_random_uuid()::text from 1 for 8),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.subscriptions
  enable row level security;

create table if not exists public.subscription_calendars (
  subscription_id uuid references public.subscriptions on delete cascade not null,
  calendar_id uuid references public.calendars on delete cascade not null,

  constraint subscription_calendar_pkey primary key (subscription_id, calendar_id)
);

alter table public.subscription_calendars
  enable row level security;

create table if not exists public.subscription_logs (
  id uuid unique not null default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles on delete cascade not null,
  workspace_id uuid references public.workspaces on delete cascade not null,
  subscription_id uuid references public.subscriptions on delete cascade not null,
  external_id text not null,
  message text not null,
  segments integer not null,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.subscription_logs
  enable row level security;

create type request_type as enum ('digest', 'calendar');

alter table public.invitations
add column request_type request_type default 'calendar'::request_type;

--

alter table public.connections
add column workspace_id uuid references public.workspaces on delete cascade;

UPDATE public.connections
SET workspace_id = w.id
FROM public.workspaces w
WHERE public.connections.owner_id = w.owner_id;

ALTER TABLE public.connections
ALTER COLUMN workspace_id SET NOT NULL;

alter table public.messages
add column workspace_id uuid references public.workspaces on delete cascade;

UPDATE public.messages
SET workspace_id = w.id
FROM public.workspaces w
WHERE public.messages.owner_id = w.owner_id;

ALTER TABLE public.messages
ALTER COLUMN workspace_id SET NOT NULL;
