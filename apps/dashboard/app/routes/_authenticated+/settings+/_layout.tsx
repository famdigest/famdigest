import { Outlet } from "@remix-run/react";
import { AppBottomBar, AppNavigation } from "~/components/AppNavigation";
import {
  SettingsNavMobile,
  SettingsNavigation,
} from "~/components/SettingsNavigation";

export default function Layout() {
  return (
    <div className="flex min-h-[100svh] flex-1 relative">
      <SettingsNavigation />
      <div className="flex-1 flex flex-col">
        <SettingsNavMobile />
        <main id="main" className="flex-1 flex flex-col bg-background">
          <Outlet />
        </main>
      </div>
      <AppBottomBar />
    </div>
  );
}
