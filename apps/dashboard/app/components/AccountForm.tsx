import { useForm, zodResolver } from "@mantine/form";
import { IconLoader2 } from "@tabler/icons-react";
import type { z } from "zod";
import { Button, FormField, Input, useToast } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { type Table, profilesUpdateSchema } from "@repo/supabase";

export function AccountForm({ user }: { user: Table<"profiles"> }) {
  const { toast } = useToast();
  const utils = trpc.useContext();
  const updateUserData = trpc.users.update.useMutation({
    onSuccess: async () => {
      await utils.users.me.invalidate();
      toast({
        title: "Success",
        description: "Your profile has been updated",
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
  const form = useForm<z.infer<typeof profilesUpdateSchema>>({
    validate: zodResolver(profilesUpdateSchema),
    initialValues: {
      ...user,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    updateUserData.mutate(values);
  };

  return (
    <form className="flex flex-col gap-y-6" onSubmit={form.onSubmit(onSubmit)}>
      <FormField
        label="Full Name"
        type="text"
        {...form.getInputProps("full_name")}
        render={(field) => <Input {...field} />}
      />
      <FormField
        label="Email Address"
        type="email"
        {...form.getInputProps("email")}
        render={(field) => <Input {...field} />}
      />
      <div>
        <Button disabled={updateUserData.isLoading}>
          {updateUserData.isLoading && (
            <IconLoader2 className="animate-spin mr-3" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
