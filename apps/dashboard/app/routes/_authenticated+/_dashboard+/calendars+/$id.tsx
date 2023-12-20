import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import { db, desc, eq, schema } from "~/lib/db.server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Switch,
  Separator,
  Button,
} from "@repo/ui";
import { IconArrowLeft, IconCalendar, IconLoader2 } from "@tabler/icons-react";
import { ConnectionProviderIcon } from "~/components/Connections/ConnectionProviderIcon";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";
import { ConfirmDeleteButton } from "~/components/ConfirmDeleteButton";
import { getCalendarProviderClass } from "@repo/plugins";
import { ConnectionRefresh } from "~/components/Connections/ConnectionRefresh";
import dayjs from "dayjs";
import { IconCalendarOff } from "@tabler/icons-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Calendar: ${
        data?.connection?.email ?? "Not Available"
      } - FamDigest`,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, response } = await getSessionWorkspace(request);

  const { id } = params as { id: string };
  let connection = await db.query.connections.findFirst({
    where: (connections, { eq }) => eq(connections.id, id),
  });

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

  let ok: boolean = true;
  let allEvents: any[] = [];
  try {
    const service = getCalendarProviderClass(connection);
    const activeCalendars = calendars.filter((c) => c.enabled);
    for (const calendar of activeCalendars) {
      const events = await service.getTodayEvents(calendar.external_id);
      allEvents.push(...events);
    }
  } catch (error) {
    console.log(error);
    connection = await db.query.connections.findFirst({
      where: (connections, { eq }) => eq(connections.id, id),
    });
    ok = false;
  }

  return json(
    {
      connection,
      calendars,
      events: allEvents,
      ok,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { connection, calendars, events } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const update = trpc.calendars.update.useMutation({
    onSuccess() {
      revalidator.revalidate();
    },
  });

  const remove = trpc.connections.remove.useMutation({
    onSuccess() {
      navigate("/calendars");
    },
  });

  if (!connection) throw new Error("Connection Not Found");
  const numActiveCals = calendars.filter((cal) => cal.enabled).length;

  return (
    <div className="container max-w-screen-md p-6 md:p-12">
      {connection.invalid && <ConnectionRefresh connection={connection} />}
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
              <p>{calendar.name}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Today's Events</CardTitle>
        </CardHeader>
        <CardContent className="p-6 border-t">
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 bg-muted border gap-y-0.5 rounded-md">
              <IconCalendarOff />
              <p className="text-sm">
                {numActiveCals === 0
                  ? "No active calendars"
                  : "No Events Today"}
              </p>
            </div>
          )}
          <ul className="divide-y">
            {events.map((event, idx) => (
              <li
                className="py-3 flex justify-between items-center gap-x-8"
                key={event.id ?? idx}
              >
                <div className="flex flex-col gap-y-0.5 ">
                  <p className="font-medium">{event.title ?? "No Title"}</p>
                  {event.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <time className="text-sm shrink-0">
                  {event.allDay ? (
                    <>All Day</>
                  ) : (
                    <>
                      {dayjs(event.start).format("h:mm A")} -{" "}
                      {dayjs(event.end).format("h:mm A")}
                    </>
                  )}
                </time>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Separator className="my-6" />

      <Card>
        <CardHeader className="flex flex-row space-y-0 items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Danger</CardTitle>
            <CardDescription>
              Deleting this integration will delete all connected calendars.
            </CardDescription>
          </div>
          <div>
            <ConfirmDeleteButton
              onConfirm={() => {
                remove.mutate(connection.id);
              }}
            >
              <Button variant="destructive">
                {remove.isLoading && (
                  <IconLoader2 size={20} className="animate-spin mr-2" />
                )}
                Delete
              </Button>
            </ConfirmDeleteButton>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
