import { LoaderFunctionArgs } from "@remix-run/node";
import { trackPageView } from "@repo/tracking";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { UserDigest } from "~/components/Setup/UserDigest";
import { useNavigate } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireAuthSession(request);
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:receive",
      step: "digest",
      user_id: user.id,
    },
  });

  return null;
}

export default function Route() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="container sm:max-w-sm flex flex-col gap-y-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            Welcome to FamDigest
          </h1>
          <p>
            <strong>Step 1</strong>: Fill in the below information about
            yourself.
          </p>
        </div>

        <UserDigest onSuccess={() => navigate("invite")} />
      </div>
    </div>
  );
}
