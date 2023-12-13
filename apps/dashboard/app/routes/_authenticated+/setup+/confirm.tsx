import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button, Separator } from "@repo/ui";
import { convertToLocal } from "~/lib/dates";
import { and, asc, db, desc, eq, schema } from "~/lib/db.server";
import { requireAuthSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const calendars = await db.query.calendars.findMany({
    where: and(
      eq(schema.calendars.owner_id, user.id),
      eq(schema.calendars.enabled, true)
    ),
    orderBy: asc(schema.calendars.created_at),
  });

  const digests = await db.query.digests.findMany({
    where: eq(schema.digests.owner_id, user.id),
    orderBy: desc(schema.digests.created_at),
  });

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

export default function Route() {
  const { calendars, digests } = useLoaderData<typeof loader>();

  return (
    <div className="flex-1 flex py-20 items-start justify-center overflow-hidden">
      <div className="container max-w-screen-md">
        <div className="grid grid-cols-4 gap-x-3 mb-12">
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
        </div>

        <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
          <p className="text-xl md:text-2xl">Calendars</p>
          <div className="space-y-4 mt-6">
            {calendars.map((calendar, idx) => (
              <div key={idx} className="flex items-center">
                <div className="space-y-0.5">
                  <p className="text-base font-medium">
                    {calendar.external_id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Separator className="bg-foreground my-12" />
        <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
          <p className="text-xl md:text-2xl">Digests</p>
          <div className="space-y-4 mt-6">
            {digests.map((digest, idx) => (
              <div key={idx} className="flex items-center">
                <div className="space-y-0.5">
                  <p className="text-base font-medium">{digest.full_name}</p>
                  <div className="text-sm flex items-center gap-x-1.5">
                    {digest.phone} /{" "}
                    {convertToLocal(digest.notify_on).format("h:mm a")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center animate-in duration-500 fade-in-0 slide-in-from-bottom-4 mt-12">
          <p className="text-xl md:text-2xl mb-3">🎉 You're all set!</p>
          <Button>
            <Link to="/">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
