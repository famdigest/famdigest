import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconCreditCard,
  IconLoader2,
} from "@tabler/icons-react";
// import { PlanCard } from "~/components/PlanCard";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Switch,
  cn,
  displayPrice,
  useToast,
} from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { useIsTeamOwner } from "~/hooks/is-team-owner";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db, eq, schema } from "~/lib/db.server";
import { useLoaderData } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { getDaysLeft } from "~/lib/dates";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";
import { getPlanFeatures } from "~/constants";

export const meta = () => {
  return [{ title: "Billing | FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const products = await db.query.billing_products.findMany({
    with: {
      billing_prices: {
        where: (bp, { eq }) => eq(bp.active, true),
      },
    },
    where: eq(schema.billing_products.active, true),
  });

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "settings:billing",
      user_id: session.get("userId"),
    },
  });

  return json({
    products,
  });
}

export default function Route() {
  const isTeamOwner = useIsTeamOwner();
  const { toast } = useToast();
  const { billing_status } = useWorkspaceLoader();
  const { products } = useLoaderData<typeof loader>();
  const [on, { toggle }] = useDisclosure(
    billing_status?.interval === "year" ? true : false
  );

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

  const productsSorted = [...products].sort((a, b) => {
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

  return (
    <div className="container max-w-screen-md sm:py-6 space-y-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif tracking-normal">
            Billing
          </CardTitle>
          <CardDescription>
            Manage your workspace subscription and billing..
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center">
          {billing_status && (
            <div>
              <p className="text-sm">
                You are on the {`${billing_status.interval}ly`}{" "}
                <strong>{billing_status?.plan_name}</strong> plan.
              </p>
              {billing_status?.status === "trialing" && (
                <p className="text-xs">
                  Your trial ends in{" "}
                  <strong>{getDaysLeft(billing_status.trial_end)}</strong> days.
                </p>
              )}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={createPortalLink}
            className="whitespace-nowrap mt-3 md:mt-0 md:ml-auto"
          >
            {checkout.isLoading ? (
              <IconLoader2 className="mr-3" size={16} />
            ) : (
              <IconCreditCard className="mr-3" size={16} />
            )}
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 flex justify-center">
          <Badge className="text-sm py-1 px-1 pr-4 bg-slate-800">
            <span className="bg-slate-600 rounded-full h-full aspect-square flex items-center justify-center mr-2 shrink-0 p-1">
              🚀
            </span>
            <span className="whitespace-nowrap text-sm">
              30% off yearly plans use code LAUNCH
            </span>
          </Badge>
        </div>
        <div className="md:col-span-2 flex items-center">
          <div>
            <p className="font-serif">Plans &amp; Pricing</p>
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-x-3">
            <Switch checked={on} onCheckedChange={toggle} />
            <p className="text-xs">Save with yearly plans</p>
          </div>
        </div>
        {productsSorted.map((product) => {
          const monthly = product.billing_prices.find(
            (bp) => bp.interval === "month"
          )!;
          const yearly = product.billing_prices.find(
            (bp) => bp.interval === "year"
          )!;
          const isSelected = billing_status?.plan_name === product.name;
          const features = getPlanFeatures(
            product.metadata as Record<string, any>
          );
          return (
            <Card className="flex flex-col" key={product.id}>
              <CardHeader className="relative">
                <div className="flex flex-row items-baseline gap-x-1.5">
                  <CardTitle className={cn(on && "line-through")}>
                    {!on
                      ? displayPrice(monthly?.unit_amount)
                      : displayPrice(yearly?.unit_amount)}
                  </CardTitle>
                  {on && (
                    <CardTitle>
                      {displayPrice((yearly?.unit_amount ?? 0) * 0.7)}
                    </CardTitle>
                  )}
                  <CardDescription>/ {on ? "year" : "month"}</CardDescription>
                </div>
                {on && (
                  <p className="absolute bottom-0 left-6 text-sm italic">
                    Get 2 Free Months
                  </p>
                )}
              </CardHeader>
              <CardContent className="mt-16 flex-1">
                <p className="font-serif text-2xl font-semibold mb-2">
                  {product.name}
                </p>
                <p>{product.description}</p>
                <ul className="mt-6 space-y-2">
                  {features.map((feature, idx) => (
                    <li className="flex items-center gap-x-2" key={idx}>
                      <IconCircleCheckFilled />
                      <p>{feature}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    checkout.mutate();
                  }}
                >
                  {isSelected ? "Manage" : "Change Plan"}
                </Button>
                {isSelected && (
                  <div className="flex items-center gap-x-1 font-serif text-sm ml-2">
                    <IconArrowLeft size={16} />
                    <p>Your Plan</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );

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
