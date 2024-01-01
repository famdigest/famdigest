import { LoaderFunctionArgs } from "@remix-run/node";
import { trackPageView } from "@repo/tracking";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";
import { GetStarted } from "~/components/GetStarted";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:send",
      step: "complete",
      user_id: session.get("userId"),
    },
  });
  return null;
}

export default function Route() {
  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="container sm:max-w-sm flex flex-col gap-y-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            You're all set!
          </h1>
          <p>
            <strong>Step 4</strong>: Let them know they will be getting a
            message to opt-in.
          </p>
        </div>
        <ul className="flex flex-col gap-y-4">
          <li className="flex items-center gap-x-3">
            <IconCircleCheckFilled
              size={20}
              className="ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-full"
            />
            Connect your calendar
          </li>
          <li className="flex items-center gap-x-3">
            <IconCircleCheckFilled
              size={20}
              className="ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-full"
            />
            Add your first subscriber
          </li>
          <li className="flex items-center gap-x-2">
            <IconCircle size={20} />
            Have them opt-in to your daily digest
          </li>
        </ul>

        <GetStarted />
      </div>
    </div>
  );
}
