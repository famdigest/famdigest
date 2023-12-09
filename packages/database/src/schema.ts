import {
  pgTable,
  pgSchema,
  index,
  pgEnum,
  uuid,
  json,
  timestamp,
  varchar,
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
  primaryKey,
  time,
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

export const auth = pgSchema("auth");

export const audit_log_entries = auth.table(
  "audit_log_entries",
  {
    instance_id: uuid("instance_id"),
    id: uuid("id").primaryKey().notNull(),
    payload: json("payload"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    ip_address: varchar("ip_address", { length: 64 })
      .default(sql`''::character varying`)
      .notNull(),
  },
  (table) => {
    return {
      audit_logs_instance_id_idx: index("audit_logs_instance_id_idx").on(
        table.instance_id
      ),
    };
  }
);

export const refresh_tokens = auth.table(
  "refresh_tokens",
  {
    instance_id: uuid("instance_id"),
    id: bigserial("id", { mode: "bigint" }).primaryKey().notNull(),
    token: varchar("token", { length: 255 }),
    user_id: varchar("user_id", { length: 255 }),
    revoked: boolean("revoked"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    parent: varchar("parent", { length: 255 }),
    session_id: uuid("session_id").references(() => sessions.id, {
      onDelete: "cascade",
    }),
  },
  (table) => {
    return {
      instance_id_idx: index("refresh_tokens_instance_id_idx").on(
        table.instance_id
      ),
      instance_id_user_id_idx: index(
        "refresh_tokens_instance_id_user_id_idx"
      ).on(table.instance_id, table.user_id),
      parent_idx: index("refresh_tokens_parent_idx").on(table.parent),
      session_id_revoked_idx: index("refresh_tokens_session_id_revoked_idx").on(
        table.revoked,
        table.session_id
      ),
      updated_at_idx: index("refresh_tokens_updated_at_idx").on(
        table.updated_at
      ),
      refresh_tokens_token_unique: unique("refresh_tokens_token_unique").on(
        table.token
      ),
    };
  }
);

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

export const instances = auth.table("instances", {
  id: uuid("id").primaryKey().notNull(),
  uuid: uuid("uuid"),
  raw_base_config: text("raw_base_config"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const schema_migrations = auth.table("schema_migrations", {
  version: varchar("version", { length: 255 }).primaryKey().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().notNull(),
  data: jsonb("data"),
  expires: timestamp("expires", { withTimezone: true, mode: "string" }).default(
    sql`timezone('utc'::text, now())`
  ),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
});

export const mfa_factors = auth.table(
  "mfa_factors",
  {
    id: uuid("id").primaryKey().notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    friendly_name: text("friendly_name"),
    // TODO: failed to parse database type 'auth.factor_type'
    factor_type: factor_type("factor_type").notNull(),
    // TODO: failed to parse database type 'auth.factor_status'
    status: factor_status("status").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    secret: text("secret"),
  },
  (table) => {
    return {
      user_friendly_name_unique: uniqueIndex(
        "mfa_factors_user_friendly_name_unique"
      ).on(table.user_id, table.friendly_name),
      factor_id_created_at_idx: index("factor_id_created_at_idx").on(
        table.user_id,
        table.created_at
      ),
      user_id_idx: index("mfa_factors_user_id_idx").on(table.user_id),
    };
  }
);

export const mfa_challenges = auth.table(
  "mfa_challenges",
  {
    id: uuid("id").primaryKey().notNull(),
    factor_id: uuid("factor_id")
      .notNull()
      .references(() => mfa_factors.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    verified_at: timestamp("verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    ip_address: inet("ip_address").notNull(),
  },
  (table) => {
    return {
      mfa_challenge_created_at_idx: index("mfa_challenge_created_at_idx").on(
        table.created_at
      ),
    };
  }
);

export const mfa_amr_claims = auth.table(
  "mfa_amr_claims",
  {
    session_id: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    authentication_method: text("authentication_method").notNull(),
    id: uuid("id").primaryKey().notNull(),
  },
  (table) => {
    return {
      mfa_amr_claims_session_id_authentication_method_pkey: unique(
        "mfa_amr_claims_session_id_authentication_method_pkey"
      ).on(table.session_id, table.authentication_method),
    };
  }
);

export const sso_providers = auth.table("sso_providers", {
  id: uuid("id").primaryKey().notNull(),
  resource_id: text("resource_id"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const sso_domains = auth.table(
  "sso_domains",
  {
    id: uuid("id").primaryKey().notNull(),
    sso_provider_id: uuid("sso_provider_id")
      .notNull()
      .references(() => sso_providers.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => {
    return {
      sso_provider_id_idx: index("sso_domains_sso_provider_id_idx").on(
        table.sso_provider_id
      ),
    };
  }
);

export const saml_providers = auth.table(
  "saml_providers",
  {
    id: uuid("id").primaryKey().notNull(),
    sso_provider_id: uuid("sso_provider_id")
      .notNull()
      .references(() => sso_providers.id, { onDelete: "cascade" }),
    entity_id: text("entity_id").notNull(),
    metadata_xml: text("metadata_xml").notNull(),
    metadata_url: text("metadata_url"),
    attribute_mapping: jsonb("attribute_mapping"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => {
    return {
      sso_provider_id_idx: index("saml_providers_sso_provider_id_idx").on(
        table.sso_provider_id
      ),
      saml_providers_entity_id_key: unique("saml_providers_entity_id_key").on(
        table.entity_id
      ),
    };
  }
);

export const saml_relay_states = auth.table(
  "saml_relay_states",
  {
    id: uuid("id").primaryKey().notNull(),
    sso_provider_id: uuid("sso_provider_id")
      .notNull()
      .references(() => sso_providers.id, { onDelete: "cascade" }),
    request_id: text("request_id").notNull(),
    for_email: text("for_email"),
    redirect_to: text("redirect_to"),
    from_ip_address: inet("from_ip_address"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    flow_state_id: uuid("flow_state_id").references(() => flow_state.id, {
      onDelete: "cascade",
    }),
  },
  (table) => {
    return {
      sso_provider_id_idx: index("saml_relay_states_sso_provider_id_idx").on(
        table.sso_provider_id
      ),
      for_email_idx: index("saml_relay_states_for_email_idx").on(
        table.for_email
      ),
      created_at_idx: index("saml_relay_states_created_at_idx").on(
        table.created_at
      ),
    };
  }
);

export const flow_state = auth.table(
  "flow_state",
  {
    id: uuid("id").primaryKey().notNull(),
    user_id: uuid("user_id"),
    auth_code: text("auth_code").notNull(),
    // TODO: failed to parse database type 'auth.code_challenge_method'
    code_challenge_method: code_challenge_method(
      "code_challenge_method"
    ).notNull(),
    code_challenge: text("code_challenge").notNull(),
    provider_type: text("provider_type").notNull(),
    provider_access_token: text("provider_access_token"),
    provider_refresh_token: text("provider_refresh_token"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    authentication_method: text("authentication_method").notNull(),
  },
  (table) => {
    return {
      idx_auth_code: index("idx_auth_code").on(table.auth_code),
      idx_user_id_auth_method: index("idx_user_id_auth_method").on(
        table.user_id,
        table.authentication_method
      ),
      created_at_idx: index("flow_state_created_at_idx").on(table.created_at),
    };
  }
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().notNull(),
    full_name: text("full_name"),
    email: text("email"),
    phone: text("phone"),
    avatar_url: text("avatar_url"),
    preferences: jsonb("preferences").default({ theme: "light" }).notNull(),
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
      profiles_phone_key: unique("profiles_phone_key").on(table.phone),
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
  },
  (table) => {
    return {
      invitations_token_key: unique("invitations_token_key").on(table.token),
    };
  }
);

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

export const connections = pgTable("connections", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id),
  email: text("email").notNull(),
  provider: provider_type("provider").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  data: jsonb("data"),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
});

export const digests = pgTable("digests", {
  id: uuid("id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => profiles.id),
  full_name: text("full_name").notNull(),
  phone: text("phone").notNull(),
  opt_in: boolean("opt_in").default(false).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  timezone: text("timezone").notNull(),
  notify_on: time("notify_on", {
    withTimezone: true,
  }).notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`timezone('utc'::text, now())`),
});

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

export const identities = auth.table(
  "identities",
  {
    id: text("id").notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    identity_data: jsonb("identity_data").notNull(),
    provider: text("provider").notNull(),
    last_sign_in_at: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    email: text("email"),
  },
  (table) => {
    return {
      user_id_idx: index("identities_user_id_idx").on(table.user_id),
      email_idx: index("identities_email_idx").on(table.email),
      identities_pkey: primaryKey({
        columns: [table.id, table.provider],
        name: "identities_pkey",
      }),
    };
  }
);
