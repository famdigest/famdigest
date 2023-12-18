import { useDisclosure } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import { Table } from "@repo/supabase";
import {
  Card,
  CardHeader,
  Switch,
  CardContent,
  CardTitle,
  displayPrice,
  CardDescription,
  CardFooter,
  Button,
  Badge,
  cn,
} from "@repo/ui";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { getPlanFeatures } from "~/constants";

export type ProductWithPricing = Table<"billing_products"> & {
  billing_prices: Table<"billing_prices">[];
};
export function Pricing({ products }: { products: ProductWithPricing[] }) {
  const [on, { toggle }] = useDisclosure(true);

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
    <div id="pricing" className="container max-w-screen-xl">
      <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-end">
            <div className="p-6 pb-0">
              <Badge className="text-sm py-1 px-1 pr-4 bg-slate-800">
                <span className="bg-slate-600 rounded-full h-full aspect-square flex items-center justify-center mr-2 shrink-0 p-1">
                  🚀
                </span>
                <span className="text-sm">
                  30% off yearly plans use code LAUNCH
                </span>
              </Badge>
            </div>
            <CardHeader className="flex-row items-center space-y-0 gap-x-2">
              <Switch checked={on} onCheckedChange={toggle} />
              <p className="text-xs">Save with yearly</p>
            </CardHeader>
            <CardContent className="mt-auto p-6">
              <h2 className="text-foreground/80 font-semibold text-sm mb-8">
                Pricing
              </h2>
              <p className="font-serif text-4xl md:text-5xl font-semibold mb-4 text-slate-800">
                Simple Pricing plans
              </p>
              <p className="text-slate-700">
                Simple, transparent pricing that grows with you. Try any plan
                free for 14 days, no credit card required.
              </p>
            </CardContent>
          </Card>
          {productsSorted.map((product) => {
            const monthly = product.billing_prices.find(
              (bp) => bp.interval === "month"
            )!;
            const yearly = product.billing_prices.find(
              (bp) => bp.interval === "year"
            )!;
            const features = getPlanFeatures(
              product.metadata as Record<string, any>
            );
            const popular =
              (product.metadata as Record<string, any>)?.slug === "you-yours";
            return (
              <Card
                className={cn(
                  "flex flex-col relative",
                  popular && "border-primary"
                )}
                key={product.id}
              >
                {popular && (
                  <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    Most Popular
                  </Badge>
                )}
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
                  <Button asChild shape="pill">
                    <Link to="https://app.famdigest.com/sign-up">
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
