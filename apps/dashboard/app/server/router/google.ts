import { google } from "googleapis";
import { protectedProcedure, router } from "../trpc.server";
import { generateAuthUrl } from "~/lib/google.server";
import { and, db, eq, schema } from "@repo/database";

export const googleRouter = router({
  authorize: protectedProcedure.mutation(async ({ ctx }) => {
    const { origin } = new URL(ctx.req.url);
    const authorizeUrl = generateAuthUrl();
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
