import { z } from "zod";
import { type UserPreferences } from "@repo/supabase";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "~/server/trpc.server";
import { addToWaitlist } from "~/lib/hubspot.server";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select()
      .match({ id: ctx.user.id })
      .single();
    if (error) throw error;
    return {
      ...data,
      preferences: data.preferences as UserPreferences,
    };
  }),
  notify: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return await addToWaitlist(input.email);
    }),
});
