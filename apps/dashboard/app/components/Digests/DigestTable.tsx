import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { convertToLocal, fromNow } from "~/lib/dates";
import { trpc } from "~/lib/trpc";
import { ConfirmDeleteButton } from "../ConfirmDeleteButton";
import { useState } from "react";

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
            <TableHead>Updated</TableHead>
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
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const utils = trpc.useUtils();
  const remove = trpc.digests.remove.useMutation({
    onSuccess() {
      utils.digests.all.invalidate();
    },
  });

  return (
    <>
      <TableRow>
        <TableCell>
          <p className="font-medium">{digest.full_name}</p>
          <p className="text-sm">{digest.phone}</p>
        </TableCell>
        <TableCell>
          {convertToLocal(digest.notify_on).format("hh:mm A")}
        </TableCell>
        <TableCell>{digest.opt_in ? <IconCheck /> : <IconX />}</TableCell>
        <TableCell>{digest.enabled ? <IconCheck /> : <IconX />}</TableCell>
        <TableCell>{fromNow(digest.updated_at)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu
            onOpenChange={() => {
              setConfirm(false);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost">
                <IconDotsVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpen(true)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer bg-destructive text-destructive-foreground focus:bg-destructive/50 focus:text-destructive-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm) {
                    remove.mutate(digest.id);
                  } else {
                    setConfirm(true);
                  }
                }}
              >
                {remove.isLoading
                  ? "Deleting..."
                  : confirm
                    ? "Are you sure?"
                    : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <DigestFormModal digest={digest} open={open} onOpenChange={setOpen} />
    </>
  );
}
