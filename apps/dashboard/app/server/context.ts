import { type inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { SESSION_KEYS } from "~/constants";
import { combineHeaders } from "~/lib/merge-headers.server";
import { getSession } from "~/lib/session.server";
import { createServerClient, type Table } from "@repo/supabase";
import { db, type Profile } from "@repo/database";

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const session = await getSession(req);
  const res = new Response();

  const supabase = createServerClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: Profile | undefined = undefined;
  if (user) {
    const profile = await db.query.profiles.findFirst({
      where: (table, { eq }) => eq(table.id, user.id),
    });

    userProfile = profile;
  }

  const workspaceId = session.get(SESSION_KEYS.workspace);
  let workspace:
    | (Table<"workspaces"> & {
        workspace_users: Table<"workspace_users">[];
      })
    | null = null;

  if (workspaceId) {
    const { data } = await supabase
      .from("workspaces")
      .select("*, workspace_users(*)")
      .match({ id: workspaceId })
      .single();
    if (data) {
      workspace = data;
    }
  }

  return {
    req,
    res: {
      ...res,
      headers: combineHeaders(resHeaders, res.headers),
    },
    session,
    supabase,
    workspace,
    user: userProfile,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
