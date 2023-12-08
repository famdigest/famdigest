import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  createAdminClient,
  createServerClient,
  type EmailOtpType,
} from "@repo/supabase";
import { SESSION_KEYS } from "~/constants";
import { commitSession, getSession } from "~/lib/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type") as EmailOtpType;

  if (token_hash && type) {
    const supabase = createServerClient(request, response);
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    const session = await getSession(request);

    if (!error && data.user) {
      session.set("userId", data.user.id);
      response.headers.append("set-cookie", await commitSession(session));

      if (type === "invite" || next.includes("invite")) {
        // look up token for user
        const admin = createAdminClient();
        const { data: invitation, error } = await admin
          .from("invitations")
          .select()
          .match({ email: data.user.email })
          .single();

        if (error) {
          return redirect("/auth-error", {
            headers: response.headers,
          });
        }

        return redirect(`/accept-invite/${invitation.token}`, {
          headers: response.headers,
        });
      }

      if (type === "recovery") {
        // look up token for user
        return redirect(`/recovery`, {
          headers: response.headers,
        });
      }

      if (type === "email") {
        //
      }

      if (type === "magiclink") {
        //
      }

      const { data: workspaces } = await supabase.from("workspaces").select();
      if (workspaces?.length) {
        session.set(SESSION_KEYS.workspace, workspaces[0].id);
        response.headers.append("Set-cookie", await commitSession(session));
      } else {
        return redirect("/onboarding", {
          headers: response.headers,
        });
      }

      return redirect(next, {
        headers: response.headers,
      });
    }
  }

  return redirect("/auth-error", {
    headers: response.headers,
  });
};
