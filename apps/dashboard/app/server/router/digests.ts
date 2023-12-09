import {
  Table,
  connectionsRowSchema,
  connectionsUpdateSchema,
  digestsInsertSchema,
  digestsUpdateSchema,
} from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, desc, eq, schema } from "@repo/database";
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
    .input(digestsUpdateSchema.extend({ id: z.string() }))
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
        .where(eq(schema.digests.id, input.id));
      return digest;
    }),
});
