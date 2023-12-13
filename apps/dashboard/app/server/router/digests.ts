import {
  Table,
  connectionsRowSchema,
  connectionsUpdateSchema,
  digestsInsertSchema,
  digestsRowSchema,
  digestsUpdateSchema,
} from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, desc, eq, schema } from "~/lib/db.server";
import { z } from "zod";

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
      const digests = await db
        .insert(schema.digests)
        .values({
          ...input,
          owner_id: ctx.user.id,
        })
        .returning();

      return digests;
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
          phone: input.phone,
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
  remove: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.delete(schema.digests).where(eq(schema.digests.id, input));
  }),
});
