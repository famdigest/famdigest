import { useOutletContext } from "@remix-run/react";
import { ContextType } from "./_layout";
import { useState } from "react";
import { z } from "zod";
import { trpc } from "~/lib/trpc";
import dayjs from "dayjs";
import {
  Button,
  Calendar,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@repo/ui";
import { IconCalendar, IconSend } from "@tabler/icons-react";
import { useHydrated } from "~/hooks/use-hydrated";

const messageFilters = z.object({
  subscription_id: z.string(),
  page: z.string().default("1"),
  size: z.string().default("50"),
  date: z.date().optional(),
});

export default function Route() {
  const { subscriber } = useOutletContext<ContextType>();
  const hydrated = useHydrated();
  const [filters, setFilters] = useState<z.infer<typeof messageFilters>>({
    subscription_id: subscriber.id,
    page: "1",
    size: "10",
    date: undefined,
  });
  const { data } = trpc.subscribers.messages.useQuery({
    ...filters,
    date: filters.date ? dayjs(filters.date).format() : undefined,
  });

  return (
    <>
      <header className="flex flex-col space-y-1.5 p-6 border-b">
        <h3 className="font-semibold leading-none text-xl font-serif tracking-normal">
          Messages
        </h3>
        <p className="text-sm text-muted-foreground">
          Review all messages sent to {subscriber.full_name}.
        </p>
      </header>

      <div className="space-y-2 p-6">
        <div className="flex items-center justify-end">
          {/* <p className="text-sm">Search</p> */}
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
                    onSelect={(date) =>
                      setFilters((prev) => ({ ...prev, date }))
                    }
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
    </>
  );
}
