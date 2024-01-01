// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { useForm, zodResolver } from "@mantine/form";
import { IconLoader2 } from "@tabler/icons-react";
import {
  Button,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { profilesUpdateSchema } from "@repo/supabase";
import { useRevalidator } from "@remix-run/react";
import { Profile } from "@repo/database";

export function AccountForm({ user }: { user: Profile }) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const revalidator = useRevalidator();
  const updateUserData = trpc.users.update.useMutation({
    onSuccess: async () => {
      await utils.users.me.invalidate();
      revalidator.revalidate();
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

  const form = useForm<Profile>({
    validate: zodResolver(profilesUpdateSchema),
    initialValues: {
      ...user,
      preferences: {
        ...(user.preferences ?? {}),
        theme: user.preferences?.theme ?? "light",
      },
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
      <FormField
        label="Phone Number"
        {...form.getInputProps("phone")}
        render={(field) => (
          <InputMask mask="+1 999.999.9999" {...field}>
            <Input />
          </InputMask>
        )}
      />
      <FormField<typeof Select>
        label="Theme"
        {...form.getInputProps("preferences.theme")}
        render={(field) => (
          <Select
            value={field.value ?? "light"}
            onValueChange={(val) =>
              form.setFieldValue("preferences.theme", val)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        )}
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
