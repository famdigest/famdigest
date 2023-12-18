import { Table } from "@repo/supabase";

export async function handler({
  username,
  password,
  user,
}: {
  username: string;
  password: string;
  user: Table<"profiles">;
}) {
  return null;
}
