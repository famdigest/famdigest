import { useWorkspaceLoader } from "./useWorkspaceLoader";

export function useIsTeamOwner() {
  const { user, workspace } = useWorkspaceLoader();
  const role = workspace.workspace_users.find(
    (wu) => wu.user_id === user.id
  )!.role;

  if (role !== "owner") return false;
  return true;
}
