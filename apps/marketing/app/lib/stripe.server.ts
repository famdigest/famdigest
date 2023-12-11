import Stripe from "stripe";
import dayjs from "dayjs";
import { createAdminClient } from "@repo/supabase";

enum BILLING_PROVIDERS {
  stripe = "stripe",
}

const supabaseAdmin = createAdminClient();

export const stripe = new Stripe(process.env.PRIVATE_STRIPE_KEY!, {
  apiVersion: "2023-10-16",
});

/**
 * Products are defined in stripe, this handler takes a stripe product and
 * makes sure we have a local copy for pricing pages
 * @param product Stripe product object
 */
export const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_products")
    .upsert([productData]);
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};

/**
 * Prices are defined in stripe and connected to a product
 * Products typically have 1-2 prices assigned to them, but can have unlimited
 * @param price
 */
export const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData = {
    id: price.id,
    billing_product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_prices")
    .upsert([priceData]);
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

/**
 * This is the customer object inside of stripe. It should map 1:1 with accounts in most cases
 * It does NOT map back to users
 * @param customer
 * @param workspace_id
 */
export const upsertCustomerRecord = async (
  customer: Stripe.Customer,
  workspace_id?: string
) => {
  const customerData = {
    workspace_id: workspace_id || customer.metadata.workspace_id,
    customer_id: customer.id,
    email: customer.email,
    provider: BILLING_PROVIDERS.stripe,
  };

  if (!customerData.workspace_id) {
    // @todo add the workspace_id to stripe
    return;
  }

  const { error } = await supabaseAdmin
    .from("billing_customers")
    .upsert([customerData]);
  if (error) throw error;
  console.log(`Customer inserted/updated: ${customer.id}`);
};

/**
 * Convenience function that checks if a stripe customer with a given email address already exists
 * in our database. If it doesn't, it creates a new one
 * @param workspace_id
 */
export const createOrRetrieveCustomer = async ({
  workspace_id,
  email,
}: {
  workspace_id: string;
  email: string;
}) => {
  const { data, error } = await supabaseAdmin
    .from("billing_customers")
    .select("customer_id")
    .eq("workspace_id", workspace_id)
    .single();
  if (error) {
    // No customer record found, let's create one.
    const customerData: { metadata: { workspace_id: string }; email?: string } =
      {
        metadata: {
          workspace_id: workspace_id,
        },
      };

    if (email) {
      customerData.email = email;
    }
    const customer = await stripe.customers.create(customerData);
    // now we upsert the customer record. Upsert b/c the stripe webhook also hits this and so there could be
    // a race condition
    await upsertCustomerRecord(customer, workspace_id);
    console.log(`New customer created and inserted for ${workspace_id}.`);
    return customer.id;
  }
  if (data) return data.customer_id;
};

/**
 * Takes a stripe subscription object and upserts it into our database
 * @param subscription Stripe.Subscription
 * @param workspace_id string
 */
export const upsertSubscriptionRecord = async (
  subscription: Stripe.Subscription,
  workspace_id: string
) => {
  const subscriptionData = {
    id: subscription.id,
    workspace_id: workspace_id,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? dayjs.unix(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? dayjs.unix(subscription.canceled_at).toISOString()
      : null,
    current_period_start: dayjs
      .unix(subscription.current_period_start)
      .toISOString(),
    current_period_end: dayjs
      .unix(subscription.current_period_end)
      .toISOString(),
    created: dayjs.unix(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? dayjs.unix(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? dayjs.unix(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? dayjs.unix(subscription.trial_end).toISOString()
      : null,
    provider: BILLING_PROVIDERS.stripe,
  };

  const { error } = await supabaseAdmin
    .from("billing_subscriptions")
    .upsert(subscriptionData);
  if (error) throw error;
  console.log(
    `Inserted/updated subscription [${subscription.id}] for account [${workspace_id}]`
  );
};

/**
 * Subscriptions are the primary tracking for an accounts status within the app.
 * This takes a stripe subscription event and upserts it into our database so that
 * we have a local version of an accounts current status
 * @param subscriptionId
 * @param customerId
 * @param accountCreated Is this an account created event?
 */
export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("billing_customers")
    .select("workspace_id")
    .eq("customer_id", customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  // Upsert the latest status of the subscription object.
  await upsertSubscriptionRecord(subscription, customerData.workspace_id);
};
