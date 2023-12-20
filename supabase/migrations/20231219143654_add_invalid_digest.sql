alter table public.connections
add column invalid boolean default false,
add column error jsonb;
