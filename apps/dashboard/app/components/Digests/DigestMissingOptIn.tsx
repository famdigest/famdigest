import { Table } from "@repo/supabase";
import { Alert, AlertTitle, AlertDescription, Button, toast } from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";

export function DigestMissingOptIn({ digest }: { digest: Table<"digests"> }) {
  const resend = trpc.digests.resend.useMutation({
    onSuccess(data, variables, context) {
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

  return (
    <Alert className="bg-destructive text-destructive-foreground">
      <AlertTitle>{digest.full_name} has not opted-in yet.</AlertTitle>
      <AlertDescription>
        They will not receive their daily digest until they have opted-in. Click
        resend below to try again.
      </AlertDescription>

      <Button
        className="mt-2"
        size="sm"
        variant="secondary"
        onClick={() => resend.mutate(digest.id)}
        disabled={resend.isLoading}
      >
        {resend.isLoading && <IconLoader2 className="animate-spin mr-2" />}
        Resend
      </Button>
    </Alert>
  );
}
