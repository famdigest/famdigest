import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { trackPageView } from "@repo/tracking";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { UserDigest } from "~/components/Setup/UserDigest";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "@repo/database";
import { SubscribeSelf } from "~/components/Setup/SubscribeSelf";
import { SubscriberSetup } from "~/components/Setup/SubscriberSetup";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user } = await requireAuthSession(request);
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:invite",
      step: "subscriber",
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

  const subscriber = await db.query.subscriptions.findFirst({
    with: {
      subscription_calendars: {
        with: {
          calendar: true,
        },
      },
    },
    where: (table, { and, eq }) =>
      and(
        eq(table.owner_id, user.id),
        eq(table.id, params.subscriberId as string)
      ),
  });

  if (!subscriber) {
    throw redirect("/setup");
  }

  return json({
    connections,
    subscriber,
  });
}

export default function Route() {
  const navigate = useNavigate();
  const { connections, subscriber } = useLoaderData<typeof loader>();

  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="flex flex-col gap-y-10 w-full">
        <div className="container sm:max-w-sm">
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            Welcome to FamDigest
          </h1>
          <p>
            <strong>Step 2</strong>: Confirm the subscriber details and select
            the calendars you wish to include.
          </p>
        </div>

        <div className="container max-w-screen-sm">
          <SubscriberSetup
            connections={connections}
            subscriber={subscriber}
            selfSub={false}
            onSuccess={() => navigate(`/setup/${subscriber.id}/complete`)}
          />
        </div>
      </div>
    </div>
  );
}
