import { z } from "zod";
import { SESSION_KEYS } from "~/constants";
import { commitSession } from "~/lib/session.server";
import {
  createAdminClient,
  type UserPreferences,
  profilesInsertSchema,
} from "@repo/supabase";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "~/server/trpc.server";
import { db } from "@repo/database";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx, input }) => {
    const me = await db.query.profiles.findFirst({
      where: (table, { eq }) => eq(table.id, ctx.user.id),
    });
    return me;
  }),
  update: protectedProcedure
    .input(
      profilesInsertSchema
        .omit({ id: true, preferences: true })
        .extend({ preferences: z.record(z.any()) })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.email && ctx.user.email !== input.email) {
        const { error } = await ctx.supabase.auth.updateUser({
          email: input.email,
        });
        if (error) throw error;
      }

      if (input.full_name && ctx.user.full_name !== input.full_name) {
        await ctx.supabase.auth.updateUser({
          data: {
            full_name: input.full_name,
          },
        });
      }

      if (input.phone && ctx.user.phone !== input.phone) {
        await ctx.supabase.auth.updateUser({
          phone: input.phone,
        });
      }

      const { data, error } = await ctx.supabase
        .from("profiles")
        .update({
          ...input,
        })
        .match({
          id: ctx.user.id,
        })
        .select()
        .single();

      if (data) {
        ctx.session.set(
          SESSION_KEYS.theme,
          (data.preferences as UserPreferences).theme
        );
        ctx.res.headers.append("set-cookie", await commitSession(ctx.session));
      }

      if (error) throw error;
      return data;
    }),
  updatePreferences: protectedProcedure
    .input(profilesInsertSchema.pick({ preferences: true }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .update({
          preferences: {
            ...(ctx.user.preferences as UserPreferences),
            ...(input.preferences as UserPreferences),
          },
        })
        .match({
          id: ctx.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      ctx.session.set(
        SESSION_KEYS.theme,
        (data.preferences as UserPreferences).theme
      );
      ctx.res.headers.append("set-cookie", await commitSession(ctx.session));

      return data;
    }),
  password: protectedProcedure
    .input(z.object({ new_password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const admin = createAdminClient();
      const { error } = await admin.auth.admin.updateUserById(ctx.user.id, {
        password: input.new_password,
      });
      if (error) throw error;
    }),
  create: publicProcedure
    .input(
      z.object({
        full_name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = createAdminClient();
      const { error } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        user_metadata: {
          full_name: input.full_name,
        },
        email_confirm: true,
      });
      if (error) throw error;
      const { data, error: authError } =
        await ctx.supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });
      if (authError) throw authError;

      return data;
    }),
});
