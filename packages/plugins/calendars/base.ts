/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../types/ical.d.ts"/>
import ICAL from "ical.js";
import {
  DAVAccount,
  DAVCalendar,
  DAVObject,
  createAccount,
  fetchCalendarObjects,
  fetchCalendars,
  getBasicAuthHeaders,
} from "tsdav";
import { symmetricDecrypt } from "../lib/crypto";
import { Enums, Table } from "@repo/supabase";
import { getLocalTime } from "../lib/dates";

const DEFAULT_CALENDAR_TYPE = "caldav";

export type Base = Omit<Table<"connections">, "data">;

export type Calendar = Pick<
  Table<"calendars">,
  "enabled" | "external_id" | "name"
> & {
  data: Record<string, any>;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
};

export interface ExternalCalendar {
  listCalendars(): Promise<Calendar[]>;
  getCalendar(calendarId: string | null): Promise<Calendar | null>;
  getTodayEvents(calendarId: string): Promise<CalendarEvent[]>;
  getTomorrowEvents(calendarId: string): Promise<CalendarEvent[]>;
  getCalendarTimezone(calendarId: string): Promise<string | null>;
}

export type Providers = Enums<"provider_type">;
export interface Connection<
  R extends Providers = Providers,
  T = Record<string, any> | string,
> extends Base {
  provider: R;
  data: T;
}

/**
 * @see [How to inference class type that implements an interface](https://stackoverflow.com/a/64765554/6297100)
 */
type Class<I, Args extends any[] = any[]> = new (...args: Args) => I;
export type CalendarClass = Class<ExternalCalendar, [Connection]>;

export default abstract class BaseCalendarService implements ExternalCalendar {
  private connection: Connection;
  private credentials: Record<string, string> = {};
  private headers: Record<string, string> = {};
  private url = "";

  constructor(connection: Connection, url?: string) {
    const {
      username,
      password,
      url: credentialURL,
    } = JSON.parse(
      symmetricDecrypt(
        connection.data as string,
        process.env.CALENDSO_ENCRYPTION_KEY!
      )
    );

    this.url = url || credentialURL;

    this.credentials = { username, password };
    this.headers = getBasicAuthHeaders({ username, password });
    this.connection = connection;
  }

  get _connection() {
    return this.connection;
  }

  async listCalendars(): Promise<Calendar[]> {
    try {
      const account = await this.getAccount();
      const calendars = (await fetchCalendars({
        account,
        headers: this.headers,
      })) /** @url https://github.com/natelindev/tsdav/pull/139 */ as (Omit<
        DAVCalendar,
        "displayName"
      > & {
        displayName?: string | Record<string, unknown>;
      })[];

      return calendars.reduce<Calendar[]>((newCalendars, calendar) => {
        if (!calendar.components?.includes("VEVENT")) return newCalendars;
        newCalendars.push({
          external_id: calendar.url,
          /** @url https://github.com/calcom/cal.com/issues/7186 */
          name:
            typeof calendar.displayName === "string"
              ? calendar.displayName
              : "",
          enabled: false,
          data: {
            ...calendar,
          },
        });
        return newCalendars;
      }, []);
    } catch (error) {
      throw error;
    }
  }

  async getCalendar(calendarId: string): Promise<Calendar | null> {
    try {
      const calendars = await this.listCalendars();
      if (!calendars) return null;
      return calendars.find((cal) => cal.external_id === calendarId)!;
    } catch (error) {
      throw error;
    }
  }

  async getCalendarTimezone(calendarId: string): Promise<string | null> {
    const objects = await fetchCalendarObjects({
      calendar: { url: calendarId },
      headers: this.headers,
    });

    for (const object of objects) {
      const jcalData = ICAL.parse(object.data);
      const vcalendar = new ICAL.Component(jcalData);
      const timezone = vcalendar
        .getFirstSubcomponent("vtimezone")
        ?.getFirstPropertyValue<string>("tzid");

      if (timezone) {
        return timezone;
      }
    }

    return null;
  }

  async getEvents(
    calendarId: string,
    filters?: Record<string, any>
  ): Promise<CalendarEvent[]> {
    const objects = await fetchCalendarObjects({
      calendar: {
        url: calendarId,
      },
      timeRange:
        filters?.start && filters?.end
          ? {
              start: filters?.start,
              end: filters?.end,
            }
          : undefined,
      headers: this.headers,
    });

    const events = objects
      .filter((e) => !!e.data)
      .map((object) => this.transformEvent(object));

    return events;
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

  async getTomorrowEvents(calendarId: string): Promise<CalendarEvent[]> {
    const timezone = await this.getCalendarTimezone(calendarId);
    const calendarTime = getLocalTime(timezone ?? "America/New_York");
    const start = calendarTime.add(1, "day").startOf("day");
    const end = calendarTime.add(1, "day").endOf("day");

    const events = await this.getEvents(calendarId, {
      start: start.toISOString(),
      end: end.toISOString(),
    });
    return events;
  }

  private async getAccount(): Promise<DAVAccount> {
    return createAccount({
      account: {
        serverUrl: this.url,
        accountType: DEFAULT_CALENDAR_TYPE,
        credentials: this.credentials,
      },
      headers: this.headers,
    });
  }

  private transformEvent(object: DAVObject): CalendarEvent {
    const jcalData = ICAL.parse(object.data);
    const vcalendar = new ICAL.Component(jcalData);

    const vevent = vcalendar.getFirstSubcomponent("vevent");
    const event = new ICAL.Event(vevent);

    // const calendarTimezone =
    //   vcalendar
    //     .getFirstSubcomponent("vtimezone")
    //     ?.getFirstPropertyValue<string>("tzid") || "";

    return {
      id: event.uid,
      title: event.summary,
      description: event.description,
      start: event.startDate.toString(),
      end: event.endDate.toString(),
      allDay: false,
    };
  }
}
