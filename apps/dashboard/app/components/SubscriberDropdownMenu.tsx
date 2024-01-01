import { useNavigate, useParams } from "@remix-run/react";
import { InferSelectModel, schema } from "@repo/database";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  Button,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  toast,
  DropdownMenuSeparator,
} from "@repo/ui";
import { IconDotsVertical } from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";

type SubscriberDropdownMenuProps = {
  subscriber: InferSelectModel<typeof schema.subscriptions>;
  trigger?: React.ReactNode;
};
export function SubscriberDropdownMenu({
  subscriber,
  trigger,
}: SubscriberDropdownMenuProps) {
  const navigate = useNavigate();
  const params = useParams();
  const utils = trpc.useUtils();
  const deleteSubscriber = trpc.subscribers.remove.useMutation({
    async onSuccess() {
      await utils.subscribers.invalidate();
      if (params?.id) {
        navigate("/subscribers");
      }
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            const url = `${window.location.origin}/manage-subscription/${subscriber.access_code}`;
            navigator.clipboard.writeText(url);
            toast({
              title: "Copied!",
            });
          }}
        >
          Copy Access Code
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            const confirm = window.confirm(
              "Are you sure you want to delete this subcriber?"
            );
            if (confirm) {
              deleteSubscriber.mutate(subscriber.id);
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
