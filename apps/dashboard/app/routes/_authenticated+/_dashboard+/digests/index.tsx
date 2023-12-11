import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { and, db, desc, eq, schema } from "@repo/database";
import { DigestsView } from "~/components/Digests/Digests";
import { requireAuthSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

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
      digests,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { digests } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 md:p-12 space-y-12">
      <DigestsView initialData={digests} />
    </div>
  );
}