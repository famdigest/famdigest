import { Table, connectionsUpdateSchema } from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, desc, eq, schema } from "~/lib/db.server";
import { z } from "zod";

export const connectionsRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const connections = await db
      .select()
      .from(schema.connections)
      .where(eq(schema.connections.owner_id, ctx.user.id))
      .orderBy(desc(schema.connections.created_at));

    return connections as Table<"connections">[];
  }),
  update: protectedProcedure
    .input(connectionsUpdateSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [connection] = await db
        .update(schema.connections)
        .set({
          enabled: input.enabled,
        })
        .where(eq(schema.connections.id, input.id));
      return connection;
    }),
});
