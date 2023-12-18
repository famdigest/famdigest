import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { trackPageView } from "@repo/tracking";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  toast,
} from "@repo/ui";
import {
  IconBulb,
  IconCalendarPlus,
  IconDeviceMobile,
  IconMessage2,
  IconUserCheck,
} from "@tabler/icons-react";
import { z } from "zod";
import { Explosion } from "~/components/Explosion";
import { getSession } from "~/lib/session.server";
import { trpc } from "~/lib/trpc";
import { Pricing, type ProductWithPricing } from "~/components/Pricing";
import { db } from "~/lib/db.server";
import { SocialProof } from "~/components/SocialProof";

const notifySchema = z.object({
  email: z.string().email(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "home",
      user_id: session.get("userId"),
    },
  });

  const products = await db.query.billing_products.findMany({
    with: {
      billing_prices: true,
    },
  });
  return json({
    id: session.id,
    products,
  });
}

export default function Route() {
  const { id, products } = useLoaderData<typeof loader>();
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
      <section className="min-h-[90svh] flex items-center">
        <div className="container max-w-screen-xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 py-16 md:py-0">
          <div className="flex flex-col justify-center items-start gap-y-6 md:gap-y-8">
            <Badge className="text-sm py-1 pr-3 bg-slate-800">🚀 Beta</Badge>
            <h1 className="text-5xl md:text-7xl font-medium font-serif text-slate-800">
              Never use a shared calendar again.
            </h1>
            <h2 className="text-xl md:text-2xl text-slate-700">
              Send a short daily digest of your day to{" "}
              <span className="underline italic">anyone</span> via text message.
            </h2>
            <Button className="mt-4" size="xl" shape="pill" asChild>
              <Link to="https://app.famdigest.com/sign-up">Start Today</Link>
            </Button>
            {/* <form
              className="flex flex-col md:flex-row md:items-start gap-y-2 md:gap-y-0 md:gap-x-2 w-full max-w-lg pt-6"
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
            </form> */}
          </div>
          <div className="flex items-center justify-center relative p-6 md:p-12">
            <div className="rounded-xl overflow-hidden">
              <img src="/assets/images/woman-texting.png" alt="girl texting" />
            </div>
            <img
              src="/assets/images/ios-notification.png"
              alt="notification ui element"
              aria-hidden={true}
              className="shadow-lg absolute top-[35%] -right-1/3 md:-right-[10%] transform"
            />
            <img
              src="/assets/images/calendar-notification.png"
              alt="notification ui element"
              aria-hidden={true}
              className="absolute top-[70%] -left-[5%] md:left-0 transform"
            />
            <img
              src="/assets/images/calendar-notification.png"
              alt="notification ui element"
              aria-hidden={true}
              className="absolute top-[90%] md:top-[87%] left-[25%] transform"
            />
          </div>
        </div>
      </section>

      <section id="overview" className="pb-12 md:pb-24">
        <div className="container mb-16 max-w-screen-md text-center">
          <h2 className="mb-6 font-serif text-5xl font-medium md:text-6xl tracking-tight text-slate-800">
            Calendar Communication Made Easy
          </h2>
          <p className="text-lg text-slate-700">
            Share your schedule effortlessly with friends, family, and
            colleagues.
          </p>
        </div>
        <div className="container max-w-screen-md flex flex-col-reverse md:flex-row gap-8 items-center">
          <div className="px-8">
            <img
              src="/assets/images/iphone-mock.png"
              alt="iphone mock of a daily digest"
            />
          </div>
          <div className="flex-1 grid grid-cols-1 gap-8 md:gap-12">
            {/* next */}
            <div className="flex flex-col gap-y-4 items-center md:items-start">
              <div className="h-16 w-16 rounded-full bg-background p-1.5">
                <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                  <IconUserCheck />
                </div>
              </div>
              <div className="flex flex-col gap-y-4 items-center text-center md:items-start md:text-left">
                <h3 className="text-2xl font-medium font-serif">Easy Setup</h3>
                <p className="text-foreground/75">
                  Tired of trying to keep a shared calendar organized? ...That
                  you'll end up never using? We're here to fix that. No more
                  shared calendars. Text? Yes please!
                </p>
              </div>
            </div>

            {/* next */}
            <div className="flex flex-col gap-y-4 items-center md:items-start">
              <div className="h-16 w-16 rounded-full bg-background p-1.5">
                <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                  <IconCalendarPlus />
                </div>
              </div>
              <div className="flex flex-col gap-y-4 items-center text-center md:items-start md:text-left">
                <h3 className="text-2xl font-medium font-serif">
                  Unlimited Calendars
                </h3>
                <p className="text-foreground/75">
                  Whether it's work, personal, or a side project, have all your
                  calendars synced to generate your daily digest text. Easy!
                </p>
              </div>
            </div>

            {/*  */}
            <div className="flex flex-col gap-y-4 items-center md:items-start">
              <div className="h-16 w-16 rounded-full bg-background p-1.5">
                <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                  <IconMessage2 />
                </div>
              </div>
              <div className="flex flex-col gap-y-4 items-center text-center md:items-start md:text-left">
                <h3 className="text-2xl font-medium font-serif">
                  Daily Text Digests
                </h3>
                <p className="text-foreground/75">
                  Keep your spouse, nanny, or anyone else in the loop without
                  the need for them to check a shared calendar - simplicity at
                  its best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-0">
        <SocialProof />
      </section>

      <section className="py-12 md:py-24">
        <div className="container mb-16 max-w-screen-md text-center">
          <h2 className="mb-6 font-serif text-5xl font-medium md:text-6xl tracking-tight text-slate-800">
            How it works
          </h2>
          <p className="text-lg text-slate-700">
            Start now - it only takes less than 30 seconds to get up and
            running!
          </p>
        </div>
        <div className="container max-w-screen-xl grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center gap-y-6 p-6">
            <IconBulb />
            <h3 className="text-3xl font-serif">
              Step 1<br />
              Create an Account
            </h3>
            <p className="">
              Sign up for a FamDigest account. This will give you the ability to
              manage your calendars, digests and make changes as needed.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-y-6 p-6">
            <IconCalendarPlus />
            <h3 className="text-3xl font-serif">
              Step 2<br />
              Sync Calendars
            </h3>
            <p className="">
              Feel free to connect as many calendars as you wish - whether it's
              your work, personal, or even your side gig. You can add them all!
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-y-6 p-6">
            <IconDeviceMobile />
            <h3 className="text-3xl font-serif">
              Step 3<br />
              Add Phone Number
            </h3>
            <p className="">
              Provide the phone number and delivery time for who you'd like to
              receive your daily digest. This could be your spouse, family
              nanny, or any person you wish to share your schedule with.
            </p>
          </div>
        </div>
        <div className="container mt-8 text-center">
          <Button asChild shape="pill">
            <Link to="https://app.famdigest.com/sign-up">
              Start your free trial
            </Link>
          </Button>
        </div>
      </section>

      <section className="">
        <Pricing products={products as ProductWithPricing[]} />
      </section>

      <section className="py-12 md:py-24">
        <div className="container mb-16 max-w-screen-md text-center">
          <h2 className="mb-6 font-serif text-5xl font-medium md:text-6xl tracking-tight text-slate-800">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-700">
            Everything you need to know about the product and billing.
          </p>
        </div>
        <div className="container max-w-screen-md">
          <Accordion type="multiple">
            <AccordionItem value="1">
              <AccordionTrigger className="font-serif text-xl font-medium text-left">
                Is there a free trial available?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                Yes, you can try us for free for 14 days. No credit card
                required.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger className="font-serif text-xl font-medium text-left">
                Can I add our family Nanny to get my schedule?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                Absolutely! You can add as many people as you want to your
                schedule.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger className="font-serif text-xl font-medium text-left">
                Do you offer any discounts?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                Yes, we do offer discounts for annual subscriptions. Please see
                pricing for more details.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger className="font-serif text-xl font-medium text-left">
                Can I really add unlimited calendars?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                Absolutely! You can add as many calendars as you like. The sky's
                the limit!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5">
              <AccordionTrigger className="font-serif text-xl font-medium text-left">
                How secure is my data?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                We take data security very seriously. All your data is encrypted
                and stored securely. We never share your data with third
                parties.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="6">
              <AccordionTrigger className="font-serif text-xl font-medium text-left">
                Can I cancel my subscription at any time?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                Yes, you can cancel your subscription at any time from your
                account settings. No hidden fees or penalties.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  );
}
