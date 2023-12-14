import { useForm } from "@mantine/form";
import { Button, Input, toast } from "@repo/ui";
import { useState } from "react";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { trpc } from "~/lib/trpc";
// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { useNavigate } from "@remix-run/react";
import { IconLoader2 } from "@tabler/icons-react";

export default function Route() {
  const { user } = useWorkspaceLoader();
  const navigate = useNavigate();
  const [capture, setCapture] = useState<"name" | "phone" | "notify">("name");
  const updateUser = trpc.users.update.useMutation();

  const form = useForm({
    initialValues: {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
    },
  });

  const onSubmit = (values: typeof form.values) => {
    const phone = values.phone?.replace(/\D/g, "");
    updateUser.mutate(
      {
        ...values,
        phone,
      },
      {
        onSuccess() {
          navigate("/onboarding/calendars");
        },
        onError(error) {
          toast({
            title: "Sorry!",
            description: error?.message ?? "Something went wrong",
          });
        },
      }
    );
  };

  return (
    <form
      className="flex-1 flex py-20 items-start justify-center overflow-hidden"
      onSubmit={form.onSubmit(onSubmit)}
    >
      <div className="container max-w-screen-md">
        <div className="grid grid-cols-4 gap-x-3 mb-12">
          <div className="h-3 rounded-full bg-foreground" />
          <div className="h-3 rounded-full bg-slate-300" />
          <div className="h-3 rounded-full bg-slate-300" />
          <div className="h-3 rounded-full bg-slate-300" />
        </div>
        {capture === "name" && (
          <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
            <p className="text-xl md:text-2xl">What is your name?</p>
            <Input
              className="px-0 text-4xl h-20 mt-2 md:mt-4 mb-6 font-serif bg-transparent border-none ring-offset-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="John Smith"
              {...form.getInputProps("full_name")}
            />
            <Button type="button" onClick={() => setCapture("phone")}>
              Next
            </Button>
          </div>
        )}
        {capture === "phone" && (
          <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
            <p className="text-xl md:text-2xl">What is your phone number?</p>
            <InputMask mask="+1 999.999.9999" {...form.getInputProps("phone")}>
              <Input
                className="px-0 text-4xl h-20 mt-2 md:mt-4 mb-6 font-serif bg-transparent border-none ring-offset-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                placeholder="+1 704.123.4567"
              />
            </InputMask>
            <div className="flex items-center gap-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCapture("name")}
              >
                Back
              </Button>
              {/* <Button type="button" onClick={() => setCapture("notify")}>
                Next
              </Button> */}
              <Button disabled={updateUser.isLoading}>
                {updateUser.isLoading && (
                  <IconLoader2 className="mr-2 animate-spin" />
                )}
                Next
              </Button>
            </div>
          </div>
        )}
        {/* {capture === "notify" && (
          <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
            <p className="text-xl md:text-2xl">
              What time do you want to receive your digest?
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
              <Button disabled={updateUser.isLoading}>
                {updateUser.isLoading && (
                  <IconLoader2 className="mr-2 animate-spin" />
                )}
                Next
              </Button>
            </div>
          </div>
        )} */}
      </div>
    </form>
  );
}
