import { InferSelectModel } from "drizzle-orm";
import * as schema from "./schema";

export type Profile = InferSelectModel<typeof schema.profiles>;
export type Workspace = InferSelectModel<typeof schema.workspaces>;

/**
 * Connection + Calendars
 */
export type Connection = InferSelectModel<typeof schema.connections>;
export type Calendar = InferSelectModel<typeof schema.calendars>;
export type ConnectionWithCalendars = Connection & {
  calendars: Calendar[];
};

/**
 * Subscribers
 */
export type Subscriber = InferSelectModel<typeof schema.subscriptions>;
export type SubscriptionLogs = InferSelectModel<
  typeof schema.subscription_logs
>;
export type SubscriberCalendars = InferSelectModel<
  typeof schema.subscription_calendars
> & {
  calendar: Calendar;
};
export type SubscriberWithRelations = Subscriber & {
  subscription_calendars: SubscriberCalendars[];
};
