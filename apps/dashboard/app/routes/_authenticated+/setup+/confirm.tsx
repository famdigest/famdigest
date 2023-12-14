import { useDisclosure } from "@mantine/hooks";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Switch,
  displayPrice,
  toast,
} from "@repo/ui";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { convertToLocal } from "~/lib/dates";
import { and, asc, db, desc, eq, schema } from "~/lib/db.server";
import { requireAuthSession } from "~/lib/session.server";
import { trpc } from "~/lib/trpc";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const calendars = await db.query.calendars.findMany({
    where: and(
      eq(schema.calendars.owner_id, user.id),
      eq(schema.calendars.enabled, true)
    ),
    orderBy: asc(schema.calendars.created_at),
  });

  const digests = await db.query.digests.findMany({
    where: eq(schema.digests.owner_id, user.id),
    orderBy: desc(schema.digests.created_at),
  });

  const products = await db.query.billing_products.findMany({
    with: {
      billing_prices: true,
    },
    where: eq(schema.billing_products.active, true),
  });

  return json(
    {
      user,
      calendars,
      digests,
      products,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { calendars, digests, products } = useLoaderData<typeof loader>();
  const [on, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();
  const createSubscription = trpc.billing.createSubscription.useMutation({
    onSuccess() {
      toast({
        title: "Your trial has started",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    },
    onError(error) {
      toast({
        title: "Sorry",
        description: error?.message ?? "Internal error",
      });
    },
  });

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
    <div className="flex-1 flex flex-col py-20 items-start justify-center overflow-hidden">
      <div className="container max-w-screen-md">
        <div className="grid grid-cols-4 gap-x-3 mb-12">
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
        </div>
      </div>

      <div className="container max-w-screen-md">
        <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-semibold">
                  Calendars
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {calendars.map((calendar, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="space-y-0.5">
                        <p className="text-base font-medium">
                          {calendar.external_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif font-semibold">
                  Digests
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {digests.map((digest, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="space-y-0.5">
                        <p className="text-base font-medium">
                          {digest.full_name}
                        </p>
                        <div className="text-sm flex items-center gap-x-1.5">
                          {digest.phone} /{" "}
                          {convertToLocal(digest.notify_on).format("h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container max-w-screen-lg">
        <Separator className="my-12 bg-foreground/50" />
      </div>

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
                <p className="font-serif text-4xl font-semibold mb-4">
                  Simple Pricing plans
                </p>
                <p>
                  Simple, transparent pricing that grows with you. Try any plan
                  free for 7 days, no credit card required.
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
                      <li className="flex items-center gap-x-2">
                        <IconCircleCheckFilled />
                        <p>Unlimited Calendars</p>
                      </li>
                      <li className="flex items-center gap-x-2">
                        <IconCircleCheckFilled />
                        <p>1 connected contact</p>
                      </li>
                      <li className="flex items-center gap-x-2">
                        <IconCircleCheckFilled />
                        <p>Daily texts</p>
                      </li>
                      <li className="flex items-center gap-x-2">
                        <IconCircleCheckFilled />
                        <p>Customizable delivery times</p>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        createSubscription.mutate({
                          price_id: on ? yearly.id : monthly.id,
                        });
                      }}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container max-w-screen-md">
        <div className="flex flex-col items-center justify-center animate-in duration-500 fade-in-0 slide-in-from-bottom-4 mt-12">
          <p className="text-xl md:text-2xl mb-3">
            🎉 Choose a plan to get started.
          </p>
          {/* <Button>
            <Link to="/">Go to Dashboard</Link>
          </Button> */}
        </div>
      </div>
    </div>
  );
}
