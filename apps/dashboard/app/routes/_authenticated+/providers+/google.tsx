import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { track } from "@repo/tracking";
import { commitSession, getSession } from "~/lib/session.server";
import { googleCalendarHandler as handler } from "@repo/plugins";
import { getSessionWorkspace } from "~/lib/workspace.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const session = await getSession(request);

  if (!code) {
    const error = searchParams.get("error");
    throw redirect(`/calendars?error=google|${error ?? "failure"}`);
  }

  const connectionId = await handler({
    code,
    user,
    workspace,
  });

  track({
    request,
    properties: {
      event_name: "Calendar Created",
      device_id: session.id,
      user_id: user.id,
      provider: "Google",
    },
  });

  console.log("redirect_uri", session.get("redirect_uri"));

  if (session.has("redirect_uri")) {
    const redirect_uri = session.get("redirect_uri");
    session.unset("redirect_uri");
    response.headers.set("set-cookie", await commitSession(session));
    return redirect(redirect_uri, {
      headers: response.headers,
    });
  }

  return redirect(`/calendars/${connectionId}`, {
    headers: response.headers,
  });
}
