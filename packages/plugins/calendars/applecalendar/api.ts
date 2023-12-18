import { Table } from "@repo/supabase";
import { symmetricEncrypt } from "../../lib/crypto";
import { AppleCalendarService } from "./CalendarService";
import { InferSelectModel, db, eq, schema } from "@repo/database";
import { AppleConnection } from "./types";

export async function handler({
  username,
  password,
  user,
}: {
  username: string;
  password: string;
  user: Table<"profiles">;
}) {
  const existingConnection = await db.query.connections.findFirst({
    where: (connection, { and, eq }) =>
      and(eq(connection.owner_id, user.id), eq(connection.email, username)),
  });

  let connection: InferSelectModel<typeof schema.connections> | undefined;
  if (!existingConnection) {
    const [result] = await db
      .insert(schema.connections)
      .values({
        owner_id: user.id,
        email: username,
        provider: "apple",
        data: symmetricEncrypt(
          JSON.stringify({ username, password }),
          process.env.CALENDSO_ENCRYPTION_KEY || ""
        ),
      })
      .returning();
    if (result) {
      connection = result;
    }
  } else {
    const [result] = await db
      .update(schema.connections)
      .set({
        data: symmetricEncrypt(
          JSON.stringify({ username, password }),
          process.env.CALENDSO_ENCRYPTION_KEY || ""
        ),
      })
      .where(eq(schema.connections.id, existingConnection.id))
      .returning();
    if (result) connection = result;
  }

  if (!connection) {
    throw new Error("No connection found");
  }

  try {
    const dav = new AppleCalendarService(connection as AppleConnection);
    const calendars = await dav?.listCalendars();

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

  return connection.id;
}
