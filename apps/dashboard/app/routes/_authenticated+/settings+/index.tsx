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

export const meta = () => {
  return [
    { title: "Settings | FamDigest" },
    {
      property: "og:title",
      content: "Settings | FamDigest",
    },
  ];
};

export default function WorkspaceDashboardSettingsRoute() {
  const { workspace } = useWorkspaceLoader();

  return (
    <div className="container max-w-screen-md p-6 md:p-12 space-y-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Workspace Settings</CardTitle>
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
