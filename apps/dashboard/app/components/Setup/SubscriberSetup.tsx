import { useNavigate, useRevalidator } from "@remix-run/react";
import {
  Calendar,
  ConnectionWithCalendars,
  Subscriber,
  SubscriberWithRelations,
} from "@repo/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Checkbox,
  CardFooter,
} from "@repo/ui";
import { useMemo } from "react";
import {
  useCreateSubscriberForm,
  useSubscriberFormSubmit,
  SubscriberFormProvider,
  SubscriberFormFields,
  SubscriberFormActions,
} from "../SubscriberForm";

type SubscriberSetupProps = {
  connections: ConnectionWithCalendars[];
  subscriber?: SubscriberWithRelations;
  selfSub?: boolean;
  onSuccess: () => void;
};
export function SubscriberSetup({
  connections,
  subscriber,
  selfSub = false,
  onSuccess,
}: SubscriberSetupProps) {
  const navigate = useNavigate();
  const form = useCreateSubscriberForm(subscriber);
  const { onSubmit, isLoading } = useSubscriberFormSubmit((next) => {
    onSuccess();
  });

  const calendars: Calendar[] = connections
    .flatMap((connection) => connection.calendars)
    .sort((a, b) => Number(b.enabled) - Number(a.enabled));

  const allSelected = useMemo(() => {
    return form.values.calendar_ids?.length === calendars.length;
  }, [form.values, calendars]);

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-serif tracking-normal">
          {selfSub ? "Subscribe" : "Add New Subscriber"}
        </CardTitle>
        <CardDescription>
          {selfSub
            ? "Subscribe to your own daily digest."
            : "Add their details and select your calendars."}
        </CardDescription>
      </CardHeader>
      <SubscriberFormProvider form={form}>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <CardContent className="p-6 grid grid-cols-1 gap-6">
            <div>
              <SubscriberFormFields layout="grid" />
            </div>
            <div className="space-y-1">
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
                    (form.values.calendar_ids ?? []).indexOf(calendar.id) > -1;
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
                              if (!form.values.calendar_ids) {
                                form.setFieldValue("calendar_ids", [
                                  calendar.id,
                                ]);
                              } else {
                                form.insertListItem(
                                  "calendar_ids",
                                  calendar.id
                                );
                              }
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
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t p-6">
            <SubscriberFormActions
              isLoading={isLoading}
              onCancel={() => navigate(-1)}
            />
          </CardFooter>
        </form>
      </SubscriberFormProvider>
    </Card>
  );
}
