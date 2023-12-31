import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { and, db, desc, eq, schema } from "@repo/database";
import { Avatar, AvatarFallback, AvatarImage, cn } from "@repo/ui";
import { getSession } from "~/lib/session.server";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import {
  IconCalendar,
  IconChevronRight,
  IconSettings,
  IconUserBolt,
  IconWallet,
} from "@tabler/icons-react";
import { AppFab } from "~/components/AppFab";
import dayjs from "dayjs";
import { useMemo } from "react";
import { trackPageView } from "@repo/tracking";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";

export const meta: MetaFunction = () => {
  return [
    { title: "FamDigest - Never use a shared calendar again" },
    {
      property: "og:title",
      content: "FamDigest - Never use a shared calendar again",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);

  const calendars = await db
    .select()
    .from(schema.calendars)
    .innerJoin(
      schema.connections,
      eq(schema.calendars.connection_id, schema.connections.id)
    )
    .where(
      and(
        eq(schema.calendars.owner_id, user.id),
        eq(schema.calendars.enabled, true)
      )
    )
    .orderBy(desc(schema.calendars.created_at));

  const subscribers = await db.query.subscriptions.findMany({
    where: (table, { eq }) => eq(table.owner_id, user.id),
    with: {
      subscription_calendars: {
        with: {
          calendar: true,
        },
      },
    },
  });

  const subscriptions = await db.query.subscriptions.findMany({
    where: (table, { eq }) => eq(table.user_id, user.id),
    with: {
      subscription_calendars: {
        with: {
          calendar: true,
        },
      },
    },
  });

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "dashboard",
      user_id: session.get("userId"),
    },
  });

  return json(
    {
      user,
      calendars,
      subscribers,
      subscriptions,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Index() {
  const {
    user: initialUser,
    calendars,
    subscribers,
    subscriptions,
  } = useLoaderData<typeof loader>();
  const { workspace, billing_status } = useWorkspaceLoader();

  const { data: user } = trpc.users.me.useQuery(undefined, {
    initialData: initialUser,
  });

  const planMessage = useMemo(() => {
    if (!billing_status) return "";
    if (billing_status.status === "trialing") {
      const diff = Math.abs(
        billing_status.trial_end
          ? dayjs().diff(dayjs(billing_status.trial_end), "days")
          : 0
      );
      return `Trial (${diff} days left)`;
    }
    if (billing_status.status !== "active") {
      return "Your trial has ended";
    }
  }, [billing_status]);

  return (
    <div className="flex-1 py-6 md:py-12 relative space-y-12">
      <header
        className={cn("flex items-center gap-x-4 container max-w-screen-lg")}
      >
        <Avatar className="">
          {user?.avatar_url ? (
            <AvatarImage src={user?.avatar_url}></AvatarImage>
          ) : (
            <AvatarFallback className="uppercase bg-muted border select-none">
              {user?.email?.substring(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold font-serif">
            Hello, {user?.full_name ?? "fam"}!
          </h1>
          <p className="text-sm lg:text-base">{workspace.name}</p>
        </div>
        <div className="absolute bottom-0 right-6 md:relative md:bottom-auto md:right-auto md:ml-auto">
          <AppFab />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 container max-w-screen-lg">
        <div>
          <h2 className="text-foreground/80 font-semibold text-sm mb-3">
            Daily Digest
          </h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4 relative flex items-center gap-x-4">
              <Link to="/calendars" className="absolute inset-0">
                <span className="sr-only">Calendars</span>
              </Link>
              <IconCalendar />
              <p className="font-medium text-sm">
                Calendars ({calendars.length})
              </p>
              <IconChevronRight className="ml-auto" />
            </div>
            <div className="border rounded-lg p-4 relative flex items-center gap-x-4">
              <Link to="/subscribers" className="absolute inset-0">
                <span className="sr-only">subscribers</span>
              </Link>
              <IconUserBolt />
              <p className="font-medium text-sm">
                Subscribers ({subscribers.length})
              </p>
              <IconChevronRight className="ml-auto" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-foreground/80 font-semibold text-sm mb-3">
            Account
          </h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4 relative flex items-center gap-x-4">
              <Link to="/settings/billing" className="absolute inset-0">
                <span className="sr-only">Plan</span>
              </Link>
              <IconWallet />
              <div className="flex items-end gap-x-1.5">
                <p className="font-medium text-sm">
                  {billing_status?.plan_name}
                </p>
                <p className="text-xs">{planMessage}</p>
              </div>
              <IconChevronRight className="ml-auto" />
            </div>
            <div className="border rounded-lg p-4 relative flex items-center gap-x-4">
              <Link to="/settings" className="absolute inset-0">
                <span className="sr-only">Settings</span>
              </Link>
              <IconSettings />
              <p className="font-medium text-sm">Settings</p>
              <IconChevronRight className="ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
