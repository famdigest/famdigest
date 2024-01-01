import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db, desc, eq, schema } from "@repo/database";
import { Table } from "@repo/supabase";
import { ConnectionsView } from "~/components/Connections/ConnectionsView";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { people, trackPageView } from "@repo/tracking";
import { ConnectionError } from "~/components/Connections/ConnectionError";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { CalendarTable } from "~/components/CalendarTable/CalendarTable";
import { CalendarTableRow } from "~/components/CalendarTable/Columns";
import { Separator } from "@repo/ui";

export const meta: MetaFunction = () => {
  return [{ title: "Calendars - FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);
  const { searchParams } = new URL(request.url);

  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
      profile: true,
    },
    where: eq(schema.connections.owner_id, user.id),
    orderBy: desc(schema.connections.created_at),
  });

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "calendars",
      user_id: user.id,
    },
  });

  let totalCalendars = 0;
  connections.forEach((connection) => {
    totalCalendars += connection.calendars.length;
  });
  people({
    id: user.id,
    request,
    properties: {
      calendars: totalCalendars,
    },
  });

  const calendars: CalendarTableRow[] = connections.reduce<any[]>(
    (acc, connection) => {
      return [
        ...acc,
        ...connection.calendars.map((calendar) => ({
          ...calendar,
          provider: connection.provider,
          owner: connection.profile,
        })),
      ];
    },
    []
  );

  return json(
    {
      user,
      error: searchParams.get("error"),
      connections: connections,
      calendars,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { connections, calendars, error } = useLoaderData<typeof loader>();

  return (
    <div className="py-6 md:py-12 space-y-12 container max-w-screen-lg">
      {error && <ConnectionError error={error} />}
      <ConnectionsView initialData={connections} />
    </div>
  );
}
