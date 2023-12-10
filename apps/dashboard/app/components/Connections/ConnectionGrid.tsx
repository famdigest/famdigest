import { Table } from "@repo/supabase";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { ConnectionProviderIcon } from "./ConnectionProviderIcon";
import { IconSettings } from "@tabler/icons-react";
import { Link } from "@remix-run/react";

type ConnectionGridProps = {
  connections: Table<"connections">[];
};
export function ConnectionGrid({ connections }: ConnectionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {connections?.map((connection) => (
        <Card key={connection.id}>
          <div className="flex items-start md:items-center p-6 gap-x-4">
            <ConnectionProviderIcon provider={connection.provider} />
            <CardHeader className="p-0 space-y-0.5">
              <CardTitle className="capitalize text-xl">
                {connection.provider}
              </CardTitle>
              <CardDescription>{connection.email}</CardDescription>
            </CardHeader>
            <div className="ml-auto">
              <Button size="icon" variant="secondary" asChild>
                <Link to={`/calendars/${connection.id}`}>
                  <IconSettings size={20} />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
