import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import {
  IconBrandApple,
  IconBrandAzure,
  IconBrandGoogle,
  IconCirclePlus,
} from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";
import GoogleIcon, { GoogleCalendarIcon } from "../GoogleIcon";
import { Link } from "@remix-run/react";

export function AddConnectionDropdown({
  redirectUri,
}: {
  redirectUri?: string;
}) {
  const addGoogle = trpc.connections.google.useMutation({
    onSuccess(data) {
      window.location.href = data.authorizeUrl;
    },
  });

  const addMsft = trpc.connections.office365.useMutation({
    onSuccess(data, variables, context) {
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
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => addGoogle.mutate(redirectUri)}
        >
          <GoogleCalendarIcon className="h-[14px] w-[14px] mr-2" />
          Connect with Google
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to={`/providers/apple/setup?redirect_uri=${redirectUri}`}>
            <IconBrandApple size={14} className="mr-2" />
            Connect with iCloud
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => addMsft.mutate()}
        >
          <IconBrandAzure size={14} className="mr-2" />
          Office 365
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
