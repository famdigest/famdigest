import { Table } from "@repo/supabase";
import { Card, CardDescription, CardHeader, CardTitle, Switch } from "@repo/ui";
import { CalendarProviderIcon } from "./CalendarProviderIcon";
import { trpc } from "~/lib/trpc";

type CalendarGridProps = {
  calendars: Table<"connections">[];
};
export function CalendarGrid({ calendars }: CalendarGridProps) {
  const utils = trpc.useUtils();
  const update = trpc.connections.update.useMutation({
    onSuccess() {
      utils.connections.all.invalidate();
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {calendars?.map((calendar) => (
        <Card key={calendar.id}>
          <div className="flex items-start md:items-center p-6 gap-x-4">
            <CalendarProviderIcon provider={calendar.provider} />
            <CardHeader className="p-0 space-y-0.5">
              <CardTitle className="capitalize text-xl">
                {calendar.provider}
              </CardTitle>
              <CardDescription>{calendar.email}</CardDescription>
              <div className="md:hidden pt-3">
                <Switch
                  checked={calendar.enabled}
                  onCheckedChange={(checked) =>
                    update.mutate({
                      id: calendar.id,
                      enabled: checked,
                    })
                  }
                />
              </div>
            </CardHeader>
            <div className="ml-auto hidden md:inline">
              <Switch
                checked={calendar.enabled}
                onCheckedChange={(checked) =>
                  update.mutate({
                    id: calendar.id,
                    enabled: checked,
                  })
                }
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
