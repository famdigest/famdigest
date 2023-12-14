import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { trpc } from "~/lib/trpc";
import { Link, useLoaderData } from "@remix-run/react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db, schema, eq, desc, asc } from "~/lib/db.server";
import { requireAuthSession } from "~/lib/session.server";
import { Table, Calendar } from "@repo/supabase";
import { RemoteCalendarService } from "~/lib/calendars";
import { Button } from "@repo/ui";
import { ConnectionCard } from "~/components/Connections/ConnectionCard";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
    },
    where: eq(schema.calendars.owner_id, user.id),
    orderBy: asc(schema.calendars.created_at),
  });

  if (connections.length) {
    for (const connection of connections) {
      const service = RemoteCalendarService.getProviderClass(connection);
      const list = await service.listCalendars();

      for (const cal of list) {
        if (
          !!connection.calendars.find(
            (calendar) => calendar.external_id === cal.external_id
          )
        ) {
          continue;
        }

        const [newCal] = await db
          .insert(schema.calendars)
          .values({
            connection_id: connection.id,
            owner_id: user.id,
            ...cal,
          })
          .returning();

        connection.calendars.push(newCal);
      }
    }
  }

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
  const { user } = useWorkspaceLoader();
  const { connections } = useLoaderData<typeof loader>();

  const addGoogle = trpc.google.authorize.useMutation({
    onSuccess(data) {
      window.location.href = data.authorizeUrl;
    },
  });

  return (
    <div className="flex-1 flex py-20 items-start justify-center overflow-hidden">
      <div className="container max-w-screen-md space-y-12">
        <div className="grid grid-cols-4 gap-x-3">
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-slate-300" />
          <div className="h-3 rounded-full bg-slate-300" />
        </div>

        <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
          <p className="text-xl md:text-2xl">Connect your calendars</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 md:mt-4 mb-6">
            <button
              onClick={() => addGoogle.mutate("/onboarding/calendars")}
              className="bg-background rounded-lg border border-border flex flex-col items-center gap-y-3 justify-center aspect-video"
            >
              <IconBrandGoogle className="h-5 w-5 md:h-8 md:w-8" />
              Google
            </button>
          </div>
        </div>

        <div>
          <p className="text-xl md:text-2xl mb-6">Connected Calendars</p>
          <div className="space-y-4">
            {connections.map((connection) => {
              return (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  calendars={connection.calendars}
                />
              );
            })}
          </div>
        </div>

        <div>
          <Button asChild>
            <Link to="/onboarding/digests">Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
