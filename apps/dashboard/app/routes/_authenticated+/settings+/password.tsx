import { PasswordForm } from "~/components/PasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { LoaderFunctionArgs } from "@remix-run/node";
import { trackPageView } from "@repo/tracking";
import { getSession } from "~/lib/session.server";

export const meta = () => {
  return [{ title: "Change Password | FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "settings:password",
      user_id: session.get("userId"),
    },
  });
  return null;
}

export default function Route() {
  return (
    <div className="container max-w-screen-md sm:py-6 space-y-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif tracking-normal">
            Password
          </CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
