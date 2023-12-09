import { Table } from "@repo/supabase";
import { Separator } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { CalendarGrid } from "./CalendarGrid";
import { AddCalendarDropdown } from "./AddCalendarDropdown";

type CalendarsViewProps = {
  initialData: Table<"connections">[];
};
export function CalendarsView({ initialData }: CalendarsViewProps) {
  const { data: connections } = trpc.connections.all.useQuery(undefined, {
    initialData: initialData,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-semibold tracking-tight">Calendars</h2>
          <p className="text-muted-foreground">
            Select which calendars you want to include in your family digest.
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-auto">
          <AddCalendarDropdown />
        </div>
      </header>
      <Separator />
      <CalendarGrid calendars={connections} />
    </div>
  );
}
