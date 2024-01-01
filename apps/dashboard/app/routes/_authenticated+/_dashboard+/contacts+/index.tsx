import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db, desc, eq, schema } from "@repo/database";
import { DigestsView } from "~/components/Digests/Digests";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { people, trackPageView } from "@repo/tracking";

export const meta: MetaFunction = () => {
  return [{ title: "Contacts - FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const digests = await db
    .select()
    .from(schema.digests)
    .where(eq(schema.digests.owner_id, user.id))
    .orderBy(desc(schema.digests.created_at));

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "contacts",
      user_id: user.id,
    },
  });

  people({
    id: user.id,
    request,
    properties: {
      digests: digests.length,
    },
  });

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
    <div className="py-6 md:py-12 space-y-12 container max-w-screen-lg">
      <DigestsView initialData={digests} />
    </div>
  );
}
