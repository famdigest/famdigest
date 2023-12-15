import { z } from "zod";
import {
  createOrRetrieveCustomer,
  stripe,
  upsertSubscriptionRecord,
} from "~/lib/stripe.server";
import {
  workspaceProcedure,
  router,
  protectedProcedure,
} from "~/server/trpc.server";
import { WORKSPACE_ROLES, type WorkspaceBillingStatus } from "@repo/supabase";
import { people, track } from "@repo/tracking";
import { db, eq, schema } from "~/lib/db.server";

export const billingRouter = router({
  status: workspaceProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase.rpc("get_workspace_billing_status", {
      lookup_workspace_id: ctx.workspace.id,
    });
    if (!data) return null;
    return data as WorkspaceBillingStatus;
  }),
  plans: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("billing_products")
      .select("*, billing_prices(*)")
      .match({ active: true })
      .neq("name", "Free")
      .order("name");
    if (error) throw error;
    return data;
  }),
  portal: workspaceProcedure.mutation(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("workspace_users")
      .select()
      .match({
        workspace_id: ctx.workspace.id,
        user_id: ctx.user.id,
      })
      .single();
    if (error) throw error;
    if (data.role !== WORKSPACE_ROLES.owner) {
      throw new Error("Only owners can manage subscriptions");
    }
    const customer = await createOrRetrieveCustomer({
      workspace_id: ctx.workspace.id as string,
      email: ctx.user.email || "",
    });
    if (!customer) throw Error("Could not get customer");
    const { origin } = new URL(ctx.req.url);
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url:
        ctx.req.headers.get("referer") ?? `${origin}/settings/billing`,
    });
    return { url };
  }),
  createSubscription: workspaceProcedure
    .input(
      z.object({
        price_id: z.string(),
        success_url: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("workspace_users")
        .select()
        .match({
          workspace_id: ctx.workspace.id,
          user_id: ctx.user.id,
        })
        .single();
      if (error) throw error;
      if (data.role !== WORKSPACE_ROLES.owner) {
        throw new Error("Only owners can manage subscriptions");
      }
      const customer = await createOrRetrieveCustomer({
        workspace_id: ctx.workspace.id as string,
        email: ctx.user.email || "",
      });
      if (!customer) throw Error("Could not get or create customer");

      const price = await db.query.billing_prices.findFirst({
        where: eq(schema.billing_prices.id, input.price_id),
        with: {
          billing_product: true,
        },
      });

      const res = await stripe.subscriptions.create({
        customer,
        items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: input.price_id, //"{{PRICE_ID}}",
            quantity: 1,
          },
        ],
        trial_period_days: 14,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
      });
      if (res) {
        await upsertSubscriptionRecord(res, ctx.workspace.id, ctx.req);
        track({
          request: ctx.req,
          properties: {
            event_name: "Subscription Created",
            device_id: ctx.session.id,
            user_id: ctx.user.id,
            product: price?.billing_product?.name,
            inteval: price?.interval,
          },
        });
      }
      return res;
    }),
  checkout: workspaceProcedure
    .input(
      z.object({
        price_id: z.string(),
        is_free: z.boolean().default(false),
        success_url: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("workspace_users")
        .select()
        .match({
          workspace_id: ctx.workspace.id,
          user_id: ctx.user.id,
        })
        .single();
      if (error) throw error;
      if (data.role !== WORKSPACE_ROLES.owner) {
        throw new Error("Only owners can manage subscriptions");
      }
      const customer = await createOrRetrieveCustomer({
        workspace_id: ctx.workspace.id as string,
        email: ctx.user.email || "",
      });
      if (!customer) throw Error("Could not get or create customer");
      const { origin } = new URL(ctx.req.url);

      const { url } = await stripe.checkout.sessions.create({
        customer,
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: input.price_id, //"{{PRICE_ID}}",
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: input.success_url ?? `${origin}/welcome`,
        cancel_url: `${origin}/subscribe?canceled=true`,
        ...(input.is_free
          ? {
              payment_method_collection: "if_required",
            }
          : {
              subscription_data: {
                trial_period_days: 7,
              },
              allow_promotion_codes: true,
            }),
      });

      track({
        request: ctx.req,
        properties: {
          event_name: "PortalLink Created",
          device_id: ctx.session.id,
          user_id: ctx.user.id,
        },
      });
      return { url };
    }),
});
