// import * as trpc from "@trpc/server";
import { z } from "zod";
import { SESSION_KEYS } from "~/constants";
import { commitSession } from "~/lib/session.server";
import {
  protectedProcedure,
  workspaceProcedure,
  router,
} from "~/server/trpc.server";
import { workspacesInsertSchema, workspacesUpdateSchema } from "@repo/supabase";

export const workspaceRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("workspaces")
      .select("*, billing_subscriptions(status), workspace_users!inner(role)");
    if (error) throw error;
    return data;
  }),
  active: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.workspace;
  }),
  set: protectedProcedure
    .input(z.string().optional())
    .mutation(async ({ ctx, input }) => {
      const workspaceQuery = ctx.supabase
        .from("workspaces")
        .select("*, workspace_users(*)");
      if (input) {
        workspaceQuery.match({ id: input });
      }

      const { data: workspace, error } = await workspaceQuery.limit(1).single();
      if (!workspace) {
        throw error;
      }

      ctx.session.set(SESSION_KEYS.workspace, workspace.id);
      ctx.res.headers.append("Set-cookie", await commitSession(ctx.session));
      return workspace;
    }),
  switch: workspaceProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { data: workspace, error } = await ctx.supabase
        .from("workspaces")
        .select("*")
        .eq("id", input)
        .single();
      if (error) throw error;
      ctx.session.set(SESSION_KEYS.workspace, workspace.id);
      ctx.res.headers.append("set-cookie", await commitSession(ctx.session));
      return workspace;
    }),
  create: protectedProcedure
    .input(workspacesInsertSchema.omit({ owner_id: true }))
    .mutation(async ({ ctx, input }) => {
      const { data: workspace, error } = await ctx.supabase
        .from("workspaces")
        .insert({
          ...input,
          owner_id: ctx.user.id,
        })
        .select("*")
        .single();
      if (error) throw error;

      ctx.session.set(SESSION_KEYS.workspace, workspace.id);
      ctx.res.headers.append("set-cookie", await commitSession(ctx.session));

      return workspace;
    }),
  update: workspaceProcedure
    .input(workspacesUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...record } = input;
      const { data, error } = await ctx.supabase
        .from("workspaces")
        .update({
          ...record,
        })
        .match({
          id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    }),
});
