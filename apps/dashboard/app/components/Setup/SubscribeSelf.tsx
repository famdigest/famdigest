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
  Checkbox,
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
import { useMemo } from "react";

const formSchema = z.object({
  full_name: z.string().min(1, "Must enter your full name"),
  phone: z.string().min(10, "Must enter a valid phone number"),
  notify_on: z.string().min(1, "Must provide a delivery time"),
  timezone: z.string().min(1, "Must provide a delivery time"),
  calendar_ids: z.array(z.string()),
});

type Connection = InferSelectModel<typeof schema.connections>;
type Calendar = InferSelectModel<typeof schema.calendars>;
type Subscriber = InferSelectModel<typeof schema.subscriptions>;
type SubscriberCalendars = InferSelectModel<
  typeof schema.subscription_calendars
> & {
  calendar: Calendar;
};
type FormSchema = z.infer<typeof formSchema>;

type SubscribeSelfProps = {
  onSuccess: () => void;
  connections: Array<Connection & { calendars: Calendar[] }>;
  subscriber:
    | (Subscriber & { subscription_calendars: SubscriberCalendars[] })
    | undefined;
};
export function SubscribeSelf({
  connections,
  subscriber,
  onSuccess,
}: SubscribeSelfProps) {
  const { user } = useWorkspaceLoader();
  const hydrated = useHydrated();

  const updateUser = trpc.users.update.useMutation({
    onError(error) {
      toast({
        title: "Sorry!",
        description: error?.message ?? "Something went wrong",
      });
    },
  });
  const createSubscriber = trpc.subscribers.create.useMutation({
    onSuccess,
    onError(error) {
      toast({
        title: "Sorry!",
        description: error?.message ?? "Something went wrong",
      });
    },
  });
  const updateSubscriber = trpc.subscribers.update.useMutation({
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
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      notify_on: subscriber?.notify_on
        ? convertToLocal(subscriber.notify_on).format()
        : "",
      timezone: guessTimezone(),
      calendar_ids: [],
    },
  });

  const onSubmit = async (values: typeof form.values) => {
    const phone = values.phone?.replace(/\D/g, "");
    const notify_on = convertTimeToUTC(values.notify_on);
    await updateUser.mutateAsync({
      full_name: values.full_name,
      phone,
    });

    if (subscriber) {
      updateSubscriber.mutate({
        id: subscriber.id,
        ...values,
        notify_on,
        phone,
      });
    } else {
      createSubscriber.mutate({
        ...values,
        notify_on,
        phone,
      });
    }
  };

  const calendars: Calendar[] = connections
    .flatMap((connection) => connection.calendars)
    .sort((a, b) => Number(b.enabled) - Number(a.enabled));

  const allSelected = useMemo(() => {
    return form.values.calendar_ids.length === calendars.length;
  }, [form.values, calendars]);

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

          <fieldset className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                Select Calendars
              </p>
              <Button
                variant="link"
                type="button"
                className="p-0 h-auto"
                onClick={() => {
                  if (allSelected) {
                    form.setFieldValue("calendar_ids", []);
                  } else {
                    form.setFieldValue(
                      "calendar_ids",
                      calendars.map((c) => c.id)
                    );
                  }
                }}
              >
                {allSelected ? "Select None" : "Select All"}
              </Button>
            </div>
            <div className="border rounded-lg">
              {calendars.map((calendar, idx) => {
                const isChecked =
                  form.values.calendar_ids.indexOf(calendar.id) > -1;
                return (
                  <div
                    key={calendar.id}
                    className="flex justify-between items-center p-2 border-b last-of-type:border-0"
                  >
                    <span className="text-sm">{calendar.name}</span>
                    <div>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            form.insertListItem("calendar_ids", calendar.id);
                          } else {
                            form.removeListItem("calendar_ids", idx);
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
