import type { MetaFunction } from "@remix-run/node";
import { AccountForm } from "~/components/AccountForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { trpc } from "~/lib/trpc";

export const meta: MetaFunction = () => {
  return [{ title: "Your Account | FamDigest" }];
};

export default function WorkspaceDashboardSettingsAccountsRoute() {
  const { data } = trpc.users.me.useQuery();

  return (
    <div className="container max-w-screen-md p-6 md:p-12 space-y-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif tracking-normal">
            Personal Settings
          </CardTitle>
          <CardDescription>Manage your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data && <AccountForm key={data.id} user={data} />}
        </CardContent>
      </Card>
    </div>
  );
}
