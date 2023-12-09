import { useForm } from "@mantine/form";
import { Table, digestsRowSchema } from "@repo/supabase";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { trpc } from "~/lib/trpc";

type DigestFormModalProps = {
  children: React.ReactNode;
  digest?: Table<"digests">;
};

const formValues = digestsRowSchema.pick({
  full_name: true,
  phone: true,
  timezone: true,
  notify_on: true,
  enabled: true,
});

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
function getAllTimezones() {
  const tz = [];
  for (const timeZone of Intl.supportedValuesOf("timeZone")) {
    tz.push(timeZone);
  }
  return tz;
}

export function DigestFormModal({ digest, children }: DigestFormModalProps) {
  const [open, setOpen] = useState(false);
  const [tz] = useState(() => getAllTimezones());
  const utils = trpc.useUtils();
  const onSuccess = () => {
    utils.digests.all.invalidate();
    setOpen(false);
    toast({
      title: "Digest Added!",
    });
  };

  const create = trpc.digests.create.useMutation({ onSuccess });
  const update = trpc.digests.update.useMutation({ onSuccess });

  const form = useForm<z.infer<typeof formValues>>({
    initialValues: {
      full_name: digest?.full_name ?? "",
      phone: digest?.phone ?? "",
      timezone: digest?.timezone ?? "",
      notify_on: digest?.notify_on ?? "",
      enabled: digest?.enabled ?? true,
    },
  });

  useEffect(() => {
    form.setValues((prev) => ({
      ...prev,
      timezone: prev.timezone || getBrowserTimezone(),
    }));
  }, []);

  const onSubmit = (values: typeof form.values) => {
    //...
    if (digest) {
      update.mutate({
        ...values,
        id: digest.id,
      });
    } else {
      create.mutate({
        ...values,
      });
    }
  };

  const isLoading = create.isLoading || update.isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Digest</DialogTitle>
          <DialogDescription>
            Add a new subscriber to your daily digest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              {...form.getInputProps("full_name")}
              render={(field) => <Input {...field} />}
            />
            <FormField
              label="Phone Number"
              {...form.getInputProps("phone")}
              render={(field) => <Input {...field} />}
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
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <IconLoader2 size={20} className="animate-spin mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
