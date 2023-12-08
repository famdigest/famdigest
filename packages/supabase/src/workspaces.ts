import type Stripe from "stripe";
import type { Table } from "./helpers";

export type Workspace = Table<"workspaces"> & {
  workspace_users: Table<"workspace_users">[];
};

export enum WORKSPACE_ROLES {
  owner = "owner",
  member = "member",
}

export type WorkspaceBillingStatus = {
  id: string;
  status: Stripe.Subscription.Status;
  billing_email: string;
  plan_name: string;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  interval: Stripe.Price.Recurring.Interval;
  amount: number;
};
