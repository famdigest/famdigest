import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db, schema, eq, asc } from "@repo/database";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";
import { PluginSetup } from "~/components/Setup/PluginSetup";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
    },
    where: eq(schema.calendars.owner_id, user.id),
    orderBy: asc(schema.calendars.created_at),
  });

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:send",
      step: "calendars",
      user_id: user.id,
    },
  });

  return json(
    {
      user,
      connections: connections,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { connections } = useLoaderData<typeof loader>();

  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="container sm:max-w-sm flex flex-col gap-y-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            Welcome to FamDigest
          </h1>
          <p>
            <strong>Step 2</strong>: Select the calendars you would like to
            connect. Your contact will get your daily digest.
          </p>
        </div>

        <PluginSetup
          initialData={connections}
          redirectUri="/setup/send/invite"
        />
      </div>
    </div>
  );
}
