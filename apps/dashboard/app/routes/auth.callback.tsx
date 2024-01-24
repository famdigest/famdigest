import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { SESSION_KEYS } from "~/constants";
import { commitSession, getSession } from "~/lib/session.server";
import { createAdminClient, createServerClient } from "@repo/supabase";
import { identify, people, track } from "@repo/tracking";
import { db, schema } from "@repo/database";
import { slugify } from "@repo/ui";
import { z } from "zod";
import { autoSubscribe } from "~/lib/auto-subscribe.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const session = await getSession(request);
  const redirect_uri = session.has("redirect_uri")
    ? (session.get("redirect_uri") as string)
    : "/";
  session.unset("redirect_uri");

  if (!code) {
    throw redirect("/auth-error", {
      headers: response.headers,
    });
  }

  const supabase = createServerClient(request, response);
  const { data } = await supabase.auth.exchangeCodeForSession(code);
  if (!data.user) {
    throw redirect("/auth-error", {
      headers: response.headers,
    });
  }

  const admin = createAdminClient();

  const identifyPeople = () => {
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
  };

  session.set("userId", data.user.id);

  // join data?
  if (session.has(SESSION_KEYS.join)) {
    const joinSchema = z.object({ token: z.string(), invited_by: z.string() });
    const joinValid = joinSchema.safeParse(
      JSON.parse(session.get(SESSION_KEYS.join))
    );
    if (joinValid.success) {
      const workspace = await db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.access_code, joinValid.data.token),
      });
      if (workspace) {
        await db.insert(schema.workspace_users).values({
          user_id: data.user.id,
          workspace_id: workspace.id,
          role: "member",
        });
        session.set(SESSION_KEYS.workspace, workspace.id);
        track({
          request,
          properties: {
            event_name: "Signed Up",
            device_id: session.id,
            user_id: data.user.id,
          },
        });
        identifyPeople();
        const subscriberId = await autoSubscribe({
          invited_by_id: joinValid.data.invited_by,
          owner_id: data.user.id,
          workspace_id: workspace.id,
        });
        session.unset(SESSION_KEYS.join);
        response.headers.append("Set-cookie", await commitSession(session));
        const finalUrl = subscriberId ? `/setup/${subscriberId}` : "/setup";
        return redirect(finalUrl, {
          headers: response.headers,
        });
      }
    }
  }

  const workspaces = await db.query.workspace_users.findMany({
    where(fields, { eq }) {
      return eq(fields.user_id, data.user!.id);
    },
  });

  if (workspaces?.length) {
    session.set(SESSION_KEYS.workspace, workspaces[0].workspace_id);
    track({
      request,
      properties: {
        event_name: "Signed In",
        device_id: session.id,
        user_id: data.user.id,
      },
    });
    identifyPeople();
  } else {
    track({
      request,
      properties: {
        event_name: "Signed Up",
        device_id: session.id,
        user_id: data.user.id,
      },
    });
    identifyPeople();

    return redirect("/onboarding", {
      headers: response.headers,
    });
  }

  response.headers.append("Set-cookie", await commitSession(session));
  return redirect(redirect_uri, {
    headers: response.headers,
  });
};
