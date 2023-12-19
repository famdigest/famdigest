import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { trpc } from "~/lib/trpc";
import { Link, useLoaderData } from "@remix-run/react";
import {
  IconBrandApple,
  IconBrandGoogle,
  IconCalendarPlus,
} from "@tabler/icons-react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db, schema, eq, asc } from "~/lib/db.server";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { Button } from "@repo/ui";
import { ConnectionCard } from "~/components/Connections/ConnectionCard";
import { trackPageView } from "@repo/tracking";

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
      title: "setup:calendars",
      user_id: session.get("userId"),
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
              onClick={() => addGoogle.mutate("/setup/calendars")}
              className="bg-background rounded-lg border border-border flex flex-col items-center gap-y-3 justify-center aspect-video"
            >
              <IconBrandGoogle className="h-5 w-5 md:h-8 md:w-8" />
              Google
            </button>
            <Link
              to="/providers/apple/setup?redirect_uri=/setup/calendars"
              className="bg-background rounded-lg border border-border flex flex-col items-center gap-y-3 justify-center aspect-video"
            >
              <IconBrandApple className="h-5 w-5 md:h-8 md:w-8" />
              iCloud
            </Link>
            <div className="bg-background rounded-lg border border-border flex flex-col items-center gap-y-3 justify-center aspect-video">
              <IconCalendarPlus className="h-5 w-5 md:h-8 md:w-8" />
              More Coming Soon
            </div>
          </div>
        </div>

        {connections.length > 0 && (
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
        )}

        <div>
          <Button asChild>
            <Link to="/setup/contacts">Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
