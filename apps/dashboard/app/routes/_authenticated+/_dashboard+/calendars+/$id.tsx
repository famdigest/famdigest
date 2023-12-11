import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { asc, db, eq, schema } from "@repo/database";
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
import { RemoteCalendarService } from "~/lib/calendars";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";

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
    .orderBy(asc(schema.calendars.created_at));

  if (calendars.length === 0) {
    //
    const service = RemoteCalendarService.getProviderClass(connection);
    const list = await service.listCalendars();

    for (const cal of list) {
      const [newCal] = await db
        .insert(schema.calendars)
        .values({
          connection_id: connection.id,
          owner_id: user.id,
          enabled: true,
          ...cal,
        })
        .returning();

      calendars.push(newCal);
    }
  }

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
          <span className="hidden sm:inline">Back to Calendars</span>
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
