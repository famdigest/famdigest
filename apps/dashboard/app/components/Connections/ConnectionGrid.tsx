import { Table } from "@repo/supabase";
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@repo/ui";
import { ConnectionProviderIcon } from "./ConnectionProviderIcon";
import { IconAlertTriangleFilled, IconSettings } from "@tabler/icons-react";
import { Link } from "@remix-run/react";
import { AddConnectionDropdown } from "./AddConnectionDropdown";

type ConnectionGridProps = {
  connections: Table<"connections">[];
};
export function ConnectionGrid({ connections }: ConnectionGridProps) {
  if (!connections.length) {
    return (
      <div>
        <div className="h-40 text-center">
          <p className="text-lg font-medium tracking-tight mb-3">
            Connect your first calendar
          </p>
          <AddConnectionDropdown />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {connections?.map((connection) => (
        <Card
          key={connection.id}
          className={cn(connection.invalid && "border-destructive")}
        >
          <div className="flex items-start md:items-center p-4 lg:p-6 gap-x-4">
            <ConnectionProviderIcon provider={connection.provider} />
            <CardHeader className="p-0 space-y-0.5 min-w-0">
              <CardTitle className="capitalize text-xl">
                {connection.provider}
              </CardTitle>
              <CardDescription className="truncate text-xs lg:text-sm">
                {connection.email}
              </CardDescription>
            </CardHeader>
            <div className="ml-auto shrink-0">
              <Button
                size="icon-sm"
                variant={connection.invalid ? "destructive" : "secondary"}
                asChild
              >
                <Link to={`/calendars/${connection.id}`}>
                  {connection.invalid ? (
                    <IconAlertTriangleFilled size={16} />
                  ) : (
                    <IconSettings size={16} />
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
