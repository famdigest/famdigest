import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import { IconCalendar, IconSend } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { z } from "zod";
import { useHydrated } from "~/hooks/use-hydrated";
import { trpc } from "~/lib/trpc";

const messageFilters = z.object({
  digest_id: z.string(),
  page: z.string().default("1"),
  size: z.string().default("50"),
  date: z.date().optional(),
});

export function DigestMessages({ digest_id }: { digest_id: string }) {
  const [filters, setFilters] = useState<z.infer<typeof messageFilters>>({
    digest_id,
    page: "1",
    size: "10",
    date: undefined,
  });
  const { data } = trpc.messages.all.useQuery({
    ...filters,
    date: filters.date ? dayjs(filters.date).format() : undefined,
  });
  const hydrated = useHydrated();

  return (
    <div>
      <div className="py-3 flex items-center justify-between">
        <p>Message History</p>

        <div className="flex items-center gap-x-2">
          {filters.date && (
            <Button
              onClick={() =>
                setFilters((prev) => ({ ...prev, date: undefined }))
              }
            >
              Clear
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <IconCalendar size={20} className="mr-2" />
                {filters.date
                  ? dayjs(filters.date).format("MM/DD/YYYY")
                  : "Pick a Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              {hydrated && (
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => setFilters((prev) => ({ ...prev, date }))}
                  toDate={dayjs().toDate()}
                />
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-4">
        {data?.length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center border rounded-lg bg-muted">
            <IconSend />
            <p>No Message History</p>
          </div>
        )}
        {data?.map((message) => (
          <div key={message.id} className="bg-muted rounded-lg border p-4">
            <div
              className="prose prose-sm"
              dangerouslySetInnerHTML={{
                __html: message.message.replace(/\n/g, "<br/>"),
              }}
            />
            <p className="text-xs mt-4">
              Sent on{" "}
              {hydrated
                ? dayjs(message.created_at).format("MM/DD/YYYY [@] hh:mm a")
                : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
