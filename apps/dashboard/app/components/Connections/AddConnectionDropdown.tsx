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
import GoogleIcon from "../GoogleIcon";
import { Link } from "@remix-run/react";

export function AddConnectionDropdown() {
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
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => addGoogle.mutate()}
        >
          <GoogleIcon size={14} className="mr-2" />
          Continue with Google
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to="/providers/apple/setup">
            <IconBrandApple size={14} className="mr-2" />
            Continue with iCloud
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => addMsft.mutate()}
        >
          <IconBrandAzure size={14} className="mr-2" />
          Outlook
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
