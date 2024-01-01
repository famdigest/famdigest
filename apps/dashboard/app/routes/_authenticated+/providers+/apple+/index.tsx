import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { track } from "@repo/tracking";
import { z } from "zod";
import { commitSession, getSession } from "~/lib/session.server";
import { appleCalendarHandler as handler } from "@repo/plugins";
import { getSessionWorkspace } from "~/lib/workspace.server";

const appleCredentialSchema = z.object({
  username: z.string(),
  password: z.string(),
  redirect_uri: z.string().optional(),
});
export async function action({ request }: ActionFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);
  const session = await getSession(request);
  const { username, password, redirect_uri } = appleCredentialSchema.parse(
    Object.fromEntries(await request.formData())
  );

  const connectionId = await handler({
    user,
    username,
    password,
    workspace,
  });

  track({
    request,
    properties: {
      event_name: "Calendar Created",
      device_id: session.id,
      user_id: user.id,
      provider: "Apple",
    },
  });

  let finalRedirect = `/calendars/${connectionId}`;

  if (redirect_uri?.length) {
    finalRedirect = redirect_uri;
  } else if (session.has("redirect_uri")) {
    finalRedirect = session.get("redirect_uri") as string;
    session.unset("redirect_uri");
  }

  response.headers.set("set-cookie", await commitSession(session));
  return redirect(finalRedirect, {
    headers: response.headers,
  });
}
