import { IconCreditCard, IconLoader2 } from "@tabler/icons-react";
// import { PlanCard } from "~/components/PlanCard";
import { Button, Separator, useToast } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { useIsTeamOwner } from "~/hooks/is-team-owner";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

export const meta = () => {
  return [{ title: "Billing | Carta Maps" }];
};

export default function WorkspaceDashboardSettingsBillingRoute() {
  const isTeamOwner = useIsTeamOwner();
  const { toast } = useToast();
  const { billing_status: status } = useWorkspaceLoader();
  const { data: products } = trpc.billing.plans.useQuery();

  const checkout = trpc.billing.portal.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const createPortalLink = () => {
    // track
    if (!isTeamOwner) {
      toast({
        title: "Sorry",
        description:
          "Only workspace owners/admins can update workspace settings.",
      });
      return;
    }
    checkout.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-medium">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Manage your workspace subscription and billing.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={createPortalLink}>
          {checkout.isLoading ? (
            <IconLoader2 className="mr-3" size={16} />
          ) : (
            <IconCreditCard className="mr-3" size={16} />
          )}
          Manage Subscription
        </Button>
      </div>
      <Separator />
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products?.map((product, idx) => {
          const prev = products[idx - 1]?.name ?? null;
          // const price_ids = product.billing_prices.map((bp) => bp.id);
          const selected = status?.plan_name === product.name;
          return (
            <PlanCard
              key={product.id}
              featured={idx === 1}
              product={product}
              prev={prev}
              selected={selected}
              selectPrice={createPortalLink}
              isLoading={checkout.isLoading}
            />
          );
        })}
      </div> */}
    </div>
  );
}
