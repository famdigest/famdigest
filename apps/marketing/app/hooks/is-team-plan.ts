import { useWorkspaceLoader } from "./useWorkspaceLoader";

export function useIsTeamPlan() {
  const { billing_status: status } = useWorkspaceLoader();
  return status?.plan_name === "Team";
}
