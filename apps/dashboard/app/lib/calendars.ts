import { Json, Table } from "@repo/supabase";
import { Credentials } from "google-auth-library";
import { getCalendarList, getEvents } from "./google.server";
import { getUtc } from "./dates";
import { calendar_v3 } from "googleapis";

type Base = Omit<Table<"connections">, "data">;
type Calendar = Pick<Table<"calendars">, "external_id"> & {
  data: Record<string, any>;
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
};

interface GoogleConnection extends Base {
  provider: "google";
  data: Credentials;
}
interface OutlookConnection extends Base {
  provider: "outlook";
  data: Record<string, any>;
}

type Connection = GoogleConnection | OutlookConnection;

export abstract class RemoteCalendarService {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  abstract listCalendars(): Promise<Calendar[]>;

  abstract getCalendar(id: string | null): Promise<Calendar>;

  abstract getEvents(
    calendarId: string,
    filters?: Record<string, any>
  ): Promise<CalendarEvent[]>;

  abstract getTodayEvents(calendarId: string): Promise<CalendarEvent[]>;

  static getProviderClass(connection: Table<"connections">) {
    switch (connection.provider) {
      case "google":
        return new GoogleCalendarService(connection as GoogleConnection);
      case "outlook":
        return new OutlookCalendarService(connection as OutlookConnection);
      default:
        throw new Error("Provider not implemented");
    }
  }
}

export class GoogleCalendarService extends RemoteCalendarService {
  constructor(connection: GoogleConnection) {
    super(connection);
  }

  async listCalendars() {
    const list = await getCalendarList(this.connection.data);
    const { items } = list.data;
    if (!items) return [];

    const calendars = items.map((item) => ({
      external_id: item.id!,
      data: {
        ...item,
      },
    }));

    return calendars;
  }

  async getCalendar(id: string | null) {
    return {} as Calendar;
  }

  async getEvents(
    calendarId: string,
    filters?: Record<string, any>
  ): Promise<CalendarEvent[]> {
    const events = await getEvents({
      calendarId,
      tokens: this.connection.data,
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

export class OutlookCalendarService extends RemoteCalendarService {
  constructor(connection: OutlookConnection) {
    super(connection);
  }

  async listCalendars() {
    return [];
  }

  async getCalendar(id: string | null) {
    return {} as Calendar;
  }

  async getEvents(
    calendarId: string,
    filters?: Record<string, any>
  ): Promise<CalendarEvent[]> {
    const events = await getEvents({
      calendarId,
      tokens: this.connection.data,
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
