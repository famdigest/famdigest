import { useMatches } from "@remix-run/react";
import { Profile, Workspace, WorkspaceBillingStatus } from "@repo/supabase";

export function useWorkspaceLoader() {
  const match = useMatches().find(
    (m) => m.id === "routes/_authenticated+/_layout"
  );
  if (!match) {
    throw new Error(
      "To `useWorkspaceLoader` you must be within the workspace context"
    );
  }
  return match.data as {
    user: Profile;
    workspace: Workspace;
    billing_status: WorkspaceBillingStatus;
  };
}
