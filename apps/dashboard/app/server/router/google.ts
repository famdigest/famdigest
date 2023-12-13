import { google } from "googleapis";
import { protectedProcedure, router } from "../trpc.server";
import { generateAuthUrl } from "~/lib/google.server";
import { and, db, eq, schema } from "~/lib/db.server";
import { z } from "zod";
import { commitSession } from "~/lib/session.server";

export const googleRouter = router({
  authorize: protectedProcedure
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
  list: protectedProcedure.query(async ({ ctx }) => {
    const connections = await db
      .select()
      .from(schema.connections)
      .where(
        and(
          eq(schema.connections.owner_id, ctx.user.id),
          eq(schema.connections.provider, "google")
        )
      );

    return connections;
  }),
});
