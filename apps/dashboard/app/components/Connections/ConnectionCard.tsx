import { Table, Calendar } from "@repo/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Switch,
} from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { ConnectionProviderIcon } from "./ConnectionProviderIcon";

type ConnectionCardProps = {
  connection: Table<"connections">;
  calendars: Calendar[];
};
function enabledSort(a: Calendar, b: Calendar) {
  return (b.enabled === true ? 1 : 0) - (a.enabled === true ? 1 : 0);
}
export function ConnectionCard({ connection, calendars }: ConnectionCardProps) {
  const utils = trpc.useUtils();
  const update = trpc.calendars.update.useMutation({
    async onSuccess() {
      await utils.calendars.invalidate();
    },
  });

  return (
    <Card>
      <div className="flex items-start md:items-center p-6 gap-x-4">
        <ConnectionProviderIcon provider={connection.provider} />
        <CardHeader className="p-0 space-y-0.5">
          <CardTitle className="capitalize text-xl">
            {connection.provider}
          </CardTitle>
          <CardDescription>{connection.email}</CardDescription>
        </CardHeader>
      </div>
      <CardContent className="p-6 border-t space-y-4">
        {calendars.sort(enabledSort).map((calendar) => (
          <div key={calendar.id} className="flex items-center gap-x-4">
            <Switch
              checked={update.data?.enabled ?? calendar.enabled}
              onCheckedChange={(checked) => {
                update.mutate({
                  id: calendar.id,
                  enabled: checked,
                });
              }}
            />
            <p>{calendar.data?.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
