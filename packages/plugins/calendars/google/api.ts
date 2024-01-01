import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { getBaseUrl } from "../../lib/base-url";
import { Profile, Workspace, db, eq, schema } from "@repo/database";

const scopes = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "email",
  "profile",
  "openid",
];

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET,
  `${getBaseUrl()}/providers/google`
);

export function generateAuthUrl() {
  const authorizeUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
    prompt: "consent",
    redirect_uri: `${getBaseUrl()}/providers/google`,
  });
  return authorizeUrl;
}

export async function getToken(code: string) {
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export async function handler({
  code,
  user,
  workspace,
}: {
  user: Profile;
  workspace: Workspace;
  code: string;
  is_external?: boolean;
}) {
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);

  const calendar = google.calendar({
    version: "v3",
    auth,
  });

  const parsedIdToken = jwt.decode(tokens.id_token ?? "") as Record<
    string,
    any
  >;

  const existingConnection = await db.query.connections.findFirst({
    where: (connection, { and, eq }) =>
      and(
        eq(connection.owner_id, user.id),
        eq(connection.workspace_id, workspace.id),
        eq(connection.email, parsedIdToken.email!),
        eq(connection.provider, "google")
      ),
  });

  let connectionId: string = "";
  if (!existingConnection) {
    const [connection] = await db
      .insert(schema.connections)
      .values({
        workspace_id: workspace.id,
        owner_id: user.id,
        email: parsedIdToken.email,
        provider: "google",
        data: tokens,
        invalid: false,
        error: null,
      })
      .returning();
    if (connection) {
      connectionId = connection.id;
    }
  } else {
    await db
      .update(schema.connections)
      .set({
        data: tokens,
        invalid: false,
        error: null,
      })
      .where(eq(schema.connections.id, existingConnection.id));
    connectionId = existingConnection.id;
  }

  const cals = await calendar.calendarList.list({
    fields: "items(id,summary,primary,accessRole)",
  });

  const promises = (cals.data.items ?? []).map((cal) => {
    return new Promise(async (resolve) => {
      const id = await db.query.calendars.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.external_id, cal.id!),
            eq(table.connection_id, connectionId)
          ),
      });
      if (!id) {
        await db.insert(schema.calendars).values({
          connection_id: connectionId,
          owner_id: user.id,
          enabled: cal.primary === true,
          external_id: cal.id!,
          name: cal.summary ?? cal.id!,
          data: cal,
        });
      }
      resolve(true);
    });
  });

  await Promise.all(promises);

  return connectionId;
}
