import { z } from "zod";
import { protectedProcedure, router } from "../trpc.server";
import { and, db, eq, schema, sql } from "@repo/database";
import dayjs from "dayjs";

const messageFilters = z.object({
  digest_id: z.string(),
  page: z.string().default("1"),
  size: z.string().default("50"),
  date: z.string().optional(),
});
export const messagesRouter = router({
  all: protectedProcedure
    .input(messageFilters)
    .query(async ({ ctx, input }) => {
      const messagesQuery = db.select().from(schema.messages);
      let where = eq(schema.messages.digest_id, input.digest_id);
      if (input.date) {
        const date = dayjs(input.date);
        console.log("search for ", date.format());
        messagesQuery.where(
          and(
            eq(sql`DATE(created_at)`, date.format("YYYY-MM-DD")),
            eq(schema.messages.digest_id, input.digest_id)
          )
        );
      } else {
        messagesQuery.where(eq(schema.messages.digest_id, input.digest_id));
      }

      const size = Number(input.size);
      const page = Number(input.page);

      messagesQuery.limit(size);
      messagesQuery.offset((page - 1) * size);

      const messages = await messagesQuery;
      return messages;
    }),
});
