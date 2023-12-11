import { Table } from "@repo/supabase";
import { Button, Separator } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { DigestListing, DigestTable } from "./DigestTable";
import { DigestFormModal } from "./DigestFormModal";
import { IconCirclePlus } from "@tabler/icons-react";

type DigestsViewProps = {
  initialData: Table<"digests">[];
};
export function DigestsView({ initialData }: DigestsViewProps) {
  const { data: digests } = trpc.digests.all.useQuery(undefined, {
    initialData: initialData,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-semibold tracking-tight">Digests</h2>
          <p className="text-muted-foreground">
            Manage who gets your daily digest notifications.
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-auto">
          <DigestFormModal>
            <Button variant="outline">
              <IconCirclePlus className="mr-2" size={20} />
              Add Digest
            </Button>
          </DigestFormModal>
        </div>
      </header>
      <Separator />
      <DigestTable digests={digests} />
      <DigestListing digests={digests} />
    </div>
  );
}
