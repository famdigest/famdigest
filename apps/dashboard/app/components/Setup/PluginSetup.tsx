import { Link, useNavigate } from "@remix-run/react";
import { Button, Badge, toast } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { ConnectionCard } from "../Connections/ConnectionCard";
import { ConnectionProviderIcon } from "../Connections/ConnectionProviderIcon";
import { InferSelectModel, schema } from "@repo/database";

type Connection = InferSelectModel<typeof schema.connections>;
type Calendar = InferSelectModel<typeof schema.calendars>;

type PluginSetupProps = {
  initialData: Array<Connection & { calendars: Calendar[] }>;
  redirectUri: string;
};
export function PluginSetup({ initialData, redirectUri }: PluginSetupProps) {
  const navigate = useNavigate();
  const addGoogle = trpc.connections.google.useMutation({
    onSuccess(data) {
      window.location.href = data.authorizeUrl;
    },
  });
  const { data: connections } = trpc.connections.all.useQuery(undefined, {
    initialData,
  });

  return (
    <div className="flex flex-col gap-y-10">
      <div className="space-y-3">
        <Button
          className="bg-background hover:bg-muted text-foreground w-full rounded-lg h-16 text-left flex items-center justify-start gap-x-3"
          onClick={() => addGoogle.mutate(redirectUri)}
        >
          <ConnectionProviderIcon provider="google" />
          <span>Google Calendar</span>
        </Button>
        <Button
          className="bg-background hover:bg-muted text-foreground w-full rounded-lg h-16 text-left flex items-center justify-start gap-x-3"
          asChild
        >
          <Link to={`/providers/apple/setup?redirect_uri=${redirectUri}`}>
            <ConnectionProviderIcon provider="apple" />
            <span>Apple Calendar</span>
          </Link>
        </Button>
        <Button className="bg-background hover:bg-muted text-foreground w-full rounded-lg h-16 text-left flex items-center justify-start gap-x-3 relative">
          <ConnectionProviderIcon provider="office365" />
          <span>Outlook Calendar</span>
          <Badge variant="outline" className="ml-auto text-xs">
            Coming Soon
          </Badge>
        </Button>
      </div>

      <div className="flex justify-center">
        <Button
          className="rounded-full w-full sm:max-w-xs"
          onClick={() => {
            if (connections && connections.length <= 0) {
              toast({
                title: "Please add a calendar to continue",
                variant: "destructive",
              });
            } else {
              navigate(redirectUri);
            }
          }}
        >
          Next
        </Button>
      </div>

      {connections?.length > 0 && (
        <div>
          <p className="mb-4">Connected Calendars</p>
          <div className="space-y-4">
            {connections.map((connection) => {
              return (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  calendars={connection.calendars}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
