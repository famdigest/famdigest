import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Badge, Button, FormField, Input, toast } from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import { z } from "zod";
import { Explosion } from "~/components/Explosion";
import { trpc } from "~/lib/trpc";

const notifySchema = z.object({
  email: z.string().email(),
});
export default function Route() {
  const [show, { open, close }] = useDisclosure(false);
  const addToWaitlist = trpc.users.notify.useMutation({
    onSuccess() {
      open();
      form.reset();
      toast({
        title: "Yay!",
        description: "You are all signed up.",
      });
    },
  });

  const form = useForm<z.infer<typeof notifySchema>>({
    validate: zodResolver(notifySchema),
    initialValues: {
      email: "",
    },
  });

  const onSubmit = (values: typeof form.values) => {
    // do something
    addToWaitlist.mutate(values);
  };

  return (
    <>
      {show && <Explosion onConfettiComplete={() => close()} />}
      <section className="flex-1 flex items-center">
        <div className="container">
          <div className="space-y-6 md:space-y-8 max-w-screen-md">
            <Badge className="text-sm py-1 pr-3">🚀 Launching Soon</Badge>
            <h1 className="text-5xl md:text-8xl font-medium font-serif">
              Never use a shared calendar again.
            </h1>
            <h2 className="text-2xl">
              Send a short daily digest of your day to{" "}
              <span className="underline italic">anyone</span> via text message.
            </h2>
            <form
              className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-y-0 md:gap-x-2 max-w-lg pt-6"
              onSubmit={form.onSubmit(onSubmit)}
            >
              <FormField
                className="w-full"
                aria-label="email address"
                {...form.getInputProps("email")}
                render={(field) => (
                  <Input
                    placeholder="yes@signmeup.com"
                    className="text-lg h-11"
                    {...field}
                  />
                )}
              />
              <Button
                className="whitespace-nowrap group min-w-[130px]"
                size="lg"
              >
                {addToWaitlist.isLoading ? (
                  <>
                    <IconLoader2
                      className="animate-spin mr-2 shrink-0"
                      size={20}
                    />
                    <span>Good job!</span>
                  </>
                ) : (
                  <>
                    <span className="group-hover:hidden">Notify Me</span>
                    <span className="hidden group-hover:inline">Do it!</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
