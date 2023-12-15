import { Table } from "@repo/supabase";
import { GoogleCalendarService } from "./google/CalendarService";
import { GoogleConnection, Office365Connection } from "./types";
import { Office365CalendarService } from "./office365calendar/CalendarService";

export function getCalendarProviderClass(connection: Table<"connections">) {
  switch (connection.provider) {
    case "google":
      return new GoogleCalendarService(connection as GoogleConnection);
    case "outlook":
      return new Office365CalendarService(connection as Office365Connection);
    default:
      throw new Error("Provider not implemented");
  }
}
