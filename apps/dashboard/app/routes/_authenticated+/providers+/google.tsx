import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { and, db, eq, schema } from "@repo/database";
import { getToken } from "~/lib/google.server";
import { requireAuthSession } from "~/lib/session.server";

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
    .where(eq(schema.connections.email, parsedIdToken.email));

  if (!existingConnection) {
    await db.insert(schema.connections).values({
      owner_id: user.id,
      email: parsedIdToken.email,
      provider: "google",
      data: tokens,
    });
  } else {
    await db
      .update(schema.connections)
      .set({
        data: tokens,
      })
      .where(eq(schema.connections.id, existingConnection.id));
  }

  // save tokens
  return redirect("/", {
    headers: response.headers,
  });
}