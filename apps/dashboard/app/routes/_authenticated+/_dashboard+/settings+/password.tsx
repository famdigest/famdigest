import { PasswordForm } from "~/components/PasswordForm";
import { Separator } from "@repo/ui";

export const meta = () => {
  return [{ title: "Change Password | Carta Maps" }];
};

export default function WorkspaceDashboardSettingsAccountsPasswordRoute() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">Update your password.</p>
      </div>
      <Separator />
      <div>
        <PasswordForm />
      </div>
    </div>
  );
}
