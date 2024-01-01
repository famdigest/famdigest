import { Link, useNavigate, useRevalidator } from "@remix-run/react";
import { Button, Card, CardContent, CardTitle, toast } from "@repo/ui";
import { IconArrowRight, IconLoader2 } from "@tabler/icons-react";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { trpc } from "~/lib/trpc";

export function GetStarted({ buttonText }: { buttonText?: string }) {
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { billing_status } = useWorkspaceLoader();
  const { data, isLoading } = trpc.billing.plans.useQuery();
  const createSubscription = trpc.billing.createSubscription.useMutation({
    onSuccess() {
      toast({
        title: "Your trial has started",
      });
      revalidator.revalidate();
      setTimeout(() => {
        // hard reload
        window.location.href = window.location.origin;
      }, 500);
    },
    onError(error) {
      toast({
        title: "Sorry",
        description: error?.message ?? "Internal error",
      });
    },
  });

  const start = () => {
    if (!data?.length) return;
    if (billing_status) {
      return navigate("/");
    }
    const productsSorted = [...data].sort((a, b) => {
      const aPrice = a.billing_prices.reduce(
        (prev, curr) =>
          prev && prev.unit_amount! < curr.unit_amount! ? prev : curr,
        a.billing_prices[0]
      );
      const bPrice = b.billing_prices.reduce(
        (prev, curr) =>
          prev && prev.unit_amount! < curr.unit_amount! ? prev : curr,
        b.billing_prices[0]
      );
      return aPrice.unit_amount! - bPrice.unit_amount!;
    });
    const cheapest = productsSorted[0].billing_prices.find(
      (bp) => bp.interval === "month"
    );

    createSubscription.mutate({
      price_id: cheapest!.id,
    });
  };

  return (
    <Card>
      <CardContent className="p-8 flex flex-col justify-center items-center text-center">
        <CardTitle className="mb-6">Calendar Communication Made Easy</CardTitle>
        <Button
          size="lg"
          className="rounded-full"
          disabled={isLoading || createSubscription.isLoading}
          onClick={start}
        >
          {createSubscription.isLoading && (
            <IconLoader2 className="animate-spin mr-2" size={20} />
          )}
          {buttonText ? buttonText : "Get Started for Free"}
        </Button>
        <p className="text-xs mt-2 text-muted-foreground">
          14 day free trial.
          <br />
          No Credit Card required
        </p>
        <Link
          to="https://www.famdigest.com/#pricing"
          className="text-xs text-muted-foreground underline flex items-center justify-center gap-x-2"
          target="_blank"
          rel="noreferrer"
        >
          Learn about our pricing
          <IconArrowRight size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}
