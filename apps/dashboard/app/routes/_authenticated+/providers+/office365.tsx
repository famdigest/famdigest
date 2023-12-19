import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { o365CalendarHandler as handler } from "@repo/plugins";
import { track } from "@repo/tracking";
import {
  commitSession,
  getSession,
  requireAuthSession,
} from "~/lib/session.server";

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

  try {
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
