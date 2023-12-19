import { Table, connectionsUpdateSchema } from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, desc, eq, schema } from "~/lib/db.server";
import { z } from "zod";
import { generateAuthUrl, o365AuthUrl } from "@repo/plugins";
import { commitSession } from "~/lib/session.server";

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
  remove: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.delete(schema.connections).where(eq(schema.connections.id, input));
  }),
  google: protectedProcedure
    .input(z.string().optional())
    .mutation(async ({ ctx, input }) => {
      // const { pathname } = new URL(ctx.req.url);
      const authorizeUrl = generateAuthUrl();
      if (input) {
        ctx.session.set("redirect_uri", input);
        ctx.res.headers.set("set-cookie", await commitSession(ctx.session));
      }
      return {
        authorizeUrl,
      };
    }),
  office365: protectedProcedure
    .input(z.string().optional())
    .mutation(async ({ ctx, input }) => {
      // const { pathname } = new URL(ctx.req.url);
      const authorizeUrl = o365AuthUrl(ctx.req);
      if (input) {
        ctx.session.set("redirect_uri", input);
        ctx.res.headers.set("set-cookie", await commitSession(ctx.session));
      }
      return {
        authorizeUrl,
      };
    }),
});
