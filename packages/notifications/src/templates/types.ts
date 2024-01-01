import { Profile, Subscriber, Workspace } from "@repo/database";
import { Table } from "@repo/supabase";

export interface TemplateProps {
  workspace: Workspace;
  owner: Profile;
  contact: Profile | Subscriber;
  calendar?: Table<"calendars">;
}
