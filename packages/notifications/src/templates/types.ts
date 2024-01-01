import { Profile } from "@repo/database";
import { Table } from "@repo/supabase";

export interface TemplateProps {
  workspace: Table<"workspaces">;
  owner: Profile;
  contact: Profile;
  calendar?: Table<"calendars">;
}
