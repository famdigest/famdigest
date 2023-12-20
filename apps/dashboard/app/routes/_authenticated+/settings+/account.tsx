import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { AccountForm } from "~/components/AccountForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { trackPageView } from "@repo/tracking";
import { getSession } from "~/lib/session.server";
import { IconLoader2 } from "@tabler/icons-react";

export const meta: MetaFunction = () => {
  return [{ title: "Your Account | FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "settings:account",
      user_id: session.get("userId"),
    },
  });
  return null;
}

export default function Route() {
  const { data } = trpc.users.me.useQuery();

  return (
    <div className="container max-w-screen-md sm:py-6 space-y-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif tracking-normal">
            Personal Settings
          </CardTitle>
          <CardDescription>Manage your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data ? (
            <AccountForm key={data.id} user={data} />
          ) : (
            <div className="flex items-center justify-center h-20 bg-muted border">
              <IconLoader2 className="animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
