import type { MetaFunction } from "@remix-run/node";
import { AccountForm } from "~/components/AccountForm";
import { Separator } from "@repo/ui";
import { trpc } from "~/lib/trpc";

export const meta: MetaFunction = () => {
  return [{ title: "Your Account | Carta Maps" }];
};

export default function WorkspaceDashboardSettingsAccountsRoute() {
  const { data } = trpc.users.me.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personal Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile details.
        </p>
      </div>
      <Separator />
      <div>{data && <AccountForm key={data.id} user={data} />}</div>
    </div>
  );
}
