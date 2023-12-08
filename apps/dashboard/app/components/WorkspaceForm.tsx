import { useForm, zodResolver } from "@mantine/form";
import { IconLoader2 } from "@tabler/icons-react";
import { Button, FormField, Input, useToast } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { useIsTeamOwner } from "~/hooks/is-team-owner";
import { type Table, workspacesUpdateSchema } from "@repo/supabase";

export function WorkspaceForm({
  workspace,
}: {
  workspace: Table<"workspaces">;
}) {
  const isTeamOwner = useIsTeamOwner();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const updateWorkspace = trpc.workspaces.update.useMutation({
    onSuccess: async () => {
      await utils.workspaces.active.invalidate();
      toast({
        title: "Success",
        description: "Your workspace has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Oh no",
        description: error.message ?? "Something went wrong",
        variant: "destructive",
      });
    },
  });
  const form = useForm({
    validate: zodResolver(workspacesUpdateSchema),
    initialValues: {
      ...workspace,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    updateWorkspace.mutate(values);
  };

  return (
    <form className="flex flex-col gap-y-6" onSubmit={form.onSubmit(onSubmit)}>
      <FormField
        label="Workspace Name"
        type="text"
        {...form.getInputProps("name")}
        render={(field) => <Input {...field} />}
      />
      <FormField
        label="Handle"
        type="text"
        disabled
        {...form.getInputProps("slug")}
        render={(field) => <Input {...field} />}
      />
      <div className="flex items-center justify-start">
        <Button disabled={!isTeamOwner || updateWorkspace.isLoading}>
          {updateWorkspace.isLoading && (
            <IconLoader2 className="animate-spin mr-3" />
          )}
          Save
        </Button>
        {!isTeamOwner && (
          <p className="text-muted-foreground text-sm ml-3 max-w-sm">
            Only workspace owners/admins can update workspace settings.
          </p>
        )}
      </div>
    </form>
  );
}
