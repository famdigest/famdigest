import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { SESSION_KEYS } from "~/constants";
import { commitSession, getSession } from "~/lib/session.server";
import { createAdminClient, createServerClient } from "@repo/supabase";
import { identify, people, track } from "@repo/tracking";

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
        track({
          request,
          properties: {
            event_name: "Signed In",
            device_id: session.id,
            user_id: data.user.id,
          },
        });
      } else {
        track({
          request,
          properties: {
            event_name: "Signed Up",
            device_id: session.id,
            user_id: data.user.id,
          },
        });

        identify({
          request,
          properties: {
            device_id: session.id,
            user_id: data.user.id,
          },
        });

        people({
          id: data.user.id,
          request,
          properties: {
            name: data.user.user_metadata?.full_name,
            email: data.user.email!,
            created: data.user.created_at,
            avatar: data.user.user_metadata?.avatar_url,
          },
        });

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
