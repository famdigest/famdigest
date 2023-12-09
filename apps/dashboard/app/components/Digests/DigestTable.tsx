import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import type { Table as DbTable } from "@repo/supabase";
import { IconCheck, IconDotsVertical, IconX } from "@tabler/icons-react";
import { DigestFormModal } from "./DigestFormModal";
import dayjs from "dayjs";
import { fromNow } from "~/lib/dates";

type DigestTableProps = {
  digests: DbTable<"digests">[];
};
export function DigestTable({ digests }: DigestTableProps) {
  return (
    <div className="bg-background rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Opt-In</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {digests.length > 0 ? (
            <>
              {digests.map((digest) => (
                <DigestTableRow key={digest.id} digest={digest} />
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center">
                <p className="text-lg font-medium tracking-tight mb-3">
                  Create your first Digest
                </p>
                <DigestFormModal>
                  <Button size="sm">Get Started</Button>
                </DigestFormModal>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DigestTableRow({ digest }: { digest: DbTable<"digests"> }) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{digest.full_name}</p>
        <p className="text-sm">{digest.phone}</p>
      </TableCell>
      <TableCell>{digest.notify_on}</TableCell>
      <TableCell>{digest.opt_in ? <IconCheck /> : <IconX />}</TableCell>
      <TableCell>{digest.enabled ? <IconCheck /> : <IconX />}</TableCell>
      <TableCell>{fromNow(digest.created_at)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <IconDotsVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Something</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
