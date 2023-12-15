import { db, eq, schema } from "~/lib/db.server";
import {
  Calendar,
  CalendarEvent,
  Connection,
  ExternalCalendar,
  Office365Connection,
} from "../types";
import { z } from "zod";

const refreshTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z
    .number()
    .transform((currentTimeOffsetInSeconds) =>
      Math.round(+new Date() / 1000 + currentTimeOffsetInSeconds)
    ),
  refresh_token: z.string().optional(),
});

export class Office365CalendarService implements ExternalCalendar {
  connection: Office365Connection;
  auth: { getToken: () => Promise<string> };

  constructor(connection: Connection) {
    this.connection = connection as Office365Connection;
    this.auth = this.o365Auth();
  }

  private o365Auth() {
    const isExpired = (expiryDate: number) => {
      if (!expiryDate) {
        return true;
      } else {
        return expiryDate < Math.round(+new Date() / 1000);
      }
    };

    const refreshAccessToken = async (
      credentials: Office365Connection["data"]
    ) => {
      try {
        const request = await fetch(
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              scope: "User.Read Calendars.Read",
              client_id: "",
              refresh_token: credentials.refresh_token!,
              grant_type: "refresh_token",
              client_secret: "",
            }),
          }
        );
        const response = await request.json();
        credentials = {
          ...credentials,
          access_token: response.access_token,
        };
        await db
          .update(schema.connections)
          .set({
            data: response,
          })
          .where(eq(schema.connections, this.connection.id));
      } catch (error) {
        // @todo send notification to user
        await db
          .update(schema.connections)
          .set({
            data: { invalid: true },
          })
          .where(eq(schema.connections, this.connection.id));
      }
      return credentials.access_token;
    };

    return {
      getToken: () =>
        refreshTokenResponseSchema.safeParse(this.connection.data).success &&
        !isExpired(this.connection.data.expires_in)
          ? Promise.resolve(this.connection.data.access_token)
          : refreshAccessToken(this.connection.data),
    };
  }

  listCalendars(event?: CalendarEvent): Promise<Calendar[]> {
    return Promise.resolve([]);
  }

  getCalendar(id: string | null): Promise<Calendar> {
    return Promise.resolve({} as Calendar);
  }

  getTodayEvents(calendarId: string): Promise<CalendarEvent[]> {
    return Promise.resolve([]);
  }
}
