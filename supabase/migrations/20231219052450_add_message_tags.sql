alter table public.messages
add column tags jsonb default '[]'::jsonb;
