import { getUtc } from "../../lib/dates";
import { Calendar, ExternalCalendar, CalendarEvent, Connection } from "../base";
import { GoogleConnection } from "./types";
import { google, type calendar_v3 } from "googleapis";
import { getBaseUrl } from "../../lib/base-url";
import { db, eq, schema } from "@repo/database";

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
        await db
          .update(schema.connections)
          .set({
            data: fetchTokens.tokens,
          })
          .where(eq(schema.connections.id, this.connection.id));

        myGoogleAuth.setCredentials(fetchTokens.tokens);
      } catch (error) {
        // @todo send notification to user
        await db
          .update(schema.connections)
          .set({
            data: { invalid: true },
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
    const list = await calendar.calendarList.list();
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

  async getEvents(
    calendarId: string,
    filters?: Record<string, any>
  ): Promise<CalendarEvent[]> {
    const calendar = await this.authedCalendar();
    const events = await calendar.events.list({
      calendarId,
      timeMin: filters?.start,
      timeMax: filters?.end,
    });
    return (events.data.items ?? []).map((event) => this.transformEvent(event));
  }

  async getTodayEvents(calendarId: string): Promise<CalendarEvent[]> {
    const utc = getUtc();
    const start = utc.startOf("day");
    const end = utc.endOf("day");

    const events = await this.getEvents(calendarId, {
      start: start.format("YYYY-MM-DDTHH:mm:ssZ"),
      end: end.format("YYYY-MM-DDTHH:mm:ssZ"),
    });
    return events;
  }

  private transformEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    return {
      id: event.id ?? "",
      title: event.summary ?? "",
      description: event.description ?? "",
      start: event.start?.dateTime ?? "",
      end: event.end?.dateTime ?? "",
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
