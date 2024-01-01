// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { createFormContext, zodResolver } from "@mantine/form";
import { Link } from "@remix-run/react";
import { Enums, subscriptionsRowSchema } from "@repo/supabase";
import {
  Button,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  cn,
  toast,
} from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  convertTimeToUTC,
  convertToLocal,
  convertToUTC,
  guessTimezone,
} from "~/lib/dates";
import { trpc } from "~/lib/trpc";
import { useHydrated } from "~/hooks/use-hydrated";
import { Subscriber, SubscriberWithRelations } from "@repo/database";
import { TimePicker } from "./TimePicker";
import dayjs from "dayjs";

const formValues = subscriptionsRowSchema
  .pick({
    full_name: true,
    phone: true,
    timezone: true,
    notify_on: true,
    enabled: true,
    event_preferences: true,
  })
  .extend({
    id: z.string().optional(),
    calendar_ids: z.array(z.string()).optional(),
  });

function getAllTimezones() {
  const tz = [];
  for (const timeZone of Intl.supportedValuesOf("timeZone")) {
    tz.push(timeZone);
  }
  return tz;
}

const [SubscriberFormProvider, useSubscriberFormContext, useSubscriberForm] =
  createFormContext<z.infer<typeof formValues>>();

export function useCreateSubscriberForm(subscriber?: SubscriberWithRelations) {
  const form = useSubscriberForm({
    validate: zodResolver(formValues),
    initialValues: {
      id: subscriber?.id ?? undefined,
      full_name: subscriber?.full_name ?? "",
      phone: subscriber?.phone ?? "",
      timezone: subscriber?.timezone ?? "",
      notify_on: subscriber?.notify_on
        ? convertToLocal(subscriber.notify_on).format()
        : dayjs().hour(8).minute(0).format(),
      enabled: subscriber?.enabled ?? true,
      event_preferences: subscriber?.event_preferences ?? "same-day",
      calendar_ids: subscriber
        ? subscriber.subscription_calendars.map((sc) => sc.calendar_id)
        : undefined,
    },
  });

  console.log("useCreateSubscriberForm", form.values);
  useEffect(() => {
    form.setValues((prev) => ({
      ...prev,
      timezone: prev.timezone || guessTimezone(),
    }));
  }, []);

  return form;
}

export function useSubscriberFormSubmit(cb?: (subscriber: Subscriber) => void) {
  const utils = trpc.useUtils();
  const create = trpc.subscribers.create.useMutation({
    async onSuccess(data, variables) {
      await utils.subscribers.invalidate();
      cb?.(data);
      toast({
        title: variables.id ? "Subscriber Updated!" : "Subscriber Added!",
      });
    },
  });
  const update = trpc.subscribers.update.useMutation({
    async onSuccess(data, variables) {
      await utils.subscribers.invalidate();
      cb?.(data);
      toast({
        title: variables.id ? "Subscriber Updated!" : "Subscriber Added!",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formValues>) => {
    //...
    const phone = values.phone?.replace(/\D/g, "");
    const notify_on = convertTimeToUTC(values.notify_on);
    if (values.id) {
      update.mutate({
        ...values,
        id: values.id,
        notify_on,
        phone,
      });
    } else {
      const { id, calendar_ids = [], ...input } = values;
      create.mutate({
        ...input,
        notify_on,
        phone,
        calendar_ids,
      });
    }
  };

  return {
    onSubmit,
    isLoading: create.isLoading || update.isLoading,
  };
}

export function SubscriberFormFields({ layout = "grid" }: { layout?: string }) {
  const form = useSubscriberFormContext();
  const [tz] = useState(() => getAllTimezones());
  const hydrated = useHydrated();

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        layout === "grid" && "lg:grid-cols-2"
      )}
    >
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
              <Input />
            </InputMask>
          ) : (
            <Input {...field} />
          )
        }
      />
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          layout === "grid" && "lg:col-span-2 lg:grid-cols-3"
        )}
      >
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
        <FormField<typeof Select>
          label="Timezone"
          {...form.getInputProps("timezone")}
          render={(field) => (
            <Select
              value={field.value}
              onValueChange={(val) => form.setFieldValue("timezone", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {tz.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormField<typeof Select>
          label="Preference"
          {...form.getInputProps("event_preferences")}
          render={(field) => (
            <Select
              value={field.value}
              onValueChange={(val) =>
                form.setFieldValue(
                  "event_preferences",
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
      </div>
      <FormField<typeof Switch>
        label="Enabled"
        {...form.getInputProps("enabled", { type: "checkbox" })}
        render={(field) => (
          <Switch
            {...field}
            onCheckedChange={(checked) =>
              form.setFieldValue("enabled", checked)
            }
          />
        )}
      />
    </div>
  );
}

export function SubscriberFormActions({
  isLoading,
  onCancel,
}: {
  isLoading?: boolean;
  onCancel?: () => void;
}) {
  return (
    <>
      <p className="text-xs max-w-sm">
        By creating this subscriber, you agree to our{" "}
        <Link to="https://www.famdigest.com/terms" className="underline">
          terms
        </Link>{" "}
        and <strong>opt-in</strong> to receive SMS messages from FamDigest.com
      </p>
      <div className="flex items-center gap-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <IconLoader2 size={20} className="animate-spin mr-2" />}
          Save
        </Button>
      </div>
    </>
  );
}

export { SubscriberFormProvider, useSubscriberFormContext };
