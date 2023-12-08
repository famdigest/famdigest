/**
 * Account roles allow you to provide permission levels to users
 * when they're acting on an account.  By default, we provide
 * "owner" and "member".  The only distinction is that owners can
 * also manage billing and invite/remove account members.
 */

create type public.workspace_role as enum ('owner', 'member');

-- Create a table for public users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text unique,
  phone text unique,
  avatar_url text,
  preferences jsonb not null default '{"theme":"light"}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.workspaces (
  id uuid default extensions.uuid_generate_v4() not null primary key,
  owner_id uuid references public.profiles not null,
  name text not null,
  slug text not null,
  settings jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.workspace_users (
  user_id uuid references public.profiles not null,
  workspace_id uuid references public.workspaces not null,
  role workspace_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  constraint workspace_user_pkey primary key (workspace_id, user_id)
);

/**
 * We want to protect some fields on workspaces from being updated
 * Specifically the primary owner user id and workspace id.
 * owner_id should be updated using the dedicated function
 */
create or replace function public.protect_workspace_fields()
  RETURNS TRIGGER AS
$$
begin
  if current_user IN ('authenticated', 'anon') then
    -- these are protected fields that users are not allowed to update themselves
    -- platform admins should be VERY careful about updating them as well.
    if NEW.id <> OLD.id OR NEW.owner_id <> OLD.owner_id
    then
      RAISE EXCEPTION 'You do not have permission to update this field';
    end if;
  end if;
  return new;
end
$$ LANGUAGE plpgsql;

/**
  * When an account gets created, we want to insert the current user as the first
  * owner
 */
create function saas.add_current_user_to_new_workspace()
  returns trigger
  language plpgsql
security definer
set search_path=public
as $$
  begin
    if new.owner_id = auth.uid() then
      insert into public.workspace_users (workspace_id, user_id, role)
      values (NEW.id, auth.uid(), 'owner');
    end if;
    return NEW;
  end;
$$;

/**
  * Returns the current user's role within a given account_id
  * Exists in the public name space because it's accessible via the API
*/
create or replace function public.current_user_account_role(lookup_workspace_id uuid)
returns jsonb
language plpgsql
as $$
  declare
    user_workspace_role workspace_role;
    is_workspace_owner boolean;
  begin
    if lookup_workspace_id is null then
      -- return an error
      raise exception 'workspace_id is required';
    end if;
    select role into user_workspace_role from public.workspace_users where user_id = auth.uid() and workspace_users.workspace_id = lookup_workspace_id;
    select owner_id = auth.uid() into is_workspace_owner from public.workspaces where id = lookup_workspace_id;

    if user_workspace_role is null then
      return null;
    end if;

    return jsonb_build_object(
      'workspace_role', user_workspace_role,
      'is_primary_owner', is_workspace_owner
    );
  end;
$$;

grant execute on function public.current_user_account_role(uuid) to authenticated;

/**
* Returns account_ids that the current user is a member of. If you pass in a role,
* it'll only return accounts that the user is a member of with that role.
*/
create or replace function saas.get_workspaces_for_current_user(passed_in_role workspace_role default null)
returns setof uuid
language sql
security definer
set search_path=public
as $$
  select workspace_id
  from public.workspace_users wu
  where wu.user_id = auth.uid()
    and
      (
        wu.role = passed_in_role
        or passed_in_role is null
      );
$$;

grant execute on function saas.get_workspaces_for_current_user(workspace_role) to authenticated;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.phone, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger protect_workspace_fields
  before update
  on public.workspaces
  for each row
  execute function public.protect_workspace_fields();

-- trigger the function whenever a new account is created
create trigger add_current_user_to_new_workspace
    after insert
    on public.workspaces
    for each row
    execute function saas.add_current_user_to_new_workspace();

create trigger handle_timestamps_users before update
on public.profiles
for each row execute
  procedure extensions.moddatetime(updated_at);

create trigger handle_timestamps_workspaces before update
on public.workspaces
for each row execute
  procedure extensions.moddatetime(updated_at);

create trigger handle_timestamps_workspace_users before update
on public.workspace_users
for each row execute
  procedure extensions.moddatetime(updated_at);

-- enable RLS for users
alter table public.profiles
  enable row level security;

-- enable RLS for workspace_users
alter table workspaces
  enable row level security;

-- enable RLS for workspace_users
alter table workspace_users
  enable row level security;

/**
* workspace user permission policies
* workspace viewers can all view other workspace members and their roles
*/
create policy "users can view their own workspace_users" on workspace_users
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can view their teammates" on workspace_users
  for select
  to authenticated
  using (
    (workspace_id IN ( SELECT saas.get_workspaces_for_current_user() AS get_workspaces_for_current_user))
  );

/**
* workspace members can be removed by owners. You cannot remove the primary workspace owner
*/
create policy "workspace users can be deleted except for the primary workspace owner" on workspace_users
  for delete
  to authenticated
  using (
    (workspace_id IN ( SELECT saas.get_workspaces_for_current_user('owner') AS get_workspaces_for_current_user))
    AND
    user_id != (select owner_id from public.workspaces where workspace_id = workspaces.id)
  );

/**
* workspaces are viewable by their owners and members
*/
create policy "workspaces are viewable by members" on workspaces
  for select
  to authenticated
  using (
    id in (select saas.get_workspaces_for_current_user())
  );

/**
* workspaces need to be readable by primary_owner_user_id so that the select
* after initial create is readable
*/
create policy "workspaces are viewable by primary owner" on workspaces
  for select
  to authenticated
  using (
    owner_id = auth.uid()
  );

/**
* workspaces can be created by any user
*/
create policy "workspaces can be created by any user" on workspaces
  for insert
  to authenticated
  with check (
    true
  );

create policy "workspaces can be edited by owners" on workspaces
  for update
  to authenticated
  using (
    (id IN ( SELECT saas.get_workspaces_for_current_user('owner') AS get_workspaces_for_current_user))
  );

-- permissions for viewing profiles for user and team members (ideally as two separate policies)
-- add permissions for updating profiles for the user only
create policy "Users can view their own profiles" on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
  );

create policy "Users can view their teammates profiles" on public.profiles
  for select
  to authenticated
  using (
    id IN (
      SELECT workspace_users.user_id FROM workspace_users WHERE (workspace_users.user_id <> auth.uid())
    )
  );

create policy "Profiles are editable by their own user only" on public.profiles
  for update
  to authenticated
  using (
    id = auth.uid()
  );
