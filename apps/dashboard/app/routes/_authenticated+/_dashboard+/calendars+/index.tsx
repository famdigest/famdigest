import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db, desc, eq, schema } from "~/lib/db.server";
import { Table } from "@repo/supabase";
import { ConnectionsView } from "~/components/Connections/ConnectionsView";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { people, trackPageView } from "@repo/tracking";

export const meta: MetaFunction = () => {
  return [{ title: "Calendars - FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
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
      user_id: session.get("userId"),
    },
  });

  let totalCalendars = 0;
  connections.forEach((connection) => {
    totalCalendars += connection.calendars.length;
  });
  people({
    id: session.get("userId"),
    request,
    properties: {
      calendars: totalCalendars,
    },
  });

  return json(
    {
      user,
      connections: connections as Table<"connections">[],
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { connections } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 md:p-12 space-y-12 container max-w-screen-lg">
      <ConnectionsView initialData={connections} />
    </div>
  );
}
