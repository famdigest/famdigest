import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { and, db, eq, schema } from "~/lib/db.server";
import { getCalendarList, getToken } from "~/lib/google.server";
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
  const tokens = await getToken(code);
  const parsedIdToken = jwt.decode(tokens.id_token ?? "") as Record<
    string,
    any
  >;
  const [existingConnection] = await db
    .select()
    .from(schema.connections)
    .where(
      and(
        eq(schema.connections.email, parsedIdToken.email),
        eq(schema.connections.owner_id, user.id)
      )
    );

  if (!existingConnection) {
    const [connection] = await db
      .insert(schema.connections)
      .values({
        owner_id: user.id,
        email: parsedIdToken.email,
        provider: "google",
        data: tokens,
      })
      .returning();

    /**
     * on new connections, redirect to page where user can select calendars
     */
    const session = await getSession(request);
    if (session.has("redirect_uri")) {
      const redirect_uri = session.get("redirect_uri");
      session.unset("redirect_uri");
      response.headers.set("set-cookie", await commitSession(session));
      return redirect(redirect_uri, {
        headers: response.headers,
      });
    }
    return redirect(`/calendars/${connection.id}`, {
      headers: response.headers,
    });
  } else {
    await db
      .update(schema.connections)
      .set({
        data: tokens,
      })
      .where(eq(schema.connections.id, existingConnection.id));

    const session = await getSession(request);
    if (session.has("redirect_uri")) {
      const redirect_uri = session.get("redirect_uri");
      session.unset("redirect_uri");
      response.headers.set("set-cookie", await commitSession(session));
      return redirect(redirect_uri, {
        headers: response.headers,
      });
    }

    return redirect(`/calendars/${existingConnection.id}`, {
      headers: response.headers,
    });
  }

  // save tokens
  return redirect("/", {
    headers: response.headers,
  });
}
