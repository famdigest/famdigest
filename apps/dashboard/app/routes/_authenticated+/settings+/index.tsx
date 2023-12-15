import { WorkspaceForm } from "~/components/WorkspaceForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";

export const meta = () => {
  return [
    { title: "Settings | FamDigest" },
    {
      property: "og:title",
      content: "Settings | FamDigest",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "settings",
      user_id: session.get("userId"),
    },
  });
  return null;
}

export default function WorkspaceDashboardSettingsRoute() {
  const { workspace } = useWorkspaceLoader();

  return (
    <div className="container max-w-screen-md sm:py-6 space-y-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif tracking-normal">
            Workspace Settings
          </CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <WorkspaceForm key={workspace.id} workspace={workspace} />
        </CardContent>
      </Card>
    </div>
  );
}
