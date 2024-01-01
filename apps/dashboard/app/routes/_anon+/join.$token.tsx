import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { SESSION_KEYS } from "~/constants";
import { Profile, db } from "@repo/database";
import { commitSession, getSession } from "~/lib/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { token } = params as { token: string };
  const workspace = await db.query.workspaces.findFirst({
    with: {
      owner: true,
    },
    where: (table, { eq }) => eq(table.access_code, token),
  });
  if (!workspace) {
    return redirect("/sign-up");
  }

  const { searchParams } = new URL(request.url);
  let user: Profile = workspace.owner;

  if (searchParams.has("invited_by")) {
    const invited_by = await db.query.profiles.findFirst({
      where: (table, { eq }) =>
        eq(table.id, searchParams.get("invited_by") as string),
    });
    if (invited_by) {
      user = invited_by;
    }
  }

  const session = await getSession(request);
  session.set(
    SESSION_KEYS.join,
    JSON.stringify({ token, invited_by: user.id })
  );

  return redirect("/sign-up", {
    headers: {
      "set-cookie": await commitSession(session),
    },
  });
}
