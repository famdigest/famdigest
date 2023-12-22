import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { trackPageView } from "@repo/tracking";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import {
  DigestFormActions,
  DigestFormFields,
  DigestFormProvider,
  useCreateDigestForm,
  useDigestFormSubmit,
} from "~/components/Digests/DigestForm";
import { db } from "~/lib/db.server";
import { getSession } from "~/lib/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params as { id: string };
  const digest = await db.query.digests.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  });

  if (!digest) {
    throw new Response("", {
      status: 404,
      statusText: "Contact not found",
    });
  }

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "contacts:id:edit",
      user_id: session.get("userId"),
    },
  });

  return json({
    digest,
  });
}

export default function Route() {
  const { digest } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const form = useCreateDigestForm(digest);
  const { onSubmit, isLoading } = useDigestFormSubmit((_next) => {
    navigate(`/contacts`);
  });

  return (
    <div className="p-6 md:p-12 space-y-12 container max-w-screen-md">
      <DigestFormProvider form={form}>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-serif tracking-normal">
                Edit Contact
              </CardTitle>
              <CardDescription>
                Add a new contact to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DigestFormFields />
            </CardContent>
            <CardFooter className="border-t p-6 gap-x-6">
              <DigestFormActions
                isLoading={isLoading}
                onCancel={() => navigate(-1)}
              />
            </CardFooter>
          </Card>
        </form>
      </DigestFormProvider>
    </div>
  );
}
