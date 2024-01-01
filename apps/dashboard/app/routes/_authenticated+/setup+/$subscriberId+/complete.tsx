import { LoaderFunctionArgs } from "@remix-run/node";
import { convertTimeToLocalTime } from "@repo/plugins";
import { trackPageView } from "@repo/tracking";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";
import { GetStarted } from "~/components/GetStarted";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { getSession, requireAuthSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireAuthSession(request);
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:invite",
      step: "complete",
      user_id: user.id,
    },
  });
  return null;
}

export default function Route() {
  const { user } = useWorkspaceLoader();

  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="container sm:max-w-sm flex flex-col gap-y-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            You're all set!
          </h1>
          <p>
            <strong>Step 3</strong>: Your new subscriber will start receiving
            digest tomorrow.
          </p>
        </div>
        <ul className="flex flex-col gap-y-4">
          <li className="flex items-center gap-x-3">
            <IconCircleCheckFilled
              size={20}
              className="ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-full"
            />
            Connect your calendars
          </li>
          <li className="flex items-center gap-x-3">
            <IconCircleCheckFilled
              size={20}
              className="ring-2 ring-foreground ring-offset-1 ring-offset-background rounded-full"
            />
            Set up their information
          </li>
        </ul>

        <GetStarted buttonText="Continue" />
      </div>
    </div>
  );
}
