import { useDisclosure } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import { Popover, PopoverTrigger, Button, PopoverContent } from "@repo/ui";
import { IconCalendar, IconMessage, IconX } from "@tabler/icons-react";

export function AppFab() {
  const [open, { toggle }] = useDisclosure(false);
  return (
    <Popover open={open} onOpenChange={toggle}>
      <PopoverTrigger asChild>
        <Button className="rounded-full" size="lg">
          {open ? <IconX /> : "Add"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="bg-slate-800 text-white flex flex-col gap-y-2 p-2 rounded-xl"
      >
        <Link
          to="/calendars"
          className="flex items-center gap-x-4 bg-slate-900 p-2 rounded-[8px]"
        >
          <div className="bg-emerald-600 text-white h-8 aspect-square flex items-center justify-center rounded-full">
            <IconCalendar size={20} />
          </div>
          <div>
            <p className="font-serif">Add Calendar</p>
            <p className="text-xs text-slate-300">
              Do you have additional calendars you'd like to add?
            </p>
          </div>
        </Link>

        <Link
          to="/digests"
          className="flex items-center gap-x-4 bg-slate-900 p-2 rounded-[8px]"
        >
          <div className="bg-blue-600 text-white h-8 aspect-square flex items-center justify-center rounded-full">
            <IconMessage size={20} />
          </div>
          <div>
            <p className="font-serif">Add Contact</p>
            <p className="text-xs text-slate-300">
              Want others to receive your daily digest?
            </p>
          </div>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
