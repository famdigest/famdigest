import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { IconCirclePlus } from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";

export function AddCalendarDropdown() {
  const addGoogle = trpc.google.authorize.useMutation({
    onSuccess(data) {
      window.location.href = data.authorizeUrl;
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <IconCirclePlus className="mr-2" size={20} />
          Add Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[200px]" align="end">
        <DropdownMenuLabel>Choose Provider</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => addGoogle.mutate()}>
          Google
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}