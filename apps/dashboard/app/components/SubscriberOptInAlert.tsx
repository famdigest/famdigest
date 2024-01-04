import { SubscriberWithRelations, SubscriptionLogs } from "@repo/database";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  toast,
  Tooltip,
} from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { trpc } from "~/lib/trpc";

export function SubscriberOptInAlert({
  subscription,
  lastMessage: initialData,
}: {
  subscription: SubscriberWithRelations;
  lastMessage: SubscriptionLogs | undefined;
}) {
  const utils = trpc.useUtils();
  const { data: lastMessage } = trpc.subscribers.lastMessage.useQuery(
    subscription.id,
    {
      initialData,
    }
  );
  const resend = trpc.subscribers.resendOptIn.useMutation({
    async onSuccess() {
      await utils.subscribers.one.invalidate();
      await utils.subscribers.lastMessage.invalidate();
      toast({
        title: "Opt-in message sent",
      });
    },
    onError(error) {
      toast({
        title: "Sorry",
        description: error.message,
      });
    },
  });

  const canResend = useMemo(() => {
    if (!lastMessage) return true;

    const now = dayjs();
    const lastSentOn = dayjs(lastMessage?.created_at);
    return Math.abs(lastSentOn.diff(now, "days")) > 1;
  }, [lastMessage]);

  return (
    <Alert className="bg-destructive text-destructive-foreground">
      <AlertTitle className="mb-2">
        {subscription.full_name} has not opted-in yet.
      </AlertTitle>
      <AlertDescription>
        They will not receive their daily schedule until they have opted-in.
        Click resend below to try again.
      </AlertDescription>

      <Tooltip
        label={
          !canResend ? "You can try again in 24 hours" : "Resend opt-in message"
        }
      >
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          onClick={() => resend.mutate(subscription.id)}
          disabled={resend.isLoading}
        >
          {resend.isLoading && <IconLoader2 className="animate-spin mr-2" />}
          Resend
        </Button>
      </Tooltip>
    </Alert>
  );
}
