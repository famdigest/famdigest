import {
  pgTable,
  pgSchema,
  index,
  pgEnum,
  uuid,
  json,
  timestamp,
  varchar,
  foreignKey,
  unique,
  bigserial,
  boolean,
  uniqueIndex,
  jsonb,
  text,
  smallint,
  inet,
  bigint,
  integer,
  time,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const key_status = pgEnum("key_status", [
  "expired",
  "invalid",
  "valid",
  "default",
]);
export const key_type = pgEnum("key_type", [
  "stream_xchacha20",
  "secretstream",
  "secretbox",
  "kdf",
  "generichash",
  "shorthash",
  "auth",
  "hmacsha256",
  "hmacsha512",
  "aead-det",
  "aead-ietf",
]);
export const request_status = pgEnum("request_status", [
  "ERROR",
  "SUCCESS",
  "PENDING",
]);
export const factor_type = pgEnum("factor_type", ["webauthn", "totp"]);
export const factor_status = pgEnum("factor_status", [
  "verified",
  "unverified",
]);
export const aal_level = pgEnum("aal_level", ["aal3", "aal2", "aal1"]);
export const code_challenge_method = pgEnum("code_challenge_method", [
  "plain",
  "s256",
]);
export const workspace_role = pgEnum("workspace_role", ["member", "owner"]);
export const billing_providers = pgEnum("billing_providers", ["stripe"]);
export const pricing_type = pgEnum("pricing_type", ["recurring", "one_time"]);
export const pricing_plan_interval = pgEnum("pricing_plan_interval", [
  "year",
  "month",
  "week",
  "day",
]);
export const subscription_status = pgEnum("subscription_status", [
  "paused",
  "unpaid",
  "past_due",
  "incomplete_expired",
  "incomplete",
  "canceled",
  "active",
  "trialing",
]);
export const invitation_type = pgEnum("invitation_type", [
  "24-hour",
  "one-time",
]);
export const provider_type = pgEnum("provider_type", [
  "office365",
  "apple",
  "hotmail",
  "live",
  "icloud",
  "protonmail",
  "zoho",
  "aol",
  "yahoo",
  "outlook",
  "google",
]);
export const message_role = pgEnum("message_role", ["user", "assistant"]);
export const event_preference = pgEnum("event_preference", [
  "next-day",
  "same-day",
]);
export const request_type = pgEnum("request_type", ["calendar", "digest"]);

export const auth = pgSchema("auth");

export const users = auth.table(
  "users",
  {
    instance_id: uuid("instance_id"),
    id: uuid("id").primaryKey().notNull(),
    aud: varchar("aud", { length: 255 }),
    role: varchar("role", { length: 255 }),
    email: varchar("email", { length: 255 }),
    encrypted_password: varchar("encrypted_password", { length: 255 }),
    email_confirmed_at: timestamp("email_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    invited_at: timestamp("invited_at", { withTimezone: true, mode: "string" }),
    confirmation_token: varchar("confirmation_token", { length: 255 }),
    confirmation_sent_at: timestamp("confirmation_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    recovery_token: varchar("recovery_token", { length: 255 }),
    recovery_sent_at: timestamp("recovery_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    email_change_token_new: varchar("email_change_token_new", { length: 255 }),
    email_change: varchar("email_change", { length: 255 }),
    email_change_sent_at: timestamp("email_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    last_sign_in_at: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    raw_app_meta_data: jsonb("raw_app_meta_data"),
    raw_user_meta_data: jsonb("raw_user_meta_data"),
    is_super_admin: boolean("is_super_admin"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    phone: text("phone").default(sql`NULL::character varying`),
    phone_confirmed_at: timestamp("phone_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    phone_change: text("phone_change").default(sql`''::character varying`),
    phone_change_token: varchar("phone_change_token", { length: 255 }).default(
      sql`''::character varying`
    ),
    phone_change_sent_at: timestamp("phone_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    confirmed_at: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    email_change_token_current: varchar("email_change_token_current", {
      length: 255,
    }).default(sql`''::character varying`),
    email_change_confirm_status: smallint(
      "email_change_confirm_status"
    ).default(0),
    banned_until: timestamp("banned_until", {
      withTimezone: true,
      mode: "string",
    }),
    reauthentication_token: varchar("reauthentication_token", {
      length: 255,
    }).default(sql`''::character varying`),
    reauthentication_sent_at: timestamp("reauthentication_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    is_sso_user: boolean("is_sso_user").default(false).notNull(),
    deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => {
    return {
      instance_id_idx: index("users_instance_id_idx").on(table.instance_id),
      instance_id_email_idx: index("users_instance_id_email_idx").on(
        table.instance_id
      ),
      confirmation_token_idx: uniqueIndex("confirmation_token_idx").on(
        table.confirmation_token
      ),
      recovery_token_idx: uniqueIndex("recovery_token_idx").on(
        table.recovery_token
      ),
      email_change_token_current_idx: uniqueIndex(
        "email_change_token_current_idx"
      ).on(table.email_change_token_current),
      email_change_token_new_idx: uniqueIndex("email_change_token_new_idx").on(
        table.email_change_token_new
      ),
      reauthentication_token_idx: uniqueIndex("reauthentication_token_idx").on(
        table.reauthentication_token
      ),
      email_partial_key: uniqueIndex("users_email_partial_key").on(table.email),
      users_phone_key: unique("users_phone_key").on(table.phone),
    };
  }
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().notNull(),
  data: jsonb("data"),
  expires: timestamp("expires", { withTimezone: true, mode: "string" }).default(
    sql`timezone('utc'::text, now())`
  ),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

type Preferences = {
  theme: "light" | "dark" | "system";
  notify_on?: string;
  timezone?: string;
  event_preferences?: typeof event_preference;
};
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().notNull(),
    full_name: text("full_name"),
    email: text("email"),
    phone: text("phone"),
    avatar_url: text("avatar_url"),
    preferences: jsonb("preferences")
      .default({ theme: "light" })
      .notNull()
      .$type<Preferences>(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => {
    return {
      profiles_email_key: unique("profiles_email_key").on(table.email),
    };
  }
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  settings: jsonb("settings"),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  access_code: text("access_code")
    .default(sql`SUBSTRING((gen_random_uuid())::text FROM 1 FOR 8)`)
    .notNull(),
});

export const billing_customers = pgTable("billing_customers", {
  workspace_id: uuid("workspace_id")
    .primaryKey()
    .notNull()
    .references(() => workspaces.id),
  customer_id: text("customer_id"),
  email: text("email"),
  active: boolean("active"),
  provider: billing_providers("provider").default("stripe"),
});

export const billing_products = pgTable("billing_products", {
  id: text("id").primaryKey().notNull(),
  active: boolean("active"),
  name: text("name"),
  description: text("description"),
  image: text("image"),
  metadata: jsonb("metadata"),
  provider: billing_providers("provider").default("stripe"),
});

export const billing_prices = pgTable("billing_prices", {
  id: text("id").primaryKey().notNull(),
  billing_product_id: text("billing_product_id").references(
    () => billing_products.id
  ),
  active: boolean("active"),
  description: text("description"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  unit_amount: bigint("unit_amount", { mode: "number" }),
  currency: text("currency"),
  type: pricing_type("type"),
  interval: pricing_plan_interval("interval"),
  interval_count: integer("interval_count"),
  trial_period_days: integer("trial_period_days"),
  metadata: jsonb("metadata"),
  provider: billing_providers("provider").default("stripe"),
});

export const billing_subscriptions = pgTable("billing_subscriptions", {
  id: text("id").primaryKey().notNull(),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  status: subscription_status("status"),
  metadata: jsonb("metadata"),
  price_id: text("price_id").references(() => billing_prices.id),
  quantity: integer("quantity"),
  cancel_at_period_end: boolean("cancel_at_period_end"),
  created: timestamp("created", { withTimezone: true, mode: "string" })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  current_period_start: timestamp("current_period_start", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  current_period_end: timestamp("current_period_end", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  ended_at: timestamp("ended_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  cancel_at: timestamp("cancel_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  canceled_at: timestamp("canceled_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  trial_start: timestamp("trial_start", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  trial_end: timestamp("trial_end", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  provider: billing_providers("provider").default("stripe"),
});

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id")
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    role: workspace_role("role").notNull(),
    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    token: text("token")
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    email: text("email").notNull(),
    invite_url: text("invite_url"),
    invited_by_user_id: uuid("invited_by_user_id")
      .notNull()
      .references(() => profiles.id),
    workspace_name: text("workspace_name"),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    invitation_type: invitation_type("invitation_type").default("one-time"),
    request_type: request_type("request_type").default("calendar"),
  },
  (table) => {
    return {
      invitations_token_key: unique("invitations_token_key").on(table.token),
    };
  }
);

export const digests = pgTable("digests", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  full_name: text("full_name").notNull(),
  phone: text("phone").notNull(),
  opt_in: boolean("opt_in").default(false).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  timezone: text("timezone").notNull(),
  notify_on: time("notify_on", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
});

export const calendars = pgTable("calendars", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  connection_id: uuid("connection_id")
    .notNull()
    .references(() => connections.id, { onDelete: "cascade" }),
  external_id: text("external_id").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  data: jsonb("data").$type<Record<string, any>>(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  name: text("name"),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  full_name: text("full_name").notNull(),
  phone: text("phone").notNull(),
  opt_in: boolean("opt_in").default(false).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  timezone: text("timezone").notNull(),
  notify_on: time("notify_on", { withTimezone: true }).notNull(),
  event_preferences: event_preference("event_preferences")
    .default("same-day")
    .notNull(),
  access_code: text("access_code")
    .default(sql`SUBSTRING((gen_random_uuid())::text FROM 1 FOR 8)`)
    .notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
});

export const subscription_logs = pgTable("subscription_logs", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  subscription_id: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  external_id: text("external_id").notNull(),
  message: text("message").notNull(),
  segments: integer("segments").notNull(),
  data: jsonb("data").$type<Record<string, any>>(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
});

export const connections = pgTable("connections", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  provider: provider_type("provider").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  data: jsonb("data").$type<Record<string, any>>(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  invalid: boolean("invalid").default(false),
  error: jsonb("error").$type<Record<string, any>>(),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
});

export const messages = pgTable("messages", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  digest_id: uuid("digest_id")
    .notNull()
    .references(() => digests.id, { onDelete: "cascade" }),
  external_id: text("external_id").notNull(),
  message: text("message").notNull(),
  segments: integer("segments").notNull(),
  role: message_role("role").notNull(),
  data: jsonb("data").$type<Record<string, any>>(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  tags: jsonb("tags").default([]),
  workspace_id: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
});

export const subscription_calendars = pgTable(
  "subscription_calendars",
  {
    subscription_id: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    calendar_id: uuid("calendar_id")
      .notNull()
      .references(() => calendars.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      subscription_calendar_pkey: primaryKey({
        columns: [table.subscription_id, table.calendar_id],
        name: "subscription_calendar_pkey",
      }),
    };
  }
);

export const workspace_users = pgTable(
  "workspace_users",
  {
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    role: workspace_role("role").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
  },
  (table) => {
    return {
      workspace_user_pkey: primaryKey({
        columns: [table.user_id, table.workspace_id],
        name: "workspace_user_pkey",
      }),
    };
  }
);
