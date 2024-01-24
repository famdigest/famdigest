import { Link } from "@remix-run/react";
import { Button, cn } from "@repo/ui";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { getDaysLeft } from "~/lib/dates";

export function SubscriptionBanner() {
  const { billing_status } = useWorkspaceLoader();

  if (!billing_status) return null;
  if (billing_status.status === "active") return null;

  return (
    <div
      className={cn(
        "h-12 w-full flex items-center justify-center",
        billing_status.status === "trialing"
          ? "bg-foreground text-background"
          : "bg-red-200"
      )}
    >
      <div className="container text-center justify-center text-sm flex items-center gap-x-2">
        {billing_status.status === "trialing"
          ? `You have ${getDaysLeft(
              billing_status.trial_end
            )} days left in your trial.`
          : "Your trial has ended. Upgrade to keep sending digest."}
        {billing_status.status !== "trialing" && (
          <Button size="xs" asChild>
            <Link to="/settings/billing">Upgrade</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
