import { Json, Table } from "@repo/supabase";
import { Credentials } from "google-auth-library";
import { getCalendarList } from "./google.server";

type Base = Omit<Table<"connections">, "data">;
type Calendar = Pick<Table<"calendars">, "external_id"> & {
  data: Record<string, any>;
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
}
