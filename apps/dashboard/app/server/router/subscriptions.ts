import { SubscriptionLogs, and, db, eq, schema } from "@repo/database";
import { router, workspaceProcedure } from "../trpc.server";
import {
  subscriptionsInsertSchema,
  subscriptionsUpdateSchema,
} from "@repo/supabase";
import { z } from "zod";
import { subscription_calendars } from "@repo/database/src/schema";
import dayjs from "dayjs";
import { NotificationService } from "@repo/notifications";
import { track } from "@repo/tracking";

const messageFilters = z.object({
  subscription_id: z.string(),
  page: z.string().default("1"),
  size: z.string().default("50"),
  date: z.string().optional(),
});

export const subscriptionRouter = router({
  all: workspaceProcedure.query(async ({ ctx }) => {
    return await db.query.subscriptions.findMany({
      with: {
        subscription_calendars: {
          with: {
            calendar: true,
          },
        },
      },
      where: (table, { eq }) => eq(table.owner_id, ctx.user.id),
    });
  }),
  workspace: workspaceProcedure.query(async ({ ctx }) => {
    return await db.query.subscriptions.findMany({
      with: {
        subscription_calendars: {
          with: {
            calendar: true,
          },
        },
      },
      where: (table, { eq }) => eq(table.workspace_id, ctx.workspace.id),
    });
  }),
  one: workspaceProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await db.query.subscriptions.findFirst({
      with: {
        subscription_calendars: {
          with: {
            calendar: true,
          },
        },
      },
      where: (table, { and, eq }) =>
        and(eq(table.workspace_id, ctx.workspace.id), eq(table.id, input)),
    });
  }),
  messages: workspaceProcedure
    .input(messageFilters)
    .query(async ({ ctx, input }) => {
      const size = Number(input.size);
      const page = Number(input.page);

      let messages: SubscriptionLogs[] = [];
      if (input.date) {
        const date = dayjs(input.date);
        messages = await db.query.subscription_logs.findMany({
          limit: size,
          offset: (page - 1) * size,
          orderBy: (table, { desc }) => desc(table.created_at),
          where: (table, { and, eq, sql }) =>
            and(
              eq(sql`DATE(created_at)`, date.format("YYYY-MM-DD")),
              eq(table.subscription_id, input.subscription_id)
            ),
        });
      } else {
        messages = await db.query.subscription_logs.findMany({
          limit: size,
          offset: (page - 1) * size,
          orderBy: (table, { desc }) => desc(table.created_at),
          where: (table, { eq }) =>
            eq(table.subscription_id, input.subscription_id),
        });
      }

      return messages;
    }),
  link: workspaceProcedure
    .input(z.object({ subscription_id: z.string(), calendar_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const row = await db.query.subscriptions.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.workspace_id, ctx.workspace.id),
            eq(table.id, input.subscription_id)
          ),
      });

      if (!row) throw new Error("No access to subscription");
      return await db
        .insert(subscription_calendars)
        .values({
          ...input,
        })
        .returning();
    }),
  unlink: workspaceProcedure
    .input(z.object({ subscription_id: z.string(), calendar_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const row = await db.query.subscriptions.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.workspace_id, ctx.workspace.id),
            eq(table.id, input.subscription_id)
          ),
      });

      if (!row) throw new Error("No access to subscription");

      return await db
        .delete(subscription_calendars)
        .where(
          and(
            eq(
              schema.subscription_calendars.subscription_id,
              input.subscription_id
            ),
            eq(schema.subscription_calendars.calendar_id, input.calendar_id)
          )
        )
        .returning();
    }),
  create: workspaceProcedure
    .input(
      subscriptionsInsertSchema
        .omit({ workspace_id: true, owner_id: true })
        .extend({
          calendar_ids: z.array(z.string()),
        })
    )
    .mutation(async ({ ctx, input }) => {
      const { calendar_ids, ...values } = input;
      const [sub] = await db
        .insert(schema.subscriptions)
        .values({
          ...values,
          workspace_id: ctx.workspace.id,
          owner_id: ctx.user.id,
        })
        .returning();

      await db
        .insert(subscription_calendars)
        .values(
          calendar_ids.map((calId) => ({
            subscription_id: sub.id,
            calendar_id: calId,
          }))
        )
        .onConflictDoNothing();

      // opt-in
      NotificationService.send({
        key: "contact.welcomeMessage",
        recipient: sub,
        owner: ctx.user,
        contact: sub,
        type: "sms",
        includeVCard: true,
        workspace: ctx.workspace,
      });

      track({
        request: ctx.req,
        properties: {
          event_name: "Subscriber Created",
          device_id: ctx.session.id,
          user_id: ctx.user.id,
        },
      });

      return sub;
    }),
  update: workspaceProcedure
    .input(
      subscriptionsUpdateSchema
        .omit({ workspace_id: true, owner_id: true })
        .extend({
          id: z.string(),
          calendar_ids: z.array(z.string()).optional(),
        })
    )
    .mutation(async ({ ctx, input }) => {
      const { calendar_ids, ...values } = input;
      const row = await db.query.subscriptions.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.workspace_id, ctx.workspace.id), eq(table.id, input.id)),
      });

      if (!row) throw new Error("No access to subscription");

      const [sub] = await db
        .update(schema.subscriptions)
        .set({
          ...values,
          workspace_id: ctx.workspace.id,
          owner_id: ctx.user.id,
          updated_at: dayjs().format(),
        })
        .where(eq(schema.subscriptions.id, row.id))
        .returning();

      if (calendar_ids) {
        await db
          .delete(subscription_calendars)
          .where(eq(schema.subscription_calendars.subscription_id, row.id));
        await db
          .insert(subscription_calendars)
          .values(
            calendar_ids.map((calId) => ({
              subscription_id: sub.id,
              calendar_id: calId,
            }))
          )
          .onConflictDoNothing();
      }

      // opt-in
      if (row && row.phone !== input.phone) {
        // opt-in again
        NotificationService.send({
          key: "contact.welcomeMessage",
          recipient: sub,
          owner: ctx.user,
          contact: sub,
          type: "sms",
          includeVCard: true,
          workspace: ctx.workspace,
        });
      }

      return sub;
    }),
  remove: workspaceProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.workspace_id, ctx.workspace.id),
            eq(schema.subscriptions.id, input)
          )
        )
        .returning();
    }),
});
