import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db, desc, eq, schema } from "@repo/database";
import { Table } from "@repo/supabase";
import { CalendarsView } from "~/components/Calendars/Calendars";
import { DigestsView } from "~/components/Digests/Digests";
import { requireAuthSession } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "FamDigest" },
    { name: "description", content: "Welcome to FamDigest!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const connections = await db
    .select()
    .from(schema.connections)
    .where(eq(schema.connections.owner_id, user.id))
    .orderBy(desc(schema.connections.created_at));

  const digests = await db
    .select()
    .from(schema.digests)
    .where(eq(schema.digests.owner_id, user.id))
    .orderBy(desc(schema.digests.created_at));

  return json(
    {
      user,
      connections: connections as Table<"connections">[],
      digests,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Index() {
  const { user, connections, digests } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 md:p-12 space-y-12">
      <CalendarsView initialData={connections} />
      <DigestsView initialData={digests} />
    </div>
  );
}
