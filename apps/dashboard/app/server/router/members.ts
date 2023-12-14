import { workspaceProcedure, router } from "~/server/trpc.server";
import {
  workspaceUsersRowSchema,
  workspaceUsersUpdateSchema,
} from "@repo/supabase";
import { db, eq, schema } from "~/lib/db.server";

export const memberRouter = router({
  all: workspaceProcedure.query(async ({ ctx }) => {
    const members = await db.query.workspace_users.findMany({
      with: {
        profile: true,
        workspace: {
          columns: {
            owner_id: true,
          },
        },
      },
      where: eq(schema.workspace_users.workspace_id, ctx.workspace.id),
    });

    return members;
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
        })
        .select();
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
