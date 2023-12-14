create policy "owners can update their teammates" on workspace_users
  for update
  to authenticated
  using (
    (workspace_id IN ( SELECT saas.get_workspaces_for_current_user() AS get_workspaces_for_current_user))
  )
  with check (
    (workspace_id IN ( SELECT saas.get_workspaces_for_current_user() AS get_workspaces_for_current_user))
  )
