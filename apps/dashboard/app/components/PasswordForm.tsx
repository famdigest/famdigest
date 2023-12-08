import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { z } from "zod";
import { Button, FormField, Input, useToast } from "@repo/ui";
import { trpc } from "~/lib/trpc";

export function PasswordForm() {
  const { toast } = useToast();
  const [show, { toggle }] = useDisclosure(false);

  const updateUserData = trpc.users.password.useMutation({
    onSuccess: () => {
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
  const form = useForm({
    validate: zodResolver(z.object({ new_password: z.string().min(8) })),
    initialValues: {
      new_password: "",
    },
  });

  const onSubmit = (values: typeof form.values) => {
    updateUserData.mutate(values);
  };

  return (
    <form className="flex flex-col gap-y-6" onSubmit={form.onSubmit(onSubmit)}>
      <FormField
        type="password"
        label="New Password"
        {...form.getInputProps("new_password")}
        render={(field) => (
          <div className="relative">
            <Input
              placeholder="minimum 8 characters"
              {...field}
              type={show ? "text" : "password"}
            />
            <Button
              className="absolute h-[85%] w-auto aspect-square top-1/2 right-1 transform -translate-y-1/2"
              size="icon"
              variant="ghost"
              type="button"
              onClick={toggle}
            >
              {show ? <IconEye size={16} /> : <IconEyeOff size={16} />}
            </Button>
          </div>
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
