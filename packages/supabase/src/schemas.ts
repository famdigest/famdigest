// Generated by ts-to-zod
import { z } from "zod";
import { Json } from "./database";

export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.record(z.union([jsonSchema, z.undefined()])),
      z.array(jsonSchema),
    ])
    .nullable()
);

export const calendarsRowSchema = z.object({
  connection_id: z.string(),
  created_at: z.string().nullable(),
  data: jsonSchema.nullable(),
  enabled: z.boolean(),
  external_id: z.string(),
  id: z.string(),
  owner_id: z.string(),
  updated_at: z.string().nullable(),
});

export const calendarsInsertSchema = z.object({
  connection_id: z.string(),
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  enabled: z.boolean().optional(),
  external_id: z.string(),
  id: z.string().optional(),
  owner_id: z.string(),
  updated_at: z.string().optional().nullable(),
});

export const calendarsUpdateSchema = z.object({
  connection_id: z.string().optional(),
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  enabled: z.boolean().optional(),
  external_id: z.string().optional(),
  id: z.string().optional(),
  owner_id: z.string().optional(),
  updated_at: z.string().optional().nullable(),
});

export const digestsRowSchema = z.object({
  created_at: z.string().nullable(),
  enabled: z.boolean(),
  full_name: z.string(),
  id: z.string(),
  notify_on: z.string(),
  opt_in: z.boolean(),
  owner_id: z.string(),
  phone: z.string(),
  timezone: z.string(),
  updated_at: z.string().nullable(),
});

export const digestsInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  full_name: z.string(),
  id: z.string().optional(),
  notify_on: z.string(),
  opt_in: z.boolean().optional(),
  owner_id: z.string(),
  phone: z.string(),
  timezone: z.string(),
  updated_at: z.string().optional().nullable(),
});

export const digestsUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  full_name: z.string().optional(),
  id: z.string().optional(),
  notify_on: z.string().optional(),
  opt_in: z.boolean().optional(),
  owner_id: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  updated_at: z.string().optional().nullable(),
});

export const profilesRowSchema = z.object({
  avatar_url: z.string().nullable(),
  created_at: z.string().nullable(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  id: z.string(),
  phone: z.string().nullable(),
  preferences: jsonSchema,
  updated_at: z.string().nullable(),
});

export const profilesInsertSchema = z.object({
  avatar_url: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  full_name: z.string().optional().nullable(),
  id: z.string(),
  phone: z.string().optional().nullable(),
  preferences: jsonSchema.optional(),
  updated_at: z.string().optional().nullable(),
});

export const profilesUpdateSchema = z.object({
  avatar_url: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  full_name: z.string().optional().nullable(),
  id: z.string().optional(),
  phone: z.string().optional().nullable(),
  preferences: jsonSchema.optional(),
  updated_at: z.string().optional().nullable(),
});

export const sessionsRowSchema = z.object({
  created_at: z.string().nullable(),
  data: jsonSchema.nullable(),
  expires: z.string().nullable(),
  id: z.string(),
});

export const sessionsInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  expires: z.string().optional().nullable(),
  id: z.string().optional(),
});

export const sessionsUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  expires: z.string().optional().nullable(),
  id: z.string().optional(),
});

export const workspacesRowSchema = z.object({
  created_at: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  owner_id: z.string(),
  settings: jsonSchema.nullable(),
  slug: z.string(),
  updated_at: z.string().nullable(),
});

export const workspacesInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  id: z.string().optional(),
  name: z.string(),
  owner_id: z.string(),
  settings: jsonSchema.optional().nullable(),
  slug: z.string(),
  updated_at: z.string().optional().nullable(),
});

export const workspacesUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  id: z.string().optional(),
  name: z.string().optional(),
  owner_id: z.string().optional(),
  settings: jsonSchema.optional().nullable(),
  slug: z.string().optional(),
  updated_at: z.string().optional().nullable(),
});

export const currentUserAccountRoleReturnsSchema = jsonSchema;

export const getWorkspaceBillingStatusReturnsSchema = jsonSchema;

export const lookupInvitationReturnsSchema = jsonSchema;

export const invitationTypeSchema = z.union([
  z.literal("one-time"),
  z.literal("24-hour"),
]);

export const messageRoleSchema = z.union([
  z.literal("assistant"),
  z.literal("user"),
]);

export const pricingPlanIntervalSchema = z.union([
  z.literal("day"),
  z.literal("week"),
  z.literal("month"),
  z.literal("year"),
]);

export const pricingTypeSchema = z.union([
  z.literal("one_time"),
  z.literal("recurring"),
]);

export const providerTypeSchema = z.union([
  z.literal("google"),
  z.literal("outlook"),
  z.literal("yahoo"),
  z.literal("aol"),
  z.literal("zoho"),
  z.literal("protonmail"),
  z.literal("icloud"),
  z.literal("live"),
  z.literal("hotmail"),
]);

export const subscriptionStatusSchema = z.union([
  z.literal("trialing"),
  z.literal("active"),
  z.literal("canceled"),
  z.literal("incomplete"),
  z.literal("incomplete_expired"),
  z.literal("past_due"),
  z.literal("unpaid"),
  z.literal("paused"),
]);

export const workspaceRoleSchema = z.union([
  z.literal("owner"),
  z.literal("member"),
]);

export const connectionsRowSchema = z.object({
  created_at: z.string().nullable(),
  data: jsonSchema.nullable(),
  email: z.string(),
  enabled: z.boolean(),
  id: z.string(),
  owner_id: z.string(),
  provider: providerTypeSchema,
  updated_at: z.string().nullable(),
});

export const connectionsInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  email: z.string(),
  enabled: z.boolean().optional(),
  id: z.string().optional(),
  owner_id: z.string(),
  provider: providerTypeSchema,
  updated_at: z.string().optional().nullable(),
});

export const connectionsUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  email: z.string().optional(),
  enabled: z.boolean().optional(),
  id: z.string().optional(),
  owner_id: z.string().optional(),
  provider: providerTypeSchema.optional(),
  updated_at: z.string().optional().nullable(),
});

export const invitationsRowSchema = z.object({
  created_at: z.string().nullable(),
  email: z.string(),
  id: z.string(),
  invitation_type: invitationTypeSchema.nullable(),
  invite_url: z.string().nullable(),
  invited_by_user_id: z.string(),
  role: workspaceRoleSchema,
  token: z.string(),
  updated_at: z.string().nullable(),
  workspace_id: z.string(),
  workspace_name: z.string().nullable(),
});

export const invitationsInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  email: z.string(),
  id: z.string().optional(),
  invitation_type: invitationTypeSchema.optional().nullable(),
  invite_url: z.string().optional().nullable(),
  invited_by_user_id: z.string(),
  role: workspaceRoleSchema,
  token: z.string().optional(),
  updated_at: z.string().optional().nullable(),
  workspace_id: z.string(),
  workspace_name: z.string().optional().nullable(),
});

export const invitationsUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  email: z.string().optional(),
  id: z.string().optional(),
  invitation_type: invitationTypeSchema.optional().nullable(),
  invite_url: z.string().optional().nullable(),
  invited_by_user_id: z.string().optional(),
  role: workspaceRoleSchema.optional(),
  token: z.string().optional(),
  updated_at: z.string().optional().nullable(),
  workspace_id: z.string().optional(),
  workspace_name: z.string().optional().nullable(),
});

export const messagesRowSchema = z.object({
  created_at: z.string().nullable(),
  data: jsonSchema.nullable(),
  digest_id: z.string(),
  external_id: z.string(),
  id: z.string(),
  message: z.string(),
  owner_id: z.string(),
  role: messageRoleSchema,
  segments: z.number(),
  updated_at: z.string().nullable(),
});

export const messagesInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  digest_id: z.string(),
  external_id: z.string(),
  id: z.string().optional(),
  message: z.string(),
  owner_id: z.string(),
  role: messageRoleSchema,
  segments: z.number(),
  updated_at: z.string().optional().nullable(),
});

export const messagesUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  data: jsonSchema.optional().nullable(),
  digest_id: z.string().optional(),
  external_id: z.string().optional(),
  id: z.string().optional(),
  message: z.string().optional(),
  owner_id: z.string().optional(),
  role: messageRoleSchema.optional(),
  segments: z.number().optional(),
  updated_at: z.string().optional().nullable(),
});

export const workspaceUsersRowSchema = z.object({
  created_at: z.string().nullable(),
  role: workspaceRoleSchema,
  updated_at: z.string().nullable(),
  user_id: z.string(),
  workspace_id: z.string(),
});

export const workspaceUsersInsertSchema = z.object({
  created_at: z.string().optional().nullable(),
  role: workspaceRoleSchema,
  updated_at: z.string().optional().nullable(),
  user_id: z.string(),
  workspace_id: z.string(),
});

export const workspaceUsersUpdateSchema = z.object({
  created_at: z.string().optional().nullable(),
  role: workspaceRoleSchema.optional(),
  updated_at: z.string().optional().nullable(),
  user_id: z.string().optional(),
  workspace_id: z.string().optional(),
});
