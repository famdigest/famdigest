import { Outlet } from "@remix-run/react";
import { AppNavigation } from "~/components/AppNavigation";
import { SettingsNavigation } from "~/components/SettingsNavigation";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-1 relative">
      <SettingsNavigation />
      <div className="flex-1 flex flex-col">
        {/* <AppHeader /> */}
        <main id="main" className="flex-1 flex flex-col bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
