-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "auth";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "key_status" AS ENUM('expired', 'invalid', 'valid', 'default');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "key_type" AS ENUM('stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead-det', 'aead-ietf');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "request_status" AS ENUM('ERROR', 'SUCCESS', 'PENDING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_type" AS ENUM('webauthn', 'totp');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_status" AS ENUM('verified', 'unverified');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "aal_level" AS ENUM('aal3', 'aal2', 'aal1');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "code_challenge_method" AS ENUM('plain', 's256');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "workspace_role" AS ENUM('member', 'owner');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "billing_providers" AS ENUM('stripe');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "pricing_type" AS ENUM('recurring', 'one_time');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "pricing_plan_interval" AS ENUM('year', 'month', 'week', 'day');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "subscription_status" AS ENUM('paused', 'unpaid', 'past_due', 'incomplete_expired', 'incomplete', 'canceled', 'active', 'trialing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "invitation_type" AS ENUM('24-hour', 'one-time');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
	"instance_id" uuid,
	"id" uuid PRIMARY KEY NOT NULL,
	"payload" json,
	"created_at" timestamp with time zone,
	"ip_address" varchar(64) DEFAULT ''::character varying NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
	"instance_id" uuid,
	"id" bigserial PRIMARY KEY NOT NULL,
	"token" varchar(255),
	"user_id" varchar(255),
	"revoked" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"parent" varchar(255),
	"session_id" uuid,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."users" (
	"instance_id" uuid,
	"id" uuid PRIMARY KEY NOT NULL,
	"aud" varchar(255),
	"role" varchar(255),
	"email" varchar(255),
	"encrypted_password" varchar(255),
	"email_confirmed_at" timestamp with time zone,
	"invited_at" timestamp with time zone,
	"confirmation_token" varchar(255),
	"confirmation_sent_at" timestamp with time zone,
	"recovery_token" varchar(255),
	"recovery_sent_at" timestamp with time zone,
	"email_change_token_new" varchar(255),
	"email_change" varchar(255),
	"email_change_sent_at" timestamp with time zone,
	"last_sign_in_at" timestamp with time zone,
	"raw_app_meta_data" jsonb,
	"raw_user_meta_data" jsonb,
	"is_super_admin" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"phone" text DEFAULT NULL::character varying,
	"phone_confirmed_at" timestamp with time zone,
	"phone_change" text DEFAULT ''::character varying,
	"phone_change_token" varchar(255) DEFAULT ''::character varying,
	"phone_change_sent_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"email_change_token_current" varchar(255) DEFAULT ''::character varying,
	"email_change_confirm_status" smallint DEFAULT 0,
	"banned_until" timestamp with time zone,
	"reauthentication_token" varchar(255) DEFAULT ''::character varying,
	"reauthentication_sent_at" timestamp with time zone,
	"is_sso_user" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_phone_key" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."instances" (
	"id" uuid PRIMARY KEY NOT NULL,
	"uuid" uuid,
	"raw_base_config" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" (
	"version" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb,
	"expires" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"friendly_name" text,
	"factor_type" "auth.factor_type" NOT NULL,
	"status" "auth.factor_status" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"secret" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"factor_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"ip_address" "inet" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
	"session_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"authentication_method" text NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE("session_id","authentication_method")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"resource_id" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sso_provider_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sso_provider_id" uuid NOT NULL,
	"entity_id" text NOT NULL,
	"metadata_xml" text NOT NULL,
	"metadata_url" text,
	"attribute_mapping" jsonb,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "saml_providers_entity_id_key" UNIQUE("entity_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sso_provider_id" uuid NOT NULL,
	"request_id" text NOT NULL,
	"for_email" text,
	"redirect_to" text,
	"from_ip_address" "inet",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"flow_state_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"auth_code" text NOT NULL,
	"code_challenge_method" "auth.code_challenge_method" NOT NULL,
	"code_challenge" text NOT NULL,
	"provider_type" text NOT NULL,
	"provider_access_token" text,
	"provider_refresh_token" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"authentication_method" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" text,
	"avatar_url" text,
	"preferences" jsonb DEFAULT '{"theme":"light"}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT "profiles_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_customers" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"customer_id" text,
	"email" text,
	"active" boolean,
	"provider" "billing_providers" DEFAULT 'stripe'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_products" (
	"id" text PRIMARY KEY NOT NULL,
	"active" boolean,
	"name" text,
	"description" text,
	"image" text,
	"metadata" jsonb,
	"provider" "billing_providers" DEFAULT 'stripe'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"role" "workspace_role" NOT NULL,
	"workspace_id" uuid NOT NULL,
	"token" text DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"invite_url" text,
	"invited_by_user_id" uuid NOT NULL,
	"workspace_name" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"invitation_type" "invitation_type" DEFAULT 'one-time',
	CONSTRAINT "invitations_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"billing_product_id" text,
	"active" boolean,
	"description" text,
	"unit_amount" bigint,
	"currency" text,
	"type" "pricing_type",
	"interval" "pricing_plan_interval",
	"interval_count" integer,
	"trial_period_days" integer,
	"metadata" jsonb,
	"provider" "billing_providers" DEFAULT 'stripe'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"status" "subscription_status",
	"metadata" jsonb,
	"price_id" text,
	"quantity" integer,
	"cancel_at_period_end" boolean,
	"created" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"current_period_start" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"current_period_end" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"ended_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"cancel_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"canceled_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"trial_start" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"trial_end" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"provider" "billing_providers" DEFAULT 'stripe'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_users" (
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" "workspace_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT workspace_user_pkey PRIMARY KEY("user_id","workspace_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."identities" (
	"id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"identity_data" jsonb NOT NULL,
	"provider" text NOT NULL,
	"last_sign_in_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"email" text,
	CONSTRAINT identities_pkey PRIMARY KEY("id","provider")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" ("instance_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" ("instance_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" ("instance_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" ("parent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" ("revoked","session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_instance_id_idx" ON "auth"."users" ("instance_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_instance_id_email_idx" ON "auth"."users" ("instance_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "confirmation_token_idx" ON "auth"."users" ("confirmation_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recovery_token_idx" ON "auth"."users" ("recovery_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_change_token_current_idx" ON "auth"."users" ("email_change_token_current");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_change_token_new_idx" ON "auth"."users" ("email_change_token_new");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reauthentication_token_idx" ON "auth"."users" ("reauthentication_token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_partial_key" ON "auth"."users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" ("user_id","friendly_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "factor_id_created_at_idx" ON "auth"."mfa_factors" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mfa_factors_user_id_idx" ON "auth"."mfa_factors" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" ("sso_provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" ("sso_provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" ("sso_provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" ("for_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_code" ON "auth"."flow_state" ("auth_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_id_auth_method" ON "auth"."flow_state" ("user_id","authentication_method");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flow_state_created_at_idx" ON "auth"."flow_state" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "identities_user_id_idx" ON "auth"."identities" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "identities_email_idx" ON "auth"."identities" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_customers" ADD CONSTRAINT "billing_customers_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_prices" ADD CONSTRAINT "billing_prices_billing_product_id_fkey" FOREIGN KEY ("billing_product_id") REFERENCES "billing_products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "billing_prices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_users" ADD CONSTRAINT "workspace_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_users" ADD CONSTRAINT "workspace_users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/