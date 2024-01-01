import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  convertTimeToLocalTime,
  convertToLocal,
  guessTimezone,
} from "@repo/plugins";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Switch,
  toast,
} from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import dayjs from "dayjs";
import { z } from "zod";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { convertTimeToUTC } from "~/lib/dates";
import { trpc } from "~/lib/trpc";
import { TimePicker } from "./TimePicker";
import { useHydrated } from "~/hooks/use-hydrated";
import { useDigestConfigured } from "~/hooks/digest-configured";

// @ts-ignore
import InputMask from "@mona-health/react-input-mask";

const formSchema = z.object({
  full_name: z.string().min(1, "Must enter your full name"),
  phone: z.string().min(10, "Must enter a valid phone number"),
  notify_on: z.string().min(1, "Must provide a delivery time"),
  timezone: z.string().min(1, "Must provide a delivery time"),
});
type FormSchema = z.infer<typeof formSchema>;

export function EnableDigest() {
  const hydrated = useHydrated();
  const { user: initialData } = useWorkspaceLoader();
  const [opened, { toggle, close }] = useDisclosure(false);
  const { data: user } = trpc.users.me.useQuery(undefined, {
    initialData,
  });
  const utils = trpc.useUtils();
  const updateUser = trpc.users.update.useMutation({
    async onSuccess() {
      await utils.users.invalidate();
    },
  });
  const digestConfigurationComplete = useDigestConfigured(user);

  const form = useForm<FormSchema>({
    validate: zodResolver(formSchema),
    initialValues: {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      notify_on: user?.notify_on ? convertToLocal(user.notify_on).format() : "",
      timezone: guessTimezone(),
    },
  });

  const onSubmit = (values: typeof form.values) => {
    const phone = values.phone?.replace(/\D/g, "");
    const notify_on = convertTimeToUTC(values.notify_on);
    updateUser.mutate(
      {
        ...values,
        enabled: true,
        phone,
        notify_on,
      },
      {
        onSuccess() {
          close();
        },
      }
    );
  };

  const handleCheckChanged = (checked: boolean) => {
    if (!user.phone && checked) {
      toggle();
      return;
    }

    updateUser.mutate(
      {
        enabled: checked,
      },
      {
        onSuccess() {
          toast({
            title: "Success",
            description:
              "Your digest has been " + checked ? "enabled" : "disabled",
          });
        },
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-normal">
            {!digestConfigurationComplete ? (
              <>Enable your digest</>
            ) : (
              <>
                Digest enabled, next one is at{" "}
                {convertTimeToLocalTime(user.notify_on!, user.timezone!).format(
                  "dddd h:mm a"
                )}
              </>
            )}
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <Switch
              checked={digestConfigurationComplete}
              onCheckedChange={handleCheckChanged}
            />
          </div>
        </CardHeader>
      </Card>

      <Dialog open={opened} onOpenChange={toggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Your Digest</DialogTitle>
            <DialogDescription>
              To recieve your digest, we need your phone number and preferred
              delivery time.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.onSubmit(onSubmit)}
            className="flex flex-col gap-y-6"
          >
            <fieldset className="space-y-4">
              <FormField
                label="Your Name"
                name="full_name"
                placeholder="Nick Miller"
                {...form.getInputProps("full_name")}
                render={(field) => <Input {...field} />}
              />
              <FormField
                label="Phone Number"
                name="phone"
                placeholder="+1 555.000.0000"
                {...form.getInputProps("phone")}
                render={(field) =>
                  hydrated ? (
                    <InputMask mask="+1 999.999.9999" {...field}>
                      <Input placeholder="+1 555.000.0000" />
                    </InputMask>
                  ) : (
                    <Input placeholder="+1 555.000.0000" />
                  )
                }
              />
              <FormField
                label="Delivery Time"
                name="notify_on"
                placeholder="08:00 am"
                {...form.getInputProps("notify_on")}
                render={(field) => (
                  <TimePicker
                    {...field}
                    onChange={(val) =>
                      form.setFieldValue("notify_on", dayjs(val).format())
                    }
                  />
                )}
              />
            </fieldset>

            <div className="flex justify-center">
              <Button
                disabled={updateUser.isLoading}
                className="rounded-full w-full"
              >
                {updateUser.isLoading && (
                  <IconLoader2 className="mr-2 animate-spin" />
                )}
                Next
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
