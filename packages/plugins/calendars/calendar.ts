import { Table } from "@repo/supabase";
import { GoogleCalendarService, type GoogleConnection } from "./google";
import {
  Office365CalendarService,
  type Office365Connection,
} from "./office365calendar";
import { AppleCalendarService, type AppleConnection } from "./applecalendar";

export function getCalendarProviderClass(connection: Table<"connections">) {
  switch (connection.provider) {
    case "apple":
      return new AppleCalendarService(connection as AppleConnection);
    case "google":
      return new GoogleCalendarService(connection as GoogleConnection);
    case "office365":
      return new Office365CalendarService(connection as Office365Connection);
    default:
      throw new Error("Provider not implemented");
  }
}
