import { SESSION_KEYS } from "~/constants";
import {
  getSession,
  requireAuthSession,
  sessionStorage,
} from "./session.server";
import { redirect } from "@remix-run/node";

export async function getSessionWorkspace(request: Request) {
  const { user, supabase, response } = await requireAuthSession(request);

  const session = await getSession(request);
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*, workspace_users(*)");

  let workspaceId = (session.get(SESSION_KEYS.workspace) ??
    workspaces?.[0].id) as string | null | undefined;
  if (!workspaceId) {
    // nothing in my cookie for workspace
    throw redirect("/workspaces", {
      headers: response.headers,
    });
  }

  if (workspaces?.length) {
    // confirm cookie
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (!workspace) {
      response.headers.append(
        "set-cookie",
        await sessionStorage.destroySession(session)
      );
      throw redirect("/workspaces", {
        headers: response.headers,
      });
    }

    //
    session.set(SESSION_KEYS.workspace, workspaceId);
    response.headers.append(
      "set-cookie",
      await sessionStorage.commitSession(session)
    );

    return {
      user,
      workspace,
      response,
      supabase,
    };
  }

  throw redirect("/onboarding", {
    headers: response.headers,
  });
}
