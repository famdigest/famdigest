import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { invitationsInsertSchema, type Enums } from "@repo/supabase";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@repo/ui";
import {
  IconLoader2,
  IconPlus,
  IconSend,
  IconUserPlus,
} from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";
import { useDisclosure } from "@mantine/hooks";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

type WorkspaceRole = Enums<"workspace_role">;

type INVITE_FORM_USER_TYPES = Array<{
  value: WorkspaceRole;
  label: string;
}>;

export const userTypeOptions: INVITE_FORM_USER_TYPES = [
  {
    label: "Owner",
    value: "owner",
  },
  {
    label: "Member",
    value: "member",
  },
];

const bulkInvitationInsertSchema = z.object({
  invitations: z
    .array(
      invitationsInsertSchema.extend({
        email: z.string().email().min(1, "An email is required"),
      })
    )
    .min(1),
});
type BulkInvitations = z.infer<typeof bulkInvitationInsertSchema>;

export function InviteMemberForm() {
  const [open, { toggle }] = useDisclosure(false);
  const { user, workspace } = useWorkspaceLoader();
  const { toast } = useToast();
  const utils = trpc.useContext();
  const inviteMember = trpc.invites.create.useMutation({
    onSuccess: async () => {
      await utils.invites.invalidate();
      toggle();
      toast({
        title: "Success",
        description: `${form.values.invitations.length} member(s) were invited`,
      });
    },
    onError: () => {
      toast({
        title: "Oh No",
        description: `Something went wrong`,
      });
    },
  });

  const form = useForm<BulkInvitations>({
    validate: zodResolver(bulkInvitationInsertSchema),
    initialValues: {
      invitations: [
        {
          invitation_type: "one-time",
          role: "member",
          email: "",
          workspace_id: workspace.id,
          invited_by_user_id: user.id,
        },
      ],
    },
  });

  const onSubmit = (values: typeof form.values) => {
    values.invitations.map((invitation) => inviteMember.mutate(invitation));
  };

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconUserPlus className="mr-3" size={16} />
          Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Invite members to your workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          id="invitationForm"
          className="flex flex-col gap-y-4"
          onSubmit={form.onSubmit(onSubmit)}
        >
          {form.values.invitations.map((_, idx) => (
            <div className="grid grid-cols-3 gap-4" key={idx}>
              <FormField
                className="col-span-2"
                aria-label="Email"
                type="email"
                placeholder="email@domain.com"
                {...form.getInputProps(`invitations.${idx}.email`)}
                render={(field) => <Input {...field} />}
              />
              <FormField
                aria-label="Member Role"
                {...form.getInputProps(`invitations.${idx}.role`)}
                render={(field) => (
                  <Select
                    value={field.value as WorkspaceRole}
                    onValueChange={(val: WorkspaceRole) =>
                      form.setFieldValue(`invitations.${idx}.role`, val)
                    }
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
            </div>
          ))}
          <div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                form.insertListItem("invitations", {
                  invitation_type: "one-time",
                  role: "member",
                  email: "",
                  workspace_id: workspace.id,
                  invited_by_user_id: user.id,
                });
              }}
            >
              <IconPlus size={16} className="mr-3" />
              Add More
            </Button>
          </div>
        </form>
        <DialogFooter>
          <Button
            form="invitationForm"
            size="sm"
            disabled={inviteMember.isLoading}
          >
            {inviteMember.isLoading ? (
              <IconLoader2 size={16} className="animate-spin mr-3" />
            ) : (
              <IconSend size={16} className="mr-3" />
            )}
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
