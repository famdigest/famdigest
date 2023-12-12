import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { and, db, desc, eq, schema } from "~/lib/db.server";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { requireAuthSession } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "FamDigest - Never use a shared calendar again" },
    {
      property: "og:title",
      content: "FamDigest - Never use a shared calendar again",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const calendars = await db
    .select()
    .from(schema.calendars)
    .innerJoin(
      schema.connections,
      eq(schema.calendars.connection_id, schema.connections.id)
    )
    .where(
      and(
        eq(schema.calendars.owner_id, user.id),
        eq(schema.calendars.enabled, true)
      )
    )
    .orderBy(desc(schema.calendars.created_at));

  const digests = await db
    .select()
    .from(schema.digests)
    .where(
      and(
        eq(schema.digests.owner_id, user.id),
        eq(schema.digests.enabled, true)
      )
    )
    .orderBy(desc(schema.digests.created_at));

  return json(
    {
      user,
      calendars,
      digests,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Index() {
  const { user, calendars, digests } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 md:p-12 space-y-12">
      <div>
        <h1 className="text-2xl font-medium font-serif">
          👋🏼 Welcome back, {user.full_name}!
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Calendars</CardDescription>
            <CardTitle className="text-6xl">{calendars.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Digest</CardDescription>
            <CardTitle className="text-6xl">{digests.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
