import { Table } from "@repo/supabase";

export async function handler(_props: {
  username: string;
  password: string;
  user: Table<"profiles">;
}) {
  return null;
}
