import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type Stripe from "stripe";
import {
  manageSubscriptionStatusChange,
  stripe,
  upsertCustomerRecord,
  upsertPriceRecord,
  upsertProductRecord,
} from "~/lib/stripe.server";

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.created",
  "customer.updated",
  "customer.deleted",
]);

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    throw new Response("", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.PRIVATE_STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.log(err);
    console.log(`⚠️  Webhook signature verification failed.`);
    console.log(`⚠️  Check the env file and enter the correct webhook secret.`);
    throw new Response("", { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "customer.created":
        case "customer.updated":
        case "customer.deleted":
          await upsertCustomerRecord(event.data.object as Stripe.Customer);
          break;
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string
          );
          break;
        case "customer.subscription.trial_will_end":
          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string
            );
          }
          break;
        default:
          break;
      }
    } catch (error) {
      throw new Response("", {
        status: 400,
        statusText: 'Webhook error: "Webhook handler failed. View logs."',
      });
    }

    return json({
      status: "OK",
    });
  }

  return json({
    status: "OK",
  });
}
