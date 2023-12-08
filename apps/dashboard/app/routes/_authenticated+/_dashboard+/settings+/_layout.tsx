import { Outlet } from "@remix-run/react";
import { SettingsNavigation } from "~/components/SettingsNavigation";
import { Separator } from "@repo/ui";

export default function WorkspaceDashboardSettingsLayout() {
  return (
    <div className="flex-1 space-y-6 p-8 md:p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col gap-y-8 lg:flex-row lg:gap-x-6 lg:gap-y-0">
        <aside className="lg:w-52 flex-shrink-0">
          <SettingsNavigation />
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
