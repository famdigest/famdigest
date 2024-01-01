import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Subscriber, SubscriberCalendars, db } from "@repo/database";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/DataTable";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { Button, Separator } from "@repo/ui";
import { IconCheck, IconCirclePlus, IconX } from "@tabler/icons-react";
import { convertTimeToLocalTime } from "@repo/plugins";
import { useMemo } from "react";
import { SubscriberDropdownMenu } from "~/components/SubscriberDropdownMenu";
import { trpc } from "~/lib/trpc";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);

  const subscribers = await db.query.subscriptions.findMany({
    with: {
      subscription_calendars: {
        with: {
          calendar: true,
        },
      },
    },
    where: (table, { and, eq }) =>
      and(eq(table.owner_id, user.id), eq(table.workspace_id, workspace.id)),
  });

  return json(
    {
      subscribers,
    },
    {
      headers: response.headers,
    }
  );
}

type SubscriberTableRow = Subscriber & {
  subscription_calendars: SubscriberCalendars[];
};

export function useSubscriptionColumns() {
  return useMemo(() => {
    return [
      {
        accessorKey: "full_name",
        header: "Name",
        cell: ({ row }) => {
          const value = String(row.getValue("full_name"));
          return (
            <div className="flex space-x-2 w-[100px] hover:underline">
              <Link to={`/subscribers/${row.original.id}`}>{value}</Link>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        cell: ({ row }) => {
          const value = String(row.getValue("phone"));
          return <div className="flex space-x-2 w-[100px]">{value}</div>;
        },
      },
      {
        accessorKey: "access_code",
        header: "Access Code",
        cell: ({ row }) => {
          const value = String(row.getValue("access_code"));
          return <div className="flex space-x-2 w-[100px]">{value}</div>;
        },
      },
      {
        accessorKey: "notify_on",
        header: "Delivery",
        cell: ({ row }) => {
          const time = String(row.getValue("notify_on"));
          const timezone = row.original.timezone;
          const value = convertTimeToLocalTime(time, timezone);
          return (
            <div className="flex space-x-2 w-[100px]">
              {value.format("h:mm a")}
            </div>
          );
        },
      },
      {
        accessorKey: "opt_in",
        header: "Opted In",
        cell: ({ row }) => {
          const enabled = Boolean(row.getValue("opt_in"));
          return (
            <span>
              {enabled ? <IconCheck size={16} /> : <IconX size={16} />}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <SubscriberDropdownMenu subscriber={row.original} />
            </div>
          );
        },
      },
    ] as ColumnDef<SubscriberTableRow>[];
  }, []);
}

export default function Route() {
  const { subscribers: initialData } = useLoaderData<typeof loader>();
  const columns = useSubscriptionColumns();
  const { data: subscribers } = trpc.subscribers.all.useQuery(undefined, {
    initialData,
  });

  return (
    <div className="py-6 md:py-12 space-y-12 container max-w-screen-lg">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold font-serif">Subscribers</h2>
            <p className="text-muted-foreground">
              Manage subscribers who are receiving your daily digest
              notifications.
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-auto">
            <Button variant="outline" asChild>
              <Link to="new">
                <IconCirclePlus className="mr-2" size={20} />
                Add Subscriber
              </Link>
            </Button>
          </div>
        </header>
        <Separator />
        <DataTable columns={columns} data={subscribers} />
      </div>
    </div>
  );
}
