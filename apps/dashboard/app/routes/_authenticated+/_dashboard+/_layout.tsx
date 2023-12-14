import { Outlet } from "@remix-run/react";
import { cn } from "@repo/ui";
import dayjs from "dayjs";
import { AppHeader } from "~/components/AppHeader";
import { AppBottomBar, AppNavigation } from "~/components/AppNavigation";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

export const meta = () => {
  return [
    {
      property: "og:image",
      content: "/social/open-graph.jpg",
    },
  ];
};

export default function WorkspaceDashboardLayout() {
  const { billing_status } = useWorkspaceLoader();

  const getDaysLeft = (end: string | null) => {
    if (!end) return "";
    const diff = dayjs().diff(dayjs(end), "days");
    return Math.abs(diff);
  };

  return (
    <div className="flex min-h-[100svh] flex-1 relative">
      <AppNavigation />
      <div className="flex-1 flex flex-col">
        {billing_status.status !== "active" && (
          <div
            className={cn(
              "h-12 w-full flex items-center justify-center",
              billing_status.status === "trialing"
                ? "bg-foreground text-white"
                : "bg-red-200"
            )}
          >
            <div className="container text-center text-sm">
              {billing_status.status === "trialing"
                ? `You have ${getDaysLeft(
                    billing_status.trial_end
                  )} left in your trial.`
                : "Your trial has ended. Upgrade to keep sending digest."}
            </div>
          </div>
        )}
        <main id="main" className="flex-1 flex flex-col bg-background">
          <Outlet />
        </main>
      </div>
      <AppBottomBar />
    </div>
  );
}
