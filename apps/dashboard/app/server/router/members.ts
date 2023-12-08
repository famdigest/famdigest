import { workspaceProcedure, router } from "~/server/trpc.server";
import {
  workspaceUsersRowSchema,
  workspaceUsersUpdateSchema,
} from "@repo/supabase";

export const memberRouter = router({
  all: workspaceProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("workspace_users")
      .select(
        "*, user:profiles(full_name, email, avatar_url), workspaces(owner_id)"
      )
      .match({ workspace_id: ctx.workspace.id });
    if (error) throw error;
    return data;
  }),
  update: workspaceProcedure
    .input(workspaceUsersUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user_id, workspace_id, ...update } = input;
      const { data, error } = await ctx.supabase
        .from("workspace_users")
        .update({
          ...update,
        })
        .match({
          user_id,
          workspace_id,
        });
      if (error) throw error;
      return data;
    }),
  remove: workspaceProcedure
    .input(workspaceUsersRowSchema.pick({ user_id: true, workspace_id: true }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("workspace_users")
        .delete()
        .match(input);
      if (error) throw error;
    }),
});
