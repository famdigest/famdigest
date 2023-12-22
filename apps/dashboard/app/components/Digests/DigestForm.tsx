// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { createFormContext, zodResolver } from "@mantine/form";
import { Link } from "@remix-run/react";
import { Table, digestsRowSchema } from "@repo/supabase";
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
  toast,
} from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { convertToLocal, convertToUTC, guessTimezone } from "~/lib/dates";
import { trpc } from "~/lib/trpc";
import { useHydrated } from "~/hooks/use-hydrated";

const formValues = digestsRowSchema
  .pick({
    full_name: true,
    phone: true,
    timezone: true,
    notify_on: true,
    enabled: true,
  })
  .extend({
    id: z.string().optional(),
  });

function getAllTimezones() {
  const tz = [];
  for (const timeZone of Intl.supportedValuesOf("timeZone")) {
    tz.push(timeZone);
  }
  return tz;
}

const [DigestFormProvider, useDigestFormContext, useDigestForm] =
  createFormContext<z.infer<typeof formValues>>();

export function useCreateDigestForm(digest?: Table<"digests">) {
  const form = useDigestForm({
    validate: zodResolver(formValues),
    initialValues: {
      id: digest?.id ?? undefined,
      full_name: digest?.full_name ?? "",
      phone: digest?.phone ?? "",
      timezone: digest?.timezone ?? "",
      notify_on: digest
        ? convertToLocal(digest.notify_on).format("HH:mm:ss")
        : "",
      enabled: digest?.enabled ?? true,
    },
  });

  useEffect(() => {
    form.setValues((prev) => ({
      ...prev,
      timezone: prev.timezone || guessTimezone(),
    }));
  }, []);

  return form;
}

export function useDigestFormSubmit(cb?: (digest: Table<"digests">) => void) {
  const utils = trpc.useUtils();
  const create = trpc.digests.create.useMutation({
    async onSuccess(data, variables) {
      await utils.digests.invalidate();
      cb?.(data);
      toast({
        title: variables.id ? "Contact Updated!" : "Contact Added!",
      });
    },
  });
  const update = trpc.digests.update.useMutation({
    async onSuccess(data, variables) {
      await utils.digests.invalidate();
      cb?.(data);
      toast({
        title: variables.id ? "Contact Updated!" : "Contact Added!",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formValues>) => {
    //...
    const notify_on = convertToUTC(values.notify_on);
    if (values.id) {
      update.mutate({
        ...values,
        id: values.id,
        notify_on,
      });
    } else {
      create.mutate({
        ...values,
        notify_on,
      });
    }
  };

  return {
    onSubmit,
    isLoading: create.isLoading || update.isLoading,
  };
}

export function DigestFormFields() {
  const form = useDigestFormContext();
  const [tz] = useState(() => getAllTimezones());
  const hydrated = useHydrated();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Full Name"
        {...form.getInputProps("full_name")}
        render={(field) => <Input {...field} />}
      />
      <FormField
        label="Phone Number"
        {...form.getInputProps("phone")}
        render={(field) =>
          hydrated ? (
            <InputMask mask="+1 999.999.9999" {...field}>
              <Input />
            </InputMask>
          ) : (
            <></>
          )
        }
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
      <FormField
        label="Time"
        type="time"
        {...form.getInputProps("notify_on")}
        render={(field) => <Input {...field} />}
      />
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

export function DigestFormActions({
  isLoading,
  onCancel,
}: {
  isLoading?: boolean;
  onCancel?: () => void;
}) {
  return (
    <>
      <p className="text-xs">
        By creating this digest, you agree to our{" "}
        <Link to="https://www.famdigest.com/terms" className="underline">
          terms
        </Link>{" "}
        and <strong>opt-in</strong> to receive SMS messages from FamDigest.com
      </p>
      <div className="flex items-center gap-x-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            onCancel?.();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <IconLoader2 size={20} className="animate-spin mr-2" />}
          Save
        </Button>
      </div>
    </>
  );
}

export { DigestFormProvider, useDigestFormContext };
