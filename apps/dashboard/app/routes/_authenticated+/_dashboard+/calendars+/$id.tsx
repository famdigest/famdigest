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
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { ConnectionProviderIcon } from "~/components/Connections/ConnectionProviderIcon";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";
import { ConfirmDeleteButton } from "~/components/ConfirmDeleteButton";

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
              <p>{calendar.name}</p>
            </div>
          ))}
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
