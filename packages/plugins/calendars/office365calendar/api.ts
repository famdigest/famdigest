import { stringify } from "querystring";
import { Table } from "@repo/supabase";
import {
  Office365CalendarService,
  Office365Connection,
  getBaseUrl,
} from "../..";
import { InferSelectModel, db, eq, schema } from "@repo/database";

const scopes = ["User.Read", "Calendars.Read", "offline_access"];

export function generateAuthUrl(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.has("state")
    ? JSON.stringify(JSON.parse(searchParams.get("state") as string))
    : undefined;

  const params = {
    response_type: "code",
    scope: scopes.join(" "),
    client_id: process.env.MSFT_CLIENT_ID!,
    client_secret: process.env.MSFT_CLIENT_SECRET_VALUE!,
    prompt: "select_account",
    state,
    redirect_uri: `${getBaseUrl()}/providers/office365`,
  };
  const query = stringify(params);
  const authorizeUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`;
  return authorizeUrl;
}

export async function handler({
  code,
  user,
}: {
  code: string;
  user: Table<"profiles">;
}) {
  const toUrlEncoded = (payload: Record<string, string>) =>
    Object.keys(payload)
      .map((key) => `${key}=${encodeURIComponent(payload[key]!)}`)
      .join("&");

  const body = toUrlEncoded({
    client_id: process.env.MSFT_CLIENT_ID!,
    grant_type: "authorization_code",
    code,
    scope: scopes.join(" "),
    redirect_uri: `${getBaseUrl()}/providers/office365`,
    client_secret: process.env.MSFT_CLIENT_SECRET_VALUE!,
  });

  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    }
  );

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error("oautherror");
  }

  const whoami = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${responseBody.access_token}` },
  });
  const graphUser = await whoami.json();

  // In some cases, graphUser.mail is null. Then graphUser.userPrincipalName most likely contains the email address.
  responseBody.email = graphUser.mail ?? graphUser.userPrincipalName;
  responseBody.expiry_date = Math.round(
    +new Date() / 1000 + responseBody.expires_in
  ); // set expiry date in seconds
  delete responseBody.expires_in;

  const existingConnection = await db.query.connections.findFirst({
    where: (connection, { and, eq }) =>
      and(
        eq(connection.owner_id, user.id),
        eq(connection.email, responseBody.email!)
      ),
  });

  let connection: InferSelectModel<typeof schema.connections> | undefined;
  if (!existingConnection) {
    const [result] = await db
      .insert(schema.connections)
      .values({
        owner_id: user.id,
        email: responseBody.email,
        provider: "office365",
        data: responseBody,
      })
      .returning();
    if (result) {
      connection = result;
    }
  } else {
    const [updated] = await db
      .update(schema.connections)
      .set({
        data: responseBody,
      })
      .where(eq(schema.connections.id, existingConnection.id))
      .returning();
    connection = updated;
  }

  try {
    const dav = new Office365CalendarService(connection as Office365Connection);
    const calendars = await dav.listCalendars();

    const promises = (calendars ?? []).map((cal) => {
      return new Promise(async (resolve) => {
        const id = await db.query.calendars.findFirst({
          where: (table, { and, eq }) =>
            and(
              eq(table.external_id, cal.external_id),
              eq(table.connection_id, connection!.id)
            ),
        });
        if (!id) {
          await db.insert(schema.calendars).values({
            connection_id: connection!.id,
            owner_id: user.id,
            enabled: cal.enabled,
            external_id: cal.external_id!,
            name: cal.name!,
            data: cal,
          });
        }
        resolve(true);
      });
    });

    await Promise.all(promises);
  } catch (reason) {
    throw new Error("Could not add this caldav account");
  }

  return connection?.id;
}
