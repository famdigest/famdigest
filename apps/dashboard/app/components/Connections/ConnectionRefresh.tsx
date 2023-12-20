import { Table } from "@repo/supabase";
import { Alert, AlertTitle, AlertDescription, Button } from "@repo/ui";
import { trpc } from "~/lib/trpc";

export function ConnectionRefresh({
  connection,
}: {
  connection: Table<"connections">;
}) {
  const addGoogle = trpc.google.authorize.useMutation({
    onSuccess(data) {
      window.location.href = data.authorizeUrl;
    },
  });

  const addMsft = trpc.connections.office365.useMutation({
    onSuccess(data, variables, context) {
      window.location.href = data.authorizeUrl;
    },
  });

  const reconnect = () => {
    switch (connection.provider) {
      case "google":
        addGoogle.mutate();
        break;
      case "office365":
        addMsft.mutate();
        break;
    }
  };

  return (
    <Alert className="bg-destructive text-destructive-foreground">
      <AlertTitle>Something Looks Wrong</AlertTitle>
      <AlertDescription>
        <p>
          Looks like we are having trouble connection to your{" "}
          {connection.provider} calendar.
        </p>
        {/* {JSON.stringify(connection.error ?? "")} */}
      </AlertDescription>

      <Button
        className="mt-3"
        size="sm"
        variant="secondary"
        onClick={() => reconnect()}
      >
        Reconnect
      </Button>
    </Alert>
  );
}
