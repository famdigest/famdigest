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

  const { data: workspaces } = await supabase.from("workspaces").select("*");
  if (workspaces?.length) {
    return redirect("/setup/user-info", {
      headers: response.headers,
    });
  }

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

  return redirect("/setup/user-info", {
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
  const navigate = useNavigate();
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
          <p className="text-2xl font-medium font-serif">FamDigest</p>
        </div>
      </header>
      <main id="main" className="flex-1 flex flex-col relative z-10">
        <form
          className="flex-1 flex flex-col py-20 overflow-hidden"
          onSubmit={form.onSubmit(onSubmit)}
        >
          <div className="container max-w-screen-md">
            <div className="grid grid-cols-4 gap-x-3 mb-12">
              <div className="h-3 rounded-full bg-foreground" />
              <div className="h-3 rounded-full bg-slate-300" />
              <div className="h-3 rounded-full bg-slate-300" />
              <div className="h-3 rounded-full bg-slate-300" />
            </div>

            <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-4">
              <p className="text-xl md:text-2xl">
                Let's set up your workspace.
              </p>
              <Input
                className="px-0 text-4xl h-20 mt-2 md:mt-4 mb-6 font-serif bg-transparent border-none ring-offset-transparent shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                placeholder="Valdes Family"
                {...form.getInputProps("name")}
                onChange={(e) => {
                  form.setFieldValue("name", e.target.value);
                  form.setFieldValue("slug", slugify(e.target.value));
                }}
              />
              <Button type="submit" disabled={createWorkspace.isLoading}>
                {createWorkspace.isLoading && (
                  <IconLoader className="animate-spin mr-2" />
                )}
                Next
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="main"
        className="flex flex-1 flex-col items-center justify-center bg-muted/50 relative z-10"
      >
        <div className="w-full max-w-screen-sm flex flex-col">
          <div className="flex items-center gap-x-3">
            <Logo className="h-12" />
          </div>

          <div className="my-8 space-y-1.5">
            <p className="text-4xl text-primary font-serif">
              Hi, {user.full_name ?? user.email}!
            </p>
            <p className="text-lg">Let's set up your account.</p>
          </div>
          <form
            onSubmit={form.onSubmit(onSubmit)}
            className="flex flex-col items-stretch gap-y-2"
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

            <div className="flex items-center gap-x-3 mt-2">
              <Button type="submit" disabled={createWorkspace.isLoading}>
                {createWorkspace.isLoading && (
                  <IconLoader className="animate-spin mr-2" />
                )}
                Next
              </Button>
              {/* <Button
                type="button"
                variant="link"
                onClick={() => {
                  createWorkspace.mutate(
                    {
                      name: "Personal",
                      slug: user.id,
                    },
                    {
                      onSuccess: () => {
                        navigate("/subscribe");
                      },
                    }
                  );
                }}
              >
                or continue with personal account
              </Button> */}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
