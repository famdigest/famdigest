import { Outlet } from "@remix-run/react";
import { AppHeader } from "~/components/AppHeader";
import { AppNavigation } from "~/components/AppNavigation";

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
    <div className="flex min-h-screen flex-1 relative">
      <AppNavigation />
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <main
          id="main"
          className="flex-1 flex flex-col border-l border-t rounded-tl-2xl bg-muted/50"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
