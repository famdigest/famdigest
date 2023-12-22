import { useNavigate } from "@remix-run/react";
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

export default function Route() {
  const navigate = useNavigate();
  const form = useCreateDigestForm();
  const { onSubmit, isLoading } = useDigestFormSubmit((digest) => {
    navigate(`/contacts/${digest.id}`);
  });

  return (
    <div className="p-6 md:p-12 space-y-12 container max-w-screen-md">
      <DigestFormProvider form={form}>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-serif tracking-normal">
                New Contact
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
