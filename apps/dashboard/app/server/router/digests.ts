import {
  digestsInsertSchema,
  digestsRowSchema,
  digestsUpdateSchema,
} from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, desc, eq, schema } from "~/lib/db.server";
import { z } from "zod";
import { track } from "@repo/tracking";
import dayjs from "dayjs";
import { NotificationService } from "@repo/notifications";

export const digestsRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const digests = await db
      .select()
      .from(schema.digests)
      .where(eq(schema.digests.owner_id, ctx.user.id))
      .orderBy(desc(schema.digests.created_at));

    return digests;
  }),
  one: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const [digest] = await db
      .select()
      .from(schema.digests)
      .where(eq(schema.digests.id, input));

    return digest;
  }),
  create: protectedProcedure
    .input(digestsInsertSchema.omit({ owner_id: true }))
    .mutation(async ({ ctx, input }) => {
      const [digest] = await db
        .insert(schema.digests)
        .values({
          ...input,
          phone: `+${input.phone.replace(/\D/g, "")}`,
          owner_id: ctx.user.id,
        })
        .returning();

      // NotificationService.send({
      //   key: "contact.welcomeMessage",
      //   recipient: digest,
      //   owner: ctx.user,
      //   contact: digest,
      //   type: "sms",
      //   includeVCard: true,
      // });

      track({
        request: ctx.req,
        properties: {
          event_name: "Digest Created",
          device_id: ctx.session.id,
          user_id: ctx.user.id,
        },
      });

      return digest;
    }),
  resend: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const digest = await db.query.digests.findFirst({
        where: (digest, { eq }) => eq(digest.id, input),
      });

      if (!digest) {
        throw new Error("No digest found");
      }

      const message = await db.query.messages.findFirst({
        where: (msg, { eq }) => eq(msg.digest_id, digest.id),
        orderBy: (msg, { desc }) => desc(msg.created_at),
      });

      if (message) {
        const lastSentOn = dayjs(message?.created_at);
        const now = dayjs();

        console.log(Math.abs(lastSentOn.diff(now, "days")));
        if (Math.abs(lastSentOn.diff(now, "days")) < 1) {
          throw new Error(
            "Can only resend opt-in messages once every 24 hours"
          );
        }
      }

      NotificationService.send({
        key: "contact.optInReminder",
        recipient: digest,
        owner: ctx.user,
        contact: digest,
        type: "sms",
        includeVCard: true,
      });

      track({
        request: ctx.req,
        properties: {
          event_name: "Digest Resend OptIn",
          device_id: ctx.session.id,
          user_id: ctx.user.id,
        },
      });

      return digest;
    }),
  update: protectedProcedure
    .input(
      digestsUpdateSchema
        .omit({ created_at: true, updated_at: true })
        .extend({ id: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const [digest] = await db
        .update(schema.digests)
        .set({
          full_name: input.full_name,
          phone: `+${input.phone?.replace(/\D/g, "")}`,
          opt_in: input.opt_in,
          enabled: input.enabled,
          timezone: input.timezone,
          notify_on: input.notify_on,
        })
        .where(eq(schema.digests.id, input.id))
        .returning();
      return digest;
    }),
  bulkUpsert: protectedProcedure
    .input(
      z.array(
        digestsRowSchema
          .pick({
            full_name: true,
            notify_on: true,
            phone: true,
            timezone: true,
          })
          .extend({
            id: z.string().optional(),
          })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const saved = [];
      for (const digest of input) {
        if (digest.id) {
          const [row] = await db
            .update(schema.digests)
            .set({
              ...digest,
            })
            .where(eq(schema.digests.id, digest.id))
            .returning();
          saved.push(row);
        } else {
          const [row] = await db
            .insert(schema.digests)
            .values({
              ...digest,
              owner_id: ctx.user.id,
              opt_in: false,
              enabled: true,
            })
            .returning();
          saved.push(row);
        }
      }
      return saved;
    }),
  remove: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await db.delete(schema.digests).where(eq(schema.digests.id, input));
      track({
        request: ctx.req,
        properties: {
          event_name: "Digest Deleted",
          device_id: ctx.session.id,
          user_id: ctx.user.id,
        },
      });
    }),
});
