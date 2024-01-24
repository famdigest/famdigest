import { useForm, zodResolver } from "@mantine/form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { IconLoader } from "@tabler/icons-react";
import { z } from "zod";
import { Logo } from "~/components/Logo";
import { Button, FormField, Input, cn, slugify } from "@repo/ui";
import {
  commitSession,
  getSession,
  requireAuthSession,
} from "~/lib/session.server";
import { useMutation } from "@tanstack/react-query";
import { useSupabase } from "~/components/SupabaseProvider";
import { SESSION_KEYS } from "~/constants";
import noise from "~/assets/noise.svg";
import { trackPageView } from "@repo/tracking";
import { db, schema } from "@repo/database";

export const meta = () => {
  return [
    { title: "Account Setup | FamDigest" },
    {
      property: "og:title",
      content: "Account Setup | FamDigest",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response, supabase } = await requireAuthSession(request);
  const session = await getSession(request);

  const { data: workspaces } = await supabase.from("workspaces").select("*");
  if (workspaces?.length) {
    session.set(SESSION_KEYS.workspace, workspaces[0].id);
    response.headers.append("Set-cookie", await commitSession(session));
    return redirect("/", {
      headers: response.headers,
    });
  }

  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "onboarding",
      user_id: session.get("userId"),
    },
  });

  return json(
    {
      user,
    },
    {
      headers: response.headers,
    }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { response } = await requireAuthSession(request);
  const formData = Object.fromEntries(await request.formData());
  const session = await getSession(request);

  session.set(SESSION_KEYS.workspace, formData.workspace);
  response.headers.append("set-cookie", await commitSession(session));

  return redirect("/setup", {
    headers: response.headers,
  });
}

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Handle is required"),
  settings: z.record(z.string()).optional(),
});
type WorkspaceForm = z.infer<typeof workspaceSchema>;

export default function OnboardingRoute() {
  const supabase = useSupabase();
  const { user } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const form = useForm<WorkspaceForm>({
    validate: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
      })
    ),
    initialValues: {
      name: "",
      slug: "",
    },
  });

  const createWorkspace = useMutation({
    mutationFn: async (input: WorkspaceForm) => {
      const { data: workspace, error } = await supabase
        .from("workspaces")
        .insert({
          ...input,
          owner_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return workspace;
    },
    onSuccess(data, variables, context) {
      submit(
        {
          workspace: data.id,
        },
        {
          method: "POST",
          action: "/onboarding",
        }
      );
    },
  });

  const onSubmit = (values: WorkspaceForm) => {
    createWorkspace.mutate({
      ...values,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-rose-100 to-teal-100">
      <div
        className={cn(
          "absolute inset-0 brightness-100 opacity-50 contrast-150 z-0 pointer-events-none"
        )}
        style={{
          backgroundImage: `url(${noise})`,
        }}
      />
      <header>
        <div className="container flex items-center justify-between py-4">
          <p className="text-2xl font-medium font-serif">
            FamDigest{" "}
            <span className="font-sans text-base font-normal">/ Welcome</span>
          </p>
        </div>
      </header>
      <main id="main" className="flex-1 flex flex-col relative z-10">
        <div className="container sm:max-w-sm flex flex-col gap-y-10 py-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
              Welcome to FamDigest
            </h1>
            <p>Let's set up your workspace.</p>
          </div>
          <form
            className="flex-1 flex flex-col space-y-6"
            onSubmit={form.onSubmit(onSubmit)}
          >
            <FormField
              type="text"
              label="Workspace Name"
              placeholder="Valdes Family"
              {...form.getInputProps("name")}
              render={(field) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange?.(e);
                    form.setFieldValue("slug", slugify(e.target.value));
                  }}
                />
              )}
            />
            <Button type="submit" disabled={createWorkspace.isLoading}>
              {createWorkspace.isLoading && (
                <IconLoader className="animate-spin mr-2" />
              )}
              Next
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
