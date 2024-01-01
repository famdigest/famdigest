import { z } from "zod";
import { useClipboard } from "@mantine/hooks";
import { useState } from "react";
import { useForm, zodResolver } from "@mantine/form";
import { Link, useNavigate } from "@remix-run/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FormField,
  Input,
  Button,
  toast,
} from "@repo/ui";
import {
  IconCircleMinus,
  IconCirclePlus,
  IconClipboardCheck,
  IconClipboardCopy,
  IconLoader2,
  IconSend,
} from "@tabler/icons-react";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { Enums, invitationsInsertSchema } from "@repo/supabase";
import { trpc } from "~/lib/trpc";

const formSchema = z.object({
  invitations: z
    .array(
      invitationsInsertSchema.extend({
        email: z.string().email().min(1, "An email is required"),
      })
    )
    .min(1),
});

type InvitationProps = {
  redirectUri: string;
  request_type: Enums<"request_type">;
};
export function Invitation({ redirectUri, request_type }: InvitationProps) {
  const { user, workspace } = useWorkspaceLoader();
  const navigate = useNavigate();
  const { copied, copy } = useClipboard();
  const [clickedOnce, setClickedOnce] = useState(false);

  const utils = trpc.useUtils();
  const inviteMember = trpc.invites.create.useMutation({
    onSuccess: async () => {
      await utils.invites.invalidate();
      toast({
        title: "Success",
        description: `${form.values.invitations.length} member(s) were invited`,
      });
      navigate(redirectUri);
    },
    onError: () => {
      toast({
        title: "Oh No",
        description: `Something went wrong`,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    validate: zodResolver(formSchema),
    initialValues: {
      invitations: [
        {
          invitation_type: "one-time",
          request_type,
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

  const copyUniqueCode = () => {
    const url = `${window.location.origin}/join/${workspace.access_code}?invited_by=${user.id}`;
    copy(
      `${user.full_name} wants to receive your daily schedule, click the link to get started. ${url}`
    );
    setClickedOnce(true);
    if (navigator.share) {
      navigator
        .share({
          title: `${user.full_name} wants to receive your daily schedule`,
          text: "FamDigest is the simplest way to share calendars on the internet",
          url,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="mb-1 text-base font-medium leading-none tracking-tight">
            Invite Link
          </CardTitle>
          <CardDescription>
            {request_type === "calendar" ? (
              <>
                Click below to share your FamDigest link with whoever you want.
                Once they accept, you will be added as a subscriber to their
                digest.
              </>
            ) : (
              <>
                Click below to share your FamDigest link with whoever you want.
                Once they accept, they'll be able to create a digest from your
                calendars.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="rounded-full ml-auto shrink-0 whitespace-nowrap"
            variant="outline"
            size="sm"
            type="button"
            onClick={copyUniqueCode}
          >
            {copied ? (
              <IconClipboardCheck className="mr-2" size={20} />
            ) : (
              <IconClipboardCopy className="mr-2" size={20} />
            )}
            Copy &amp; Share
          </Button>
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-sm">
        <CardHeader className="items-start">
          <CardTitle className="mb-1 text-base font-medium leading-none tracking-tight">
            Invite Friends &amp; Family
          </CardTitle>
          <CardDescription>
            Allow others to collaborate and add their calendars. The more the
            merrier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-y-4"
            onSubmit={form.onSubmit(onSubmit)}
          >
            {form.values.invitations.map((invite, idx) => (
              <div className="flex gap-x-2" key={idx}>
                <FormField
                  className="flex-1"
                  placeholder="nick.miller@gmail.com"
                  {...form.getInputProps(`invitations.${idx}.email`)}
                  render={(field) => <Input {...field} />}
                />
                {form.values.invitations.length > 1 && (
                  <Button
                    size="icon"
                    variant="outline"
                    type="button"
                    className="shrink-0"
                    onClick={() => form.removeListItem("invitations", idx)}
                  >
                    <IconCircleMinus size={20} />
                  </Button>
                )}
              </div>
            ))}
            <div>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() =>
                  form.insertListItem("invitations", {
                    invitation_type: "one-time",
                    request_type,
                    role: "member",
                    email: "",
                    workspace_id: workspace.id,
                    invited_by_user_id: user.id,
                  })
                }
              >
                <IconCirclePlus size={20} className="mr-2" />
                <span>Add</span>
              </Button>
            </div>
            <Button variant="outline" disabled={inviteMember.isLoading}>
              {inviteMember.isLoading ? (
                <IconLoader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <IconSend className="mr-2" size={16} />
              )}
              Send Invites
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-y-2 w-full">
        <Button className="rounded-full w-full max-w-sm">
          <Link to={redirectUri}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
