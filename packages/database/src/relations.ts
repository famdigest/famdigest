import { relations } from "drizzle-orm";
import {
  connections,
  calendars,
  profiles,
  workspaces,
  workspace_users,
  invitations,
  digests,
  messages,
  billing_customers,
  billing_products,
  billing_prices,
  billing_subscriptions,
  subscriptions,
  subscription_calendars,
  subscription_logs,
} from "./schema";

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  connections: many(connections),
  calendars: many(calendars),
  workspaces: one(workspaces, {
    fields: [profiles.id],
    references: [workspaces.owner_id],
  }),
  invitations: many(invitations),
  workspace_users: many(workspace_users),
}));

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  owner: one(profiles, {
    fields: [workspaces.owner_id],
    references: [profiles.id],
  }),
  invitations: many(invitations),
  connections: many(connections),
  messages: many(messages),
  workspace_users: many(workspace_users),
  billing_customers: many(billing_customers),
  billing_subscriptions: many(billing_subscriptions),
}));

export const billingCustomersRelations = relations(
  billing_customers,
  ({ one }) => ({
    workspaces: one(workspaces, {
      fields: [billing_customers.workspace_id],
      references: [workspaces.id],
    }),
  })
);

export const billingProductsRelations = relations(
  billing_products,
  ({ many }) => ({
    billing_prices: many(billing_prices),
  })
);

export const billingPricesRelations = relations(billing_prices, ({ one }) => ({
  billing_product: one(billing_products, {
    fields: [billing_prices.billing_product_id],
    references: [billing_products.id],
  }),
}));

export const billingSubscriptionsRelations = relations(
  billing_subscriptions,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [billing_subscriptions.workspace_id],
      references: [workspaces.id],
    }),
    billing_price: one(billing_prices, {
      fields: [billing_subscriptions.price_id],
      references: [billing_prices.id],
    }),
  })
);

export const invitationsRelations = relations(invitations, ({ many, one }) => ({
  workspaces: one(workspaces, {
    fields: [invitations.workspace_id],
    references: [workspaces.id],
  }),
  invited_by: one(profiles, {
    fields: [invitations.invited_by_user_id],
    references: [profiles.id],
  }),
}));

export const profilesToWorkspacesRelations = relations(
  workspace_users,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspace_users.workspace_id],
      references: [workspaces.id],
    }),
    profile: one(profiles, {
      fields: [workspace_users.user_id],
      references: [profiles.id],
    }),
  })
);

export const connectionsRelations = relations(connections, ({ many, one }) => ({
  calendars: many(calendars),
  profile: one(profiles, {
    fields: [connections.owner_id],
    references: [profiles.id],
  }),
  workspace: one(workspaces, {
    fields: [connections.workspace_id],
    references: [workspaces.id],
  }),
}));

export const calendarsRelations = relations(calendars, ({ one, many }) => ({
  connection: one(connections, {
    fields: [calendars.connection_id],
    references: [connections.id],
  }),
  profile: one(profiles, {
    fields: [calendars.owner_id],
    references: [profiles.id],
  }),
}));

export const digestsRelations = relations(digests, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [digests.owner_id],
    references: [profiles.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  profile: one(profiles, {
    fields: [messages.owner_id],
    references: [profiles.id],
  }),
  digest: one(digests, {
    fields: [messages.digest_id],
    references: [digests.id],
  }),
  workspace: one(workspaces, {
    fields: [messages.workspace_id],
    references: [workspaces.id],
  }),
}));

export const subscriptionRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    owner: one(profiles, {
      fields: [subscriptions.owner_id],
      references: [profiles.id],
    }),
    subscriber: one(profiles, {
      fields: [subscriptions.user_id],
      references: [profiles.id],
    }),
    workspace: one(workspaces, {
      fields: [subscriptions.workspace_id],
      references: [workspaces.id],
    }),
    subscription_calendars: many(subscription_calendars),
    subscription_logs: many(subscription_logs),
  })
);

export const subscriptionCalendarsRelations = relations(
  subscription_calendars,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [subscription_calendars.subscription_id],
      references: [subscriptions.id],
    }),
    calendar: one(calendars, {
      fields: [subscription_calendars.calendar_id],
      references: [calendars.id],
    }),
  })
);

export const subscriptionLogsRelations = relations(
  subscription_logs,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [subscription_logs.subscription_id],
      references: [subscriptions.id],
    }),
  })
);
