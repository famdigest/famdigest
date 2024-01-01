import { useOutletContext } from "@remix-run/react";
import { ContextType } from "./_layout";
import { Calendar } from "@repo/database";
import { useMemo } from "react";
import { Button, Checkbox, toast } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { AddConnectionDropdown } from "~/components/Connections/AddConnectionDropdown";

export default function Route() {
  const { subscriber: initialData, connections } =
    useOutletContext<ContextType>();

  const { data: subscriber } = trpc.subscribers.one.useQuery(initialData.id, {
    initialData,
  });
  const utils = trpc.useUtils();
  const link = trpc.subscribers.link.useMutation({
    onMutate(variables) {
      if (!subscriber) return;
      const calendars: Calendar[] = connections.flatMap(
        (connection) => connection.calendars
      );
      utils.subscribers.one.setData(subscriber.id, {
        ...subscriber,
        subscription_calendars: [
          ...subscriber.subscription_calendars,
          {
            ...variables,
            calendar: calendars.find((c) => c.id === variables.calendar_id)!,
          },
        ],
      });
    },
    async onSuccess() {
      await utils.subscribers.one.invalidate();
      toast({
        title: "Calendar Added",
      });
    },
    async onError() {
      await utils.subscribers.one.invalidate();
      toast({
        title: "Error adding calendar",
        variant: "destructive",
      });
    },
  });
  const unlink = trpc.subscribers.unlink.useMutation({
    onMutate(variables) {
      if (!subscriber) return;
      utils.subscribers.one.setData(subscriber.id, {
        ...subscriber,
        subscription_calendars: subscriber.subscription_calendars.filter(
          (sc) => sc.calendar_id !== variables.calendar_id
        ),
      });
    },
    async onSuccess() {
      await utils.subscribers.one.invalidate();
      toast({
        title: "Calendar Removed",
      });
    },
  });

  const calendars: Calendar[] = connections
    .flatMap((connection) => connection.calendars)
    .sort((a, b) => Number(b.enabled) - Number(a.enabled));

  const selectedCalendars = useMemo(() => {
    if (!subscriber) return [];
    return subscriber.subscription_calendars.map((sc) => sc.calendar_id);
  }, [subscriber]);

  const allSelected = useMemo(() => {
    return selectedCalendars?.length === calendars.length;
  }, [selectedCalendars, calendars]);

  return (
    <>
      <header className="flex flex-col space-y-1.5 p-6 border-b">
        <h3 className="font-semibold leading-none text-xl font-serif tracking-normal">
          Calendars
        </h3>
        <p className="text-sm text-muted-foreground">
          Select which calendars are enabled for {subscriber?.full_name}.
        </p>
      </header>

      <div className="space-y-2 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">Select Calendars</p>
          <Button
            variant="link"
            type="button"
            className="p-0 h-auto"
            onClick={() => {
              if (!subscriber) return;
              if (allSelected) {
                selectedCalendars.map((cal) =>
                  unlink.mutate({
                    subscription_id: subscriber.id,
                    calendar_id: cal,
                  })
                );
              } else {
                calendars
                  .filter((c) => selectedCalendars.indexOf(c.id) === -1)
                  .map((cal) =>
                    link.mutate({
                      subscription_id: subscriber.id,
                      calendar_id: cal.id,
                    })
                  );
              }
            }}
          >
            {allSelected ? "Select None" : "Select All"}
          </Button>
        </div>
        <div className="border rounded-lg">
          {calendars.length === 0 && (
            <div>
              <div className="bg-muted h-40 flex flex-col items-center justify-center">
                <p className="text-lg font-medium tracking-tight mb-3">
                  Connect your first calendar
                </p>
                <AddConnectionDropdown
                  redirectUri={`/subscribers/${subscriber?.id}/calendars`}
                />
              </div>
            </div>
          )}
          {calendars.map((calendar, idx) => {
            const isChecked = selectedCalendars?.indexOf(calendar.id) > -1;
            return (
              <div
                key={calendar.id}
                className="flex justify-between items-center p-2 border-b last-of-type:border-0"
              >
                <span className="text-sm">{calendar.name}</span>
                <div>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (!subscriber) return;
                      if (checked) {
                        link.mutate({
                          subscription_id: subscriber.id,
                          calendar_id: calendar.id,
                        });
                      } else {
                        unlink.mutate({
                          subscription_id: subscriber.id,
                          calendar_id: calendar.id,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
