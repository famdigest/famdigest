import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { and, db, desc, eq, schema } from "~/lib/db.server";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from "@repo/ui";
import { requireAuthSession } from "~/lib/session.server";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import {
  IconCalendar,
  IconChevronRight,
  IconMessage,
} from "@tabler/icons-react";
import { AppFab } from "~/components/AppFab";

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
  const { user, response } = await requireAuthSession(request);

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

  const digests = await db
    .select()
    .from(schema.digests)
    .where(
      and(
        eq(schema.digests.owner_id, user.id),
        eq(schema.digests.enabled, true)
      )
    )
    .orderBy(desc(schema.digests.created_at));

  return json(
    {
      user,
      calendars,
      digests,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Index() {
  const { user, calendars, digests } = useLoaderData<typeof loader>();
  const { workspace } = useWorkspaceLoader();

  return (
    <div className="py-6 md:py-12 space-y-12 md:space-y-24">
      <div className="flex items-center gap-x-4 container max-w-screen-lg">
        <Avatar className="">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url}></AvatarImage>
          ) : (
            <AvatarFallback className="uppercase bg-background">
              {user.email?.substring(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold font-serif">
            Hello, {user.full_name}!
          </h1>
          <p className="text-sm lg:text-base">{workspace.name}</p>
        </div>
        <div className="absolute bottom-24 right-6 md:relative md:bottom-auto md:right-auto md:ml-auto">
          <AppFab />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 container max-w-screen-md">
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
              <Link to="/digests" className="absolute inset-0">
                <span className="sr-only">Contacts</span>
              </Link>
              <IconMessage />
              <p className="font-medium text-sm">Contacts ({digests.length})</p>
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
              <IconCalendar />
              <p className="font-medium text-sm">
                Plan (Free Trial - <i>expired</i>)
              </p>
              <IconChevronRight className="ml-auto" />
            </div>
            <div className="border rounded-lg p-4 relative flex items-center gap-x-4">
              <Link to="/settings" className="absolute inset-0">
                <span className="sr-only">Settings</span>
              </Link>
              <IconMessage />
              <p className="font-medium text-sm">Settings</p>
              <IconChevronRight className="ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
