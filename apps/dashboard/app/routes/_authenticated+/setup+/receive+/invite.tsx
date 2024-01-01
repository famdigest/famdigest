import { LoaderFunctionArgs } from "@remix-run/node";
import { trackPageView } from "@repo/tracking";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { z } from "zod";
import { Invitation } from "~/components/Setup/Invitation";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireAuthSession(request);
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:receive",
      step: "invite",
      user_id: user.id,
    },
  });
  return null;
}

export default function Route() {
  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="container sm:max-w-sm flex flex-col gap-y-10">
        <div className="">
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            Welcome to FamDigest
          </h1>
          <p>
            <strong>Step 2</strong>: Send your unique code to request calendar
            access or invite friends and family.
          </p>
        </div>

        <Invitation
          redirectUri="/setup/receive/complete"
          request_type="calendar"
        />
      </div>
    </div>
  );
}
