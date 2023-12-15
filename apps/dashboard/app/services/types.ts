import { Table } from "@repo/supabase";
import { Credentials } from "google-auth-library";
import { z } from "zod";

export type Base = Omit<Table<"connections">, "data">;
export type Calendar = Pick<Table<"calendars">, "external_id"> & {
  data: Record<string, any>;
};

export interface GoogleConnection extends Base {
  provider: "google";
  data: Credentials;
}

export interface Office365Connection extends Base {
  provider: "outlook";
  data: {
    refresh_token?: string | null;
    access_token: string;
    expires_in: number;
  };
}

export type Connection = GoogleConnection | Office365Connection;

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
};

export interface ExternalCalendar {
  listCalendars(event?: CalendarEvent): Promise<Calendar[]>;
  getCalendar(id: string | null): Promise<Calendar>;
  getTodayEvents(calendarId: string): Promise<CalendarEvent[]>;
}

/**
 * @see [How to inference class type that implements an interface](https://stackoverflow.com/a/64765554/6297100)
 */
type Class<I, Args extends any[] = any[]> = new (...args: Args) => I;
export type CalendarClass = Class<ExternalCalendar, [Connection]>;
