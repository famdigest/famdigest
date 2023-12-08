/**
  * Invitations are sent to users to join a account
  * They pre-define the role the user should have once they join
 */

CREATE TYPE public.invitation_type AS ENUM ('one-time', '24-hour');

create table public.invitations
(
    -- the id of the invitation
    id                 uuid unique                not null default uuid_generate_v4(),
    -- what role should invitation accepters be given in this account
    role       workspace_role               not null,
    -- the account the invitation is for
    workspace_id         uuid references workspaces   not null,
    -- unique token used to accept the invitation
    token              text unique                not null default uuid_generate_v4(),
    -- email of the invited
    email               text not null,
    -- invitation url
    invite_url               text,
    -- who created the invitation
    invited_by_user_id uuid references public.profiles not null,
    -- account name. filled in by a trigger
    workspace_name  text,
    -- when the invitation was created
    created_at timestamp with time zone default timezone('utc'::text, now()),
    -- when the invitation was updated
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    -- what type of invitation is this
    invitation_type    invitation_type default 'one-time'::invitation_type,

    primary key (id)
);

create trigger handle_timestamps_invitations before update
on public.invitations
for each row execute
  procedure extensions.moddatetime(updated_at);

/**
  * This funciton fills in account info and inviting user email
  * so that the recipient can get more info about the invitation prior to
  * accepting.  It allows us to avoid complex permissions on accounts
 */
CREATE OR REPLACE FUNCTION saas.trigger_set_invitation_details()
  RETURNS TRIGGER AS
$$
BEGIN
  NEW.invited_by_user_id = auth.uid();
  NEW.workspace_name = (select name from public.workspaces where id = NEW.workspace_id);
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_details
  BEFORE INSERT
  ON public.invitations
  FOR EACH ROW
EXECUTE FUNCTION saas.trigger_set_invitation_details();

-- enable RLS on invitations
alter table public.invitations
  enable row level security;

create policy "Invitations viewable by account owners" on invitations
  for select
  to authenticated
  using (
    workspace_id IN (
      SELECT saas.get_workspaces_for_current_user('owner') AS get_workspaces_for_current_user
    )
  );

create policy "Invitations can be created by account owners" on invitations
  for insert
  to authenticated
  with check (
    -- team accounts should be enabled
    saas.is_set('enable_team_accounts') = true
    -- the inserting user should be an owner of the account
    and
      (
        workspace_id IN (
          SELECT saas.get_workspaces_for_current_user('owner') AS get_workspaces_for_current_user
        )
      )
    );

create policy "Invitations can be deleted by account owners" on invitations
  for delete
  to authenticated
  using (
  (workspace_id IN
    (SELECT saas.get_workspaces_for_current_user('owner') AS get_workspaces_for_current_user))
  );

/**
  * Allows a user to accept an existing invitation and join a account
  * This one exists in the public schema because we want it to be called
  * using the supabase rpc method
 */
create or replace function accept_invitation(lookup_invitation_token text)
  returns uuid
  language plpgsql
  security definer set search_path = public
as
$$
declare
  lookup_workspace_id       uuid;
  new_member_role workspace_role;
  new_member_email text;
begin
  select workspace_id, role, email
  into lookup_workspace_id, new_member_role, new_member_email
  from invitations
  where token = lookup_invitation_token;

  if lookup_workspace_id IS NULL then
      raise exception 'Invitation not found';
  end if;

  if lookup_workspace_id is not null then
      -- we've validated the token is real, so grant the user access
      insert into workspace_users (workspace_id, user_id, role)
      values (lookup_workspace_id, auth.uid(), new_member_role);
      -- email types of invitations are only good for one usage
      delete from invitations where token = lookup_invitation_token;
  end if;
  return lookup_workspace_id;
end;
$$;

/**
  * Allows a user to lookup an existing invitation and join a account
  * This one exists in the public schema because we want it to be called
  * using the supabase rpc method
 */
create or replace function public.lookup_invitation(lookup_invitation_token text)
  returns json
  language plpgsql
  security definer set search_path = public
as
$$
declare
  team_name         text;
  invitation_active boolean;
begin
    select workspace_name,
           case when id IS NOT NULL then true else false end as active
    into team_name, invitation_active
    from invitations
    where token = lookup_invitation_token
    limit 1;
    return json_build_object('active', coalesce(invitation_active, false), 'team_name', team_name);
end;
$$;


grant execute on function accept_invitation(text) to authenticated;
grant execute on function lookup_invitation(text) to authenticated;
