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
} from "@repo/ui";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { getPlanFeatures } from "~/constants";

export type ProductWithPricing = Table<"billing_products"> & {
  billing_prices: Table<"billing_prices">[];
};
export function Pricing({ products }: { products: ProductWithPricing[] }) {
  const [on, { toggle }] = useDisclosure(false);

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
    <div className="container max-w-screen-xl">
      <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-end">
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
            return (
              <Card className="flex flex-col" key={product.id}>
                <CardHeader className="flex-row gap-x-1.5">
                  <CardTitle>
                    {!on
                      ? displayPrice(monthly?.unit_amount)
                      : displayPrice(yearly?.unit_amount)}
                  </CardTitle>
                  <CardDescription>/ {on ? "year" : "month"}</CardDescription>
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
                  <Button asChild>
                    <Link to="#get-notified">Get Started</Link>
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
