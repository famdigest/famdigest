import { getLocalTime, getUtc } from "../../lib/dates";
import { Calendar, ExternalCalendar, CalendarEvent, Connection } from "../base";
import { GoogleConnection } from "./types";
import { google, type calendar_v3 } from "googleapis";
import { getBaseUrl } from "../../lib/base-url";
import { db, eq, schema } from "@repo/database";
import { z } from "zod";
import dayjs from "dayjs";

export const googleCredentialSchema = z.object({
  scope: z.string(),
  token_type: z.literal("Bearer"),
  expiry_date: z.number(),
  access_token: z.string(),
  refresh_token: z.string(),
});

export class GoogleCalendarService implements ExternalCalendar {
  connection: GoogleConnection;
  private auth: { getToken: () => Promise<MyGoogleAuth> };

  constructor(connection: Connection) {
    this.connection = connection as GoogleConnection;
    this.auth = this.googleAuth();
  }

  private googleAuth() {
    const credentials = this.connection.data;

    const getGoogleAuth = async () => {
      const myGoogleAuth = new MyGoogleAuth(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_SECRET!,
        `${getBaseUrl()}/providers/google`
      );
      myGoogleAuth.setCredentials(credentials);
      return myGoogleAuth;
    };

    const refreshAccessToken = async (
      myGoogleAuth: Awaited<ReturnType<typeof getGoogleAuth>>
    ) => {
      try {
        const fetchTokens = await myGoogleAuth.refreshToken(
          credentials.refresh_token
        );
        const parsed = googleCredentialSchema.parse({
          ...credentials,
          ...fetchTokens.tokens,
        });
        await db
          .update(schema.connections)
          .set({
            data: parsed,
            invalid: false,
            error: null,
          })
          .where(eq(schema.connections.id, this.connection.id));

        myGoogleAuth.setCredentials(fetchTokens.tokens);
      } catch (error) {
        await db
          .update(schema.connections)
          .set({
            invalid: true,
            error: {
              message: (error as Error)?.message ?? "Token refresh error",
            },
          })
          .where(eq(schema.connections.id, this.connection.id));
      }
      return myGoogleAuth;
    };

    return {
      getToken: async () => {
        const myGoogleAuth = await getGoogleAuth();
        const isExpired = () => myGoogleAuth.isTokenExpiring();
        return !isExpired()
          ? Promise.resolve(myGoogleAuth)
          : refreshAccessToken(myGoogleAuth);
      },
    };
  }

  async authedCalendar() {
    const myGoogleAuth = await this.auth.getToken();
    const calendar = google.calendar({
      version: "v3",
      auth: myGoogleAuth,
    });
    return calendar;
  }

  async listCalendars() {
    const calendar = await this.authedCalendar();
    const list = await calendar.calendarList.list({
      fields: "items(id,summary,primary,accessRole)",
    });
    const { items } = list.data;
    if (!items) return [];

    const calendars = items.map((item) => ({
      external_id: item.id!,
      enabled: item.primary === true,
      name: item.summary ?? item.id ?? "Google",
      data: {
        ...item,
      },
    }));

    return calendars;
  }

  async getCalendar(_id: string | null) {
    return {} as Calendar;
  }

  async getCalendarTimezone(calendarId: string): Promise<string | null> {
    const calendar = await this.authedCalendar();
    const instance = await calendar.calendarList.get({
      calendarId,
    });
    return instance.data?.timeZone ?? null;
  }

  async getEvents(
    calendarId: string,
    filters?: Record<string, any>
  ): Promise<CalendarEvent[]> {
    const calendar = await this.authedCalendar();

    const events = await calendar.events.list({
      calendarId,
      timeMin: filters?.start,
      timeMax: filters?.end,
      singleEvents: true,
      orderBy: "startTime",
    });
    return (events.data.items ?? []).map((event) => this.transformEvent(event));
  }

  async getTodayEvents(calendarId: string): Promise<CalendarEvent[]> {
    const timezone = await this.getCalendarTimezone(calendarId);
    const calendarTime = getLocalTime(timezone ?? "America/New_York");
    const start = calendarTime.startOf("day");
    const end = calendarTime.endOf("day");

    const events = await this.getEvents(calendarId, {
      start: start.toISOString(),
      end: end.toISOString(),
    });
    return events;
  }

  private transformEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    const allDay = !!event.start?.date;
    return {
      id: event.id ?? "",
      title: event.summary ?? "",
      description: event.description ?? "",
      start: event.start?.dateTime ?? event.start?.date ?? "",
      end: event.end?.dateTime ?? event.end?.date ?? "",
      allDay,
    };
  }
}

class MyGoogleAuth extends google.auth.OAuth2 {
  constructor(client_id: string, client_secret: string, redirect_uri: string) {
    super(client_id, client_secret, redirect_uri);
  }

  isTokenExpiring() {
    return super.isTokenExpiring();
  }

  async refreshToken(token: string | null | undefined) {
    return super.refreshToken(token);
  }
}
