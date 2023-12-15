import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { db, desc, eq, schema } from "~/lib/db.server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Switch,
} from "@repo/ui";
import { IconArrowLeft } from "@tabler/icons-react";
import { ConnectionProviderIcon } from "~/components/Connections/ConnectionProviderIcon";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Calendar: ${data?.connection.email} - FamDigest` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, response } = await getSessionWorkspace(request);

  const { id } = params as { id: string };
  const [connection] = await db
    .select()
    .from(schema.connections)
    .where(eq(schema.connections.id, id));

  if (!connection) {
    throw new Response("", {
      status: 404,
      statusText: "Connection not found",
    });
  }

  let calendars = await db
    .select()
    .from(schema.calendars)
    .where(eq(schema.calendars.connection_id, connection.id))
    .orderBy(desc(schema.calendars.enabled));

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "calendars:id",
      user_id: session.get("userId"),
    },
  });

  return json(
    {
      connection,
      calendars,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { connection, calendars } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const update = trpc.calendars.update.useMutation({
    onSuccess() {
      revalidator.revalidate();
    },
  });

  return (
    <div className="container max-w-screen-md p-6 md:p-12">
      <div className="flex items-center p-4">
        <Link to="/calendars" className="flex items-center gap-x-2 text-sm">
          <IconArrowLeft size={14} />
          <span className="">Back to Calendars</span>
        </Link>
      </div>
      <Card>
        <div className="flex items-start md:items-center p-6 gap-x-4">
          <ConnectionProviderIcon provider={connection.provider} />
          <CardHeader className="p-0 space-y-0.5">
            <CardTitle className="capitalize text-xl">
              {connection.provider}
            </CardTitle>
            <CardDescription>{connection.email}</CardDescription>
          </CardHeader>
        </div>
        <CardContent className="p-6 border-t space-y-4">
          {calendars.map((calendar) => (
            <div key={calendar.id} className="flex items-center gap-x-4">
              <Switch
                checked={calendar.enabled}
                onCheckedChange={(checked) => {
                  update.mutate({
                    id: calendar.id,
                    enabled: checked,
                  });
                }}
              />
              <p>{calendar.data?.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
