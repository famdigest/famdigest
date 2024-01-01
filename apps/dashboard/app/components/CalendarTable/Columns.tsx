import { InferSelectModel, schema } from "@repo/database";
import { ColumnDef } from "@tanstack/react-table";
import { Enums } from "@repo/supabase";
import { IconCheck, IconSelector, IconX } from "@tabler/icons-react";
import { Button } from "@repo/ui";
import { Link } from "@remix-run/react";

type Profile = InferSelectModel<typeof schema.profiles>;
type Calendar = InferSelectModel<typeof schema.calendars>;
export type CalendarTableRow = Calendar & {
  provider: Enums<"provider_type">;
  owner: Profile;
};

export const columns: ColumnDef<CalendarTableRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <IconSelector className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = String(row.getValue("name"));
      return (
        <Link to={`/calendars/${row.original.connection_id}`}>{name}</Link>
      );
    },
  },
  {
    accessorKey: "owner.full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner
          <IconSelector className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "provider",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Provider
          <IconSelector className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="capitalize">{row.getValue("provider")}</span>;
    },
  },
  {
    accessorKey: "enabled",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Enabled
          <IconSelector className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const enabled = Boolean(row.getValue("enabled"));
      return (
        <span>{enabled ? <IconCheck size={16} /> : <IconX size={16} />}</span>
      );
    },
  },
];
