import { WorkspaceForm } from "~/components/WorkspaceForm";
import { Separator } from "@repo/ui";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

export const meta = () => {
  return [{ title: "Settings | Carta Maps" }];
};

export default function WorkspaceDashboardSettingsRoute() {
  const { workspace } = useWorkspaceLoader();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Workspace Settings</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <div>
        <WorkspaceForm key={workspace.id} workspace={workspace} />
      </div>
    </div>
  );
}
