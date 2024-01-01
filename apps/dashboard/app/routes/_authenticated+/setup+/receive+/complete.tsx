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
            <strong>Step 4</strong>: Just wait to be granted calendar access and
            your digest will be complete.
          </p>
        </div>
        <ul className="flex flex-col gap-y-4">
          <li className="flex items-center gap-x-3">
            <IconCircleCheckFilled
              size={20}
              className="ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-full"
            />
            Set up your information
          </li>
          <li className="flex items-center gap-x-3">
            <IconCircleCheckFilled
              size={20}
              className="ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-full"
            />
            Send calendar requests
          </li>
          <li className="flex items-center gap-x-2">
            <IconCircle size={20} />
            Connect to their calendars
          </li>
        </ul>

        <GetStarted />
      </div>
    </div>
  );
}
