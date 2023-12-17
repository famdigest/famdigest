import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { track } from "@repo/tracking";
import { z } from "zod";
import {
  commitSession,
  getSession,
  requireAuthSession,
} from "~/lib/session.server";
import { handler } from "~/services/applecalendar/api";

const appleCredentialSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export async function action({ request }: ActionFunctionArgs) {
  const { user, response } = await requireAuthSession(request);
  const { username, password } = appleCredentialSchema.parse(
    Object.fromEntries(await request.formData())
  );

  const connectionId = await handler({
    user,
    username,
    password,
  });

  const session = await getSession(request);
  track({
    request,
    properties: {
      event_name: "Calendar Created",
      device_id: session.id,
      user_id: user.id,
      provider: "Apple",
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
