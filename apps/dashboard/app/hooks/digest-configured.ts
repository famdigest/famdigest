import { useMemo } from "react";
import { useWorkspaceLoader } from "./useWorkspaceLoader";
import { Table } from "@repo/supabase";

export function useDigestConfigured(user: Table<"profiles">) {
  const digestConfigurationComplete = useMemo(() => {
    if (user.enabled) {
      return !!user.phone && !!user.notify_on && !!user.timezone;
    }
    return false;
  }, [user]);
  return digestConfigurationComplete;
}
