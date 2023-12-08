import { z } from "zod";
import {
  workspaceProcedure,
  router,
  protectedProcedure,
} from "~/server/trpc.server";
import {
  createAdminClient,
  invitationsInsertSchema,
  invitationsRowSchema,
} from "@repo/supabase";

export const inviteRouter = router({
  all: workspaceProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("invitations")
      .select("*")
      .match({ workspace_id: ctx.workspace.id });
    if (error) throw error;
    return data;
  }),
  create: workspaceProcedure
    .input(invitationsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { origin } = new URL(ctx.req.url);

      const { data: invitation, error } = await ctx.supabase
        .from("invitations")
        .insert({
          ...input,
          base_url: origin,
          sender: ctx.user.full_name ?? ctx.user.email!,
        })
        .select("*")
        .single();

      if (error) throw error;

      const supabaseAdmin = createAdminClient();
      const { data: user } = await supabaseAdmin
        .from("profiles")
        .select()
        .match({ email: input.email })
        .single();

      const { data, error: genLinkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: user ? "magiclink" : "invite",
          email: input.email,
        });
      if (genLinkError) throw genLinkError;

      // link
      const invite_url = `${origin}/auth/confirm?token=${
        data.properties.hashed_token
      }&type=${user ? "magiclink" : "invite"}&next=/accept-invite`;
      await supabaseAdmin
        .from("invitations")
        .update({
          invite_url,
        })
        .match({ id: invitation.id });

      // await sendTransactionalEmail({
      //   to: input.email,
      //   mail_name: "Workspace Invitation",
      //   from: "Carta Maps <franco@cartamaps.com>",
      //   subject: "You have been invited to Carta Maps",
      //   replacements: {
      //     workspace_name: invitation.workspace_name!,
      //     workspace_owner: sender,
      //     accept_invite_link: invite_url,
      //   },
      // });

      return invitation;
    }),
  resend: workspaceProcedure
    .input(invitationsRowSchema)
    .mutation(async ({ ctx, input }) => {
      const { origin } = new URL(ctx.req.url);

      const supabaseAdmin = createAdminClient();
      const { data: user } = await supabaseAdmin
        .from("users")
        .select()
        .match({ email: input.email })
        .single();

      const { data, error: genLinkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: user ? "magiclink" : "invite",
          email: input.email,
        });
      if (genLinkError) throw genLinkError;

      const invite_url = `${origin}/auth/confirm?token=${
        data.properties.hashed_token
      }&type=${user ? "magiclink" : "invite"}&next=/accept-invite`;
      const { data: invitation } = await supabaseAdmin
        .from("invitations")
        .update({
          invite_url,
        })
        .match({ email: input.email })
        .select()
        .single();

      // await sendTransactionalEmail({
      //   to: input.email,
      //   mail_name: "Workspace Invitation",
      //   from: "Carta Maps <franco@cartamaps.com>",
      //   subject: "You have been invited to Carta Maps",
      //   replacements: {
      //     workspace_name: input.workspace_name!,
      //     workspace_owner: sender,
      //     accept_invite_link: invite_url,
      //   },
      // });

      return invitation;
    }),
  accept: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc("accept_invitation", {
        lookup_invitation_token: input,
      });
      if (error) throw error;
      return data;
    }),
  remove: workspaceProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("invitations")
        .delete()
        .match({ id: input });
      if (error) throw error;
    }),
});
