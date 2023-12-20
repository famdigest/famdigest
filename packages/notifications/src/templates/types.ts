import { Table } from "@repo/supabase";

export interface TemplateProps {
  owner: Table<"profiles">;
  contact: Table<"digests">;
  calendar?: Table<"calendars">;
}
