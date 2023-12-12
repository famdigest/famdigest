import { calendarsRowSchema } from "@repo/supabase";
import { protectedProcedure, router } from "../trpc.server";
import { db, eq, schema } from "~/lib/db.server";

const updateRow = calendarsRowSchema.pick({ id: true, enabled: true });

export const calendarRouter = router({
  update: protectedProcedure.input(updateRow).mutation(async ({ input }) => {
    const { id, ...update } = input;
    const [calendar] = await db
      .update(schema.calendars)
      .set({
        ...update,
      })
      .where(eq(schema.calendars.id, id))
      .returning();
    return calendar;
  }),
});
