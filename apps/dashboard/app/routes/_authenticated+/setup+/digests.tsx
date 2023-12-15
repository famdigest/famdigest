import { useForm, zodResolver } from "@mantine/form";
import { Button, Input, Separator, toast } from "@repo/ui";
import { useState } from "react";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { trpc } from "~/lib/trpc";
// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { IconLoader2 } from "@tabler/icons-react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getSession, requireAuthSession } from "~/lib/session.server";
import { db, desc, eq, schema } from "~/lib/db.server";
import { convertToLocal, convertToUTC, guessTimezone } from "~/lib/dates";
import { Table, digestsInsertSchema } from "@repo/supabase";
import { trackPageView } from "@repo/tracking";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  const digests = await db
    .select()
    .from(schema.digests)
    .where(eq(schema.digests.owner_id, user.id))
    .orderBy(desc(schema.digests.created_at));

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "setup:digests",
      user_id: session.get("userId"),
    },
  });

  return json(
    {
      digests,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const { user } = useWorkspaceLoader();
  const { digests: initialData } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [capture, setCapture] = useState<"name" | "phone" | "notify">("name");
  const [index, setIndex] = useState<number>(0);
  const utils = trpc.useUtils();

  const onSuccess = async () => {
    await utils.digests.invalidate();
    form.reset();
  };

  const { data: digests } = trpc.digests.all.useQuery(undefined, {
    initialData,
  });
  const create = trpc.digests.create.useMutation({ onSuccess });
  const update = trpc.digests.update.useMutation({ onSuccess });

  const form = useForm({
    validate: zodResolver(
      digestsInsertSchema.pick({
        id: true,
        full_name: true,
        phone: true,
        notify_on: true,
        enabled: true,
        opt_in: true,
        timezone: true,
      })
    ),
    initialValues: {
      id: "",
      full_name: "",
      phone: "",
      notify_on: "",
      enabled: true,
      opt_in: false,
      timezone: guessTimezone(),
    },
  });

  const validateNameStep = () => {
    if (form.values.full_name.length > 0) {
      setCapture("phone");
    } else {
      toast({
        title: "Please enter a name.",
        variant: "destructive",
      });
    }
  };

  const validatePhoneStep = () => {
    const valid = form.values.phone?.replace(/\D/g, "").length === 11;
    if (valid) {
      setCapture("notify");
    } else {
      toast({
        title: "Please enter a 10 digit phone number.",
        variant: "destructive",
      });
    }
  };

  const validateTime = () => {
    const time = convertToUTC(form.values.notify_on);
    if (time === "Invalid Date") {
      toast({
        title: "Please enter a valid date.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const setFormFromDigest = (digest: Table<"digests">) => {
    setCapture("name");
    form.setValues({
      ...digest,
      notify_on: convertToLocal(digest.notify_on).format("hh:mm a"),
      timezone: digest.timezone || guessTimezone(),
    });
  };

  const saveDigest = (values: typeof form.values, isDone: boolean = false) => {
    const notify_on = convertToUTC(values.notify_on);
    const onSuccess = () => {
      if (isDone) {
        navigate("/setup/confirm");
      }
    };
    if (values.id.length) {
      update.mutate(
        {
          ...values,
          id: values.id,
          notify_on,
        },
        { onSuccess }
      );
    } else {
      create.mutate(
        {
          ...values,
          id: undefined,
          notify_on,
        },
        { onSuccess }
      );
    }
  };

  const onSubmit = (values: typeof form.values) => {
    if (capture === "name") {
      return validateNameStep();
    } else if (capture === "phone") {
      return validatePhoneStep();
    } else {
      if (!validateTime()) {
        return;
      }
    }

    saveDigest(values, true);
  };

  const onDone = () => {
    saveDigest(form.values, true);
  };

  return (
    <form
      className="flex-1 flex py-20 items-start justify-center overflow-hidden"
      onSubmit={form.onSubmit(onSubmit)}
    >
      <div className="container max-w-screen-md">
        <div className="grid grid-cols-4 gap-x-3 mb-12">
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-slate-300" />
        </div>

        <div className="">
          {capture === "name" && (
            <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
              <p className="text-xl md:text-2xl">
                Who do you want to send your daily schedule to?
              </p>
              <Input
                className="px-0 text-4xl h-20 mt-2 md:mt-4 mb-6 font-serif bg-transparent border-none ring-offset-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                placeholder="Jane Smith"
                {...form.getInputProps(`full_name`)}
              />

              <div className="flex items-center gap-x-3">
                <Button
                  type="button"
                  onClick={() => {
                    validateNameStep();
                  }}
                >
                  Next
                </Button>
                <Button className="ml-auto" variant="ghost" asChild>
                  <Link to="/setup/confirm">Skip</Link>
                </Button>
              </div>
            </div>
          )}
          {capture === "phone" && (
            <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
              <p className="text-xl md:text-2xl">
                What is their cell phone number?
              </p>
              <InputMask
                mask="+1 999.999.9999"
                {...form.getInputProps(`phone`)}
              >
                <Input
                  className="px-0 text-4xl h-20 mt-2 md:mt-4 mb-6 font-serif bg-transparent border-none ring-offset-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  placeholder="+1 704.123.4567"
                />
              </InputMask>
              <div className="flex items-center gap-x-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setCapture("name")}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    validatePhoneStep();
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          {capture === "notify" && (
            <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
              <p className="text-xl md:text-2xl">
                What time do you want to send them your digest?
              </p>
              <InputMask
                mask={[
                  /[0-9]/,
                  /[0-9]/,
                  ":",
                  /[0-9]/,
                  /[0-9]/,
                  " ",
                  /[ap]/i,
                  /[m]/i,
                ]}
                placeholder="08:00 am"
                {...form.getInputProps(`notify_on`)}
              >
                <Input
                  className="px-0 text-4xl h-20 mt-2 md:mt-4 mb-6 font-serif bg-transparent border-none ring-offset-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  placeholder="08:00 am"
                />
              </InputMask>
              <div className="flex items-center gap-x-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setCapture("phone")}
                >
                  Back
                </Button>
                {/* <Button type="submit" variant="outline">
                  Add Another
                </Button> */}
                <Button type="button" onClick={() => onDone()}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-foreground my-12" />
        <div className="space-y-4">
          {digests.map((digest, idx) => (
            <div key={idx} className="flex items-center">
              <div className="space-y-0.5">
                <p className="text-base font-medium">{digest.full_name}</p>
                <div className="text-sm flex items-center gap-x-1.5">
                  {digest.phone} /{" "}
                  {convertToLocal(digest.notify_on).format("h:mm a")}
                </div>
              </div>
              <Button
                className="ml-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setFormFromDigest(digest)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
