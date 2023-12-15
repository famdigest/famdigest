import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { track } from "@repo/tracking";
import {
  commitSession,
  getSession,
  requireAuthSession,
} from "~/lib/session.server";
import { handler } from "~/services/google/api";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    throw new Response("", {
      status: 500,
      statusText: "No code found in callback",
    });
  }

  const connectionId = await handler({
    code,
    user,
  });

  const session = await getSession(request);
  track({
    request,
    properties: {
      event_name: "Calendar Created",
      device_id: session.id,
      user_id: user.id,
      provider: "Google",
    },
  });

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
