import { Outlet } from "@remix-run/react";
import { AppBottomBar, AppNavigation } from "~/components/AppNavigation";
import { SubscriptionBanner } from "~/components/SubscriptionBanner";

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
      <div className="flex-1 flex flex-col max-w-full overflow-x-hidden">
        <SubscriptionBanner />
        <main
          id="main"
          className="flex-1 flex flex-col bg-background mb-24 md:mb-0"
        >
          <Outlet />
        </main>
      </div>
      <AppBottomBar />
    </div>
  );
}
