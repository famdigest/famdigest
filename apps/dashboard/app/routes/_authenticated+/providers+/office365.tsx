import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { o365CalendarHandler as handler } from "@repo/plugins";
import { track } from "@repo/tracking";
import { commitSession, getSession } from "~/lib/session.server";
import { getSessionWorkspace } from "~/lib/workspace.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    const error = searchParams.get("error");
    throw redirect(`/calendars?error=office365|${error ?? "failure"}`);
  }

  try {
    const connectionId = await handler({
      code,
      user,
      workspace,
    });

    const session = await getSession(request);
    track({
      request,
      properties: {
        event_name: "Calendar Created",
        device_id: session.id,
        user_id: user.id,
        provider: "Office365",
      },
    });

    const finalRedirect =
      session.get("redirect_uri") ?? `/calendars/${connectionId}`;

    if (session.has("redirect_uri")) {
      session.unset("redirect_uri");
    }

    response.headers.set("set-cookie", await commitSession(session));
    return redirect(finalRedirect, {
      headers: response.headers,
    });
  } catch (error) {
    throw redirect(`/calendars?error=${(error as Error).message!}`);
  }
}
