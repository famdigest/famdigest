import type { Calendar as OfficeCalendar } from "@microsoft/microsoft-graph-types-beta";

import { db, eq, schema } from "@repo/database";
import { Calendar, CalendarEvent, Connection, ExternalCalendar } from "../base";
import { Office365Connection } from "./types";
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
  private accessToken: string | null = null;
  private apiGraphUrl = "https://graph.microsoft.com/v1.0";

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
              client_id: process.env.MSFT_CLIENT_ID!,
              refresh_token: credentials.refresh_token!,
              grant_type: "refresh_token",
              client_secret: process.env.MSFT_CLIENT_SECRET_VALUE!,
            }),
          }
        );
        const response = await request.json();
        console.log("refreshAccessToken", response);
        credentials = {
          ...credentials,
          access_token: response.access_token,
        };
        await db
          .update(schema.connections)
          .set({
            data: response,
          })
          .where(eq(schema.connections.id, this.connection.id));
      } catch (error) {
        // @todo send notification to user
        await db
          .update(schema.connections)
          .set({
            data: { invalid: true },
          })
          .where(eq(schema.connections.id, this.connection.id));
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

  async listCalendars(_event?: CalendarEvent): Promise<Calendar[]> {
    const officeCalendars: OfficeCalendar[] = [];
    // List calendars from MS are paginated
    let finishedParsingCalendars = false;
    const calendarFilterParam = "$select=id,name,isDefaultCalendar,owner";

    // Store @odata.nextLink if in response
    let requestLink = `/me/calendars?${calendarFilterParam}`;

    while (!finishedParsingCalendars) {
      const request = await this.fetcher(requestLink);
      let responseBody = await request.json();
      // If responseBody is valid then parse the JSON text
      if (typeof responseBody === "string") {
        responseBody = JSON.parse(responseBody) as { value: OfficeCalendar[] };
      }

      officeCalendars.push(...responseBody.value);

      if (responseBody["@odata.nextLink"]) {
        requestLink = responseBody["@odata.nextLink"].replace(
          this.apiGraphUrl,
          ""
        );
      } else {
        finishedParsingCalendars = true;
      }
    }

    return officeCalendars.map(
      (cal) =>
        ({
          external_id: cal.id,
          name: cal.name ?? "No Name",
          enabled: cal.isDefaultCalendar === true,
          data: {
            ...cal,
          },
        }) as Calendar
    );
  }

  getCalendar(_id: string | null): Promise<Calendar> {
    return Promise.resolve({} as Calendar);
  }

  getTodayEvents(_calendarId: string): Promise<CalendarEvent[]> {
    return Promise.resolve([]);
  }

  private fetcher = async (
    endpoint: string,
    init?: RequestInit | undefined
  ) => {
    this.accessToken = await this.auth.getToken();
    return fetch(`${this.apiGraphUrl}${endpoint}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      ...init,
    });
  };
}
