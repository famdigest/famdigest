import {
  digestsInsertSchema,
  digestsRowSchema,
  digestsUpdateSchema,
} from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, desc, eq, schema } from "~/lib/db.server";
import { z } from "zod";
import { sendMessage } from "~/lib/twilio.server";
import dedent from "dedent";
import { track } from "@repo/tracking";

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

      // send opt in sms
      const body = dedent`Welcome to FamDigest!\n\n${ctx.user.full_name} has invited you to receive their daily digests.\n\nReply YES to opt-in and save the number in your contact!`;

      const response = await sendMessage({
        to: digest.phone,
        body,
        mediaUrl: [`https://www.famdigest.com/assets/vcard.vcf`],
      });

      await db.insert(schema.messages).values({
        message: body,
        role: "assistant",
        external_id: response.sid,
        digest_id: digest.id,
        segments: Number(response.numSegments),
        data: response,
        owner_id: ctx.user.id,
      });

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
