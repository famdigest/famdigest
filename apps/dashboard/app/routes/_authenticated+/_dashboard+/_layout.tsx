import { Outlet } from "@remix-run/react";
import { AppHeader } from "~/components/AppHeader";
import { AppBottomBar, AppNavigation } from "~/components/AppNavigation";

export const meta = () => {
  return [
    {
      property: "og:image",
      content: "/social/open-graph.jpg",
    },
  ];
};

export default function WorkspaceDashboardLayout() {
  return (
    <div className="flex min-h-[100svh] flex-1 relative">
      <AppNavigation />
      <div className="flex-1 flex flex-col">
        {/* <AppHeader /> */}
        <main id="main" className="flex-1 flex flex-col bg-background">
          <Outlet />
        </main>
      </div>
      <AppBottomBar />
    </div>
  );
}
