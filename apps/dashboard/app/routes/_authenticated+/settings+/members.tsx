import { useClipboard, useDisclosure } from "@mantine/hooks";
import { Link, useLoaderData } from "@remix-run/react";
import {
  IconArrowsExchange,
  IconBolt,
  IconClipboardCopy,
  IconDotsVertical,
  IconLoader2,
  IconRefreshDot,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { ConfirmDeleteButton } from "~/components/ConfirmDeleteButton";
import {
  InviteMemberForm,
  userTypeOptions,
} from "~/components/InviteMemberForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormField,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tooltip,
  useToast,
} from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { useIsTeamOwner } from "~/hooks/is-team-owner";
import { useIsTeamPlan } from "~/hooks/is-team-plan";
import type { Enums } from "@repo/supabase";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { db, eq, schema } from "~/lib/db.server";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";

export const meta = () => {
  return [{ title: "Members | FamDigest" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace } = await getSessionWorkspace(request);

  const members = await db.query.workspace_users.findMany({
    with: {
      profile: true,
      workspace: {
        columns: {
          owner_id: true,
        },
      },
    },
    where: eq(schema.workspace_users.workspace_id, workspace.id),
  });

  const invitations = await db.query.invitations.findMany({
    where: eq(schema.invitations.workspace_id, workspace.id),
  });

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "settings:members",
      user_id: session.get("userId"),
    },
  });

  return json({
    members,
    invitations,
  });
}

export default function Route() {
  const { user: signInUser } = useWorkspaceLoader();
  const { members, invitations: initialInvitations } =
    useLoaderData<typeof loader>();
  const { toast } = useToast();
  const isTeamPlan = useIsTeamPlan();
  const isTeamOwner = useIsTeamOwner();
  const { copy } = useClipboard();
  const utils = trpc.useUtils();

  const { data } = trpc.members.all.useQuery(undefined, {
    initialData: members,
  });
  const { data: invitations } = trpc.invites.all.useQuery(undefined, {
    initialData: initialInvitations,
  });

  const updateRole = trpc.members.update.useMutation({
    async onSuccess() {
      await utils.members.invalidate();
      toast({
        title: "Success",
        description: "Member has been updated",
      });
    },
  });
  const removeMember = trpc.members.remove.useMutation({
    onSuccess: async () => {
      await utils.members.invalidate();
      toast({
        title: "Success",
        description: "Workspace member has been deleted",
      });
    },
  });
  const removeInvite = trpc.invites.remove.useMutation({
    onSuccess: async () => {
      await utils.invites.invalidate();
      toast({
        title: "Success",
        description: "Workspace invite has been deleted",
      });
    },
  });
  const resendInvite = trpc.invites.resend.useMutation({
    onSuccess() {
      toast({
        title: "Success",
        description: "Workspace invite resnt",
      });
    },
  });

  return (
    <div className="container max-w-screen-md sm:py-6 space-y-6 md:space-y-12">
      <Card>
        <CardHeader className="border-b flex flex-col md:flex-row md:justify-between">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-xl font-serif tracking-normal">
              Members
            </CardTitle>
            <CardDescription>
              Manage and Invite members to your workspace.
            </CardDescription>
          </div>

          {isTeamOwner && <InviteMemberForm />}
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-y-4">
            {data?.map((member) => {
              const user = member.profile;
              const isYou = member.user_id === signInUser.id;
              return (
                <div
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between relative"
                  key={member.user_id}
                >
                  <div className="flex items-center gap-x-3">
                    <Avatar className="">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url}></AvatarImage>
                      ) : (
                        <AvatarFallback className="uppercase bg-muted">
                          {user.email?.substring(0, 2)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user.full_name} {isYou && "(You)"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-3 mt-2 md:mt-0">
                    <Badge className="capitalize select-none">
                      {member.role}
                    </Badge>

                    {isTeamOwner && !isYou && (
                      <ManageMemberPopover
                        role={member.role}
                        disabled={isYou || !isTeamOwner}
                        isLoading={
                          updateRole.isLoading || removeMember.isLoading
                        }
                        onChangeRole={(role) => {
                          updateRole.mutate({
                            role,
                            user_id: member.user_id,
                            workspace_id: member.workspace_id,
                          });
                        }}
                        onRemoveMember={() => {
                          removeMember.mutate({
                            user_id: member.user_id,
                            workspace_id: member.workspace_id,
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {isTeamOwner && (
        <Card>
          <CardHeader className="border-b flex-row justify-between">
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-xl font-serif tracking-normal">
                Pending Invites
              </CardTitle>
              <CardDescription>
                Manage invites not yet accepted.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {invitations?.length === 0 && (
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm">No pending invites found</p>
              </div>
            )}
            {invitations?.map((invite) => {
              return (
                <div
                  className="border rounded-lg p-4 flex items-center justify-between"
                  key={invite.id}
                >
                  <div className="flex items-center gap-x-3">
                    <Avatar className="">
                      <AvatarFallback className="uppercase bg-muted">
                        {invite.email?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-x-2">
                      <p>{invite.email}</p>
                      {invite.invite_url && (
                        <Tooltip label="Copy Invite Link">
                          <Button
                            variant="ghost"
                            size={"icon-sm"}
                            onClick={() => {
                              copy(invite.invite_url);
                              toast({
                                title: "Invite Link Copied",
                              });
                            }}
                          >
                            <IconClipboardCopy size={16} />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <Badge className="capitalize">{invite.role}</Badge>
                    <Tooltip label="Resend">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => resendInvite.mutate(invite)}
                      >
                        {resendInvite.isLoading ? (
                          <IconLoader2 className="animate-spin" size={20} />
                        ) : (
                          <IconRefreshDot size={20} />
                        )}
                      </Button>
                    </Tooltip>
                    <ConfirmDeleteButton
                      onConfirm={() => removeInvite.mutate(invite.id)}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        disabled={removeInvite.isLoading}
                      >
                        {removeInvite.isLoading ? (
                          <IconLoader2 className="animate-spin" size={20} />
                        ) : (
                          <IconX size={20} />
                        )}
                      </Button>
                    </ConfirmDeleteButton>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type ManageMemberPopoverProps = {
  disabled: boolean;
  isLoading: boolean;
  role: Enums<"workspace_role">;
  onChangeRole: (role: Enums<"workspace_role">) => void;
  onRemoveMember: () => void;
};
function ManageMemberPopover({
  role: initialRole,
  disabled = false,
  isLoading = false,
  onChangeRole,
  onRemoveMember,
}: ManageMemberPopoverProps) {
  const [open, { toggle }] = useDisclosure(false);
  const [confirm, { toggle: toggleConfirm }] = useDisclosure(false);

  const [role, setRole] = useState<Enums<"workspace_role">>(initialRole);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onChangeRole(role);
    toggle();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled || isLoading}>
            {isLoading ? (
              <IconLoader2 className="animate-spin" size={20} />
            ) : (
              <IconDotsVertical size={20} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggle}>
            <IconArrowsExchange size={16} className="mr-2" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            onClick={toggleConfirm}
          >
            <IconTrash size={16} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={toggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Changing the role of the workspace member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              label="New Role"
              value={role}
              render={(field) => (
                <Select
                  value={field.value as Enums<"workspace_role">}
                  onValueChange={(val: Enums<"workspace_role">) => setRole(val)}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Button size="sm">Update</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm} onOpenChange={toggleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              member from your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemoveMember();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
