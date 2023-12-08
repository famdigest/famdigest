import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { SESSION_KEYS } from "~/constants";
import { commitSession, getSession } from "~/lib/session.server";
import { createAdminClient, createServerClient } from "@repo/supabase";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const session = await getSession(request);

  if (code) {
    const supabase = createServerClient(request, response);
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      session.set("userId", data.user.id);
      response.headers.append("set-cookie", await commitSession(session));

      const admin = createAdminClient();

      const { data: workspaces } = await admin
        .from("workspace_users")
        .select("*")
        .match({
          user_id: data.user.id,
        });

      if (workspaces?.length) {
        session.set(SESSION_KEYS.workspace, workspaces[0].workspace_id);
        response.headers.append("Set-cookie", await commitSession(session));
      } else {
        try {
          const [first_name, ...others] = data.user.user_metadata?.full_name
            ? data.user.user_metadata.full_name.split(" ")
            : "";
        } catch (error) {
          //
        }

        return redirect("/onboarding", {
          headers: response.headers,
        });
      }
    }
  }

  return redirect("/", {
    headers: response.headers,
  });
};
