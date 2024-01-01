import { useForm, zodResolver } from "@mantine/form";
import { useNavigate } from "@remix-run/react";
import { convertToLocal, guessTimezone } from "@repo/plugins";
import {
  toast,
  FormField,
  Input,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useHydrated } from "~/hooks/use-hydrated";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { convertTimeToUTC } from "~/lib/dates";
import { trpc } from "~/lib/trpc";
import { TimePicker } from "../TimePicker";
import { z } from "zod";

// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { InferSelectModel, schema } from "@repo/database";
import { Enums, profilesInsertSchema } from "@repo/supabase";

const formSchema = profilesInsertSchema.extend({
  full_name: z.string().min(1, "Must enter your full name"),
  phone: z.string().min(10, "Must enter a valid phone number"),
  preferences: z.object({
    theme: z.string().default("light"),
    notify_on: z.string().min(1, "Must provide a delivery time"),
    timezone: z.string().min(1, "Must provide a timezone"),
    event_preferences: z.string().default("same-day"),
  }),
});

type FormSchema = z.infer<typeof formSchema>;

type UserDigestProps = {
  onSuccess: () => void;
  hide?: {
    [k in keyof FormSchema]?: boolean;
  };
};
export function UserDigest({ hide, onSuccess }: UserDigestProps) {
  const { user } = useWorkspaceLoader();
  const hydrated = useHydrated();

  const updateUser = trpc.users.update.useMutation({
    onSuccess,
    onError(error) {
      toast({
        title: "Sorry!",
        description: error?.message ?? "Something went wrong",
      });
    },
  });

  const form = useForm<FormSchema>({
    validate: zodResolver(formSchema),
    initialValues: {
      id: user.id,
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      preferences: {
        ...user.preferences,
        notify_on: user?.preferences?.notify_on
          ? convertToLocal(user.preferences?.notify_on).format()
          : "",
        timezone: guessTimezone(),
        event_preferences: "same-day",
      },
    },
  });

  const onSubmit = (values: typeof form.values) => {
    const phone = values.phone?.replace(/\D/g, "");
    const notify_on = convertTimeToUTC(values.preferences.notify_on);
    updateUser.mutate({
      ...values,
      phone,
      preferences: {
        ...values.preferences,
        notify_on,
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
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
              placeholder="8:00 am"
              {...form.getInputProps("preferences.notify_on")}
              render={(field) => (
                <TimePicker
                  {...field}
                  onChange={(val) =>
                    form.setFieldValue(
                      "preferences.notify_on",
                      dayjs(val).format()
                    )
                  }
                />
              )}
            />
            <FormField<typeof Select>
              label="Preference"
              {...form.getInputProps("preferences.event_preferences")}
              render={(field) => (
                <Select
                  value={field.value}
                  onValueChange={(val) =>
                    form.setFieldValue(
                      "preferences.event_preferences",
                      val as Enums<"event_preference">
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      className="truncate"
                      placeholder="Select preference"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same-day">Same Day</SelectItem>
                    <SelectItem value="next-day">Next Day</SelectItem>
                  </SelectContent>
                </Select>
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
      </CardContent>
    </Card>
  );
}
