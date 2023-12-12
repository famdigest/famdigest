import { Table } from "@repo/supabase";
import { Separator } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { ConnectionGrid } from "./ConnectionGrid";
import { AddConnectionDropdown } from "./AddConnectionDropdown";

type ConnectionsViewProps = {
  initialData: Table<"connections">[];
};
export function ConnectionsView({ initialData }: ConnectionsViewProps) {
  const { data: connections } = trpc.connections.all.useQuery(undefined, {
    initialData: initialData,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-semibold font-serif">Calendars</h2>
          <p className="text-muted-foreground">
            Manage calendars across many providers.
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-auto">
          <AddConnectionDropdown />
        </div>
      </header>
      <Separator />
      <ConnectionGrid connections={connections} />
    </div>
  );
}
