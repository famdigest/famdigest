import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import {
  ConnectionWithCalendars,
  SubscriberWithRelations,
  db,
} from "@repo/database";
import { Separator, cn } from "@repo/ui";
import {
  IconUserSquareRounded,
  IconCalendarCog,
  IconMessage2,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { SubscriberDropdownMenu } from "~/components/SubscriberDropdownMenu";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);

  const subscriber = await db.query.subscriptions.findFirst({
    with: {
      subscription_calendars: {
        with: {
          calendar: true,
        },
      },
    },
    where: (table, { and, eq }) =>
      and(
        eq(table.owner_id, user.id),
        eq(table.workspace_id, workspace.id),
        eq(table.id, params.id as string)
      ),
  });

  if (!subscriber) {
    throw new Response("", { status: 404, statusText: "Subscriber not found" });
  }

  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
    },
    where: (table, { and, eq }) =>
      and(eq(table.owner_id, user.id), eq(table.workspace_id, workspace.id)),
  });

  return json(
    {
      subscriber,
      connections,
    },
    {
      headers: response.headers,
    }
  );
}

export type ContextType = {
  subscriber: SubscriberWithRelations;
  connections: ConnectionWithCalendars[];
};

export default function Layout() {
  const { subscriber: initialData, connections } =
    useLoaderData<typeof loader>();
  const { data: subscriber } = trpc.subscribers.one.useQuery(initialData.id, {
    initialData,
  });

  return (
    <div className="py-6 md:py-12 space-y-12 container max-w-screen-lg">
      <div className="space-y-6">
        <header className="flex flex-row items-center">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold font-serif">
              {subscriber?.full_name}
              <span className="text-base font-normal pl-1.5">
                / {subscriber?.phone}
              </span>
            </h2>
            <ul className="flex items-center divide-x text-xs -mx-2">
              <li className="flex items-center gap-x-1.5 px-2">
                Added on {dayjs(subscriber?.created_at).format("MM/YYYY")}
              </li>
              <li className="flex items-center gap-x-1.5 px-2">
                Opt-in:{" "}
                {subscriber?.opt_in ? (
                  <IconCheck size={14} />
                ) : (
                  <IconX size={14} />
                )}
              </li>
            </ul>
          </div>
          <div className="ml-auto">
            {subscriber && <SubscriberDropdownMenu subscriber={subscriber} />}
          </div>
        </header>
        <Separator />
        <div className="border border-border rounded-lg flex flex-col md:flex-row">
          <div className="w-full md:w-40 lg:w-52 p-2 shrink-0">
            <nav className="flex flex-row md:flex-col gap-x-1.5 md:gap-x-0 md:gap-y-1.5">
              <NavLink
                to={`/subscribers/${subscriber?.id}`}
                end={true}
                className={({ isActive }) =>
                  cn(
                    "px-2 py-1.5 rounded-md hover:bg-muted flex items-center gap-x-2 text-sm",
                    isActive && "bg-secondary"
                  )
                }
              >
                <IconUserSquareRounded size={16} />
                Details
              </NavLink>
              <NavLink
                to={`/subscribers/${subscriber?.id}/calendars`}
                className={({ isActive }) =>
                  cn(
                    "px-2 py-1.5 rounded-md hover:bg-muted flex items-center gap-x-2 text-sm",
                    isActive && "bg-secondary"
                  )
                }
              >
                <IconCalendarCog size={16} />
                Calendars
              </NavLink>
              <NavLink
                to={`/subscribers/${subscriber?.id}/logs`}
                className={({ isActive }) =>
                  cn(
                    "px-2 py-1.5 rounded-md hover:bg-muted flex items-center gap-x-2 text-sm",
                    isActive && "bg-secondary"
                  )
                }
              >
                <IconMessage2 size={16} />
                Messages
              </NavLink>
            </nav>
          </div>
          <div className="border-t md:border-t-0 md:border-l flex-1 flex flex-col min-h-[600px]">
            <Outlet context={{ subscriber, connections } as ContextType} />
          </div>
        </div>
      </div>
    </div>
  );
}
