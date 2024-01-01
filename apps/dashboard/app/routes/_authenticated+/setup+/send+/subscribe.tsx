import { LoaderFunctionArgs, json } from "@remix-run/node";
import { trackPageView } from "@repo/tracking";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { Invitation } from "~/components/Setup/Invitation";
import { db } from "@repo/database";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { SubscriberSetup } from "~/components/Setup/SubscriberSetup";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "@repo/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace } = await getSessionWorkspace(request);
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:send",
      step: "invite",
      user_id: user.id,
    },
  });

  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
    },
    where: (table, { eq }) => eq(table.owner_id, user.id),
    orderBy: (table, { asc }) => asc(table.created_at),
  });

  const subscribers = await db.query.subscriptions.findMany({
    with: {
      subscription_calendars: {
        with: {
          calendar: true,
        },
      },
    },
    where: (table, { and, eq }) =>
      and(eq(table.owner_id, user.id), eq(table.workspace_id, workspace.id)),
  });

  return json({
    connections,
    subscribers,
  });
}

export default function Route() {
  const { connections } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="flex flex-col gap-y-10 w-full">
        <div className="container sm:max-w-sm">
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            Welcome to FamDigest
          </h1>
          <p>
            <strong>Step 2</strong>: Add your first subscriber. They will
            recieve your daily schedule.
          </p>
        </div>

        <div className="container max-w-screen-sm">
          <SubscriberSetup
            connections={connections}
            onSuccess={() => {
              navigate("/setup/send/complete");
            }}
          />

          <div className="mt-4 flex justify-center">
            <Button variant="link">
              <Link to="/setup/send/complete">Skip</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
