import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db, desc, eq, schema } from "~/lib/db.server";
import { Table } from "@repo/supabase";
import { ConnectionsView } from "~/components/Connections/ConnectionsView";
import { requireAuthSession } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "Calendars - FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const connections = await db
    .select()
    .from(schema.connections)
    .where(eq(schema.connections.owner_id, user.id))
    .orderBy(desc(schema.connections.created_at));

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
