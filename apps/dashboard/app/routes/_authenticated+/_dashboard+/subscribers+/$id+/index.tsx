import {
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "@remix-run/react";
import { ContextType } from "./_layout";
import {
  SubscriberFormActions,
  SubscriberFormFields,
  SubscriberFormProvider,
  useCreateSubscriberForm,
  useSubscriberFormSubmit,
} from "~/components/SubscriberForm";

export default function Route() {
  const { subscriber } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const form = useCreateSubscriberForm(subscriber);
  const revalidator = useRevalidator();
  const { onSubmit, isLoading } = useSubscriberFormSubmit((_next) => {
    revalidator.revalidate();
  });

  return (
    <>
      <header className="flex flex-col space-y-1.5 p-6 border-b">
        <h3 className="font-semibold leading-none text-xl font-serif tracking-normal">
          Subscriber Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscriber's details.
        </p>
      </header>
      <SubscriberFormProvider form={form} key={subscriber.updated_at}>
        <form
          onSubmit={form.onSubmit(onSubmit)}
          className="flex-1 flex flex-col"
        >
          <div className="p-6">
            <SubscriberFormFields />
          </div>

          <div className="mt-auto flex items-center justify-between gap-x-4 border-t p-6">
            <SubscriberFormActions
              isLoading={isLoading}
              onCancel={() => navigate(-1)}
            />
          </div>
        </form>
      </SubscriberFormProvider>
    </>
  );
}
