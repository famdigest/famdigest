import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import { Calendar, db } from "@repo/database";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
} from "@repo/ui";
import { useMemo } from "react";
import {
  SubscriberFormActions,
  SubscriberFormFields,
  SubscriberFormProvider,
  useCreateSubscriberForm,
  useSubscriberFormSubmit,
} from "~/components/SubscriberForm";
import { getSessionWorkspace } from "~/lib/workspace.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response } = await getSessionWorkspace(request);
  const connections = await db.query.connections.findMany({
    with: {
      calendars: true,
    },
    where: (table, { and, eq }) =>
      and(eq(table.owner_id, user.id), eq(table.workspace_id, workspace.id)),
  });
  return json({
    connections,
  });
}

export default function Route() {
  const { connections } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const form = useCreateSubscriberForm();
  const revalidator = useRevalidator();
  const { onSubmit, isLoading } = useSubscriberFormSubmit((next) => {
    navigate(`/subscribers/${next.id}`);
  });

  const calendars: Calendar[] = connections
    .flatMap((connection) => connection.calendars)
    .sort((a, b) => Number(b.enabled) - Number(a.enabled));

  const allSelected = useMemo(() => {
    return form.values.calendar_ids?.length === calendars.length;
  }, [form.values, calendars]);

  return (
    <div className="py-6 md:py-12 space-y-12 container max-w-screen-lg">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif tracking-normal">
            Add New Subscriber
          </CardTitle>
          <CardDescription>
            Add their details and select your calendars.
          </CardDescription>
        </CardHeader>
        <SubscriberFormProvider form={form}>
          <form onSubmit={form.onSubmit(onSubmit)}>
            <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <SubscriberFormFields />
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
                      (form.values.calendar_ids ?? []).indexOf(calendar.id) >
                      -1;
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
                                form.insertListItem(
                                  "calendar_ids",
                                  calendar.id
                                );
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
    </div>
  );
}
