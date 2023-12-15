import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { IconEye, IconEyeOff, IconLoader } from "@tabler/icons-react";
import { z } from "zod";
import { Button, FormField, Input } from "@repo/ui";
import { useSupabase } from "~/components/SupabaseProvider";
import { createAdminClient, createServerClient } from "@repo/supabase";
import { trpc } from "~/lib/trpc";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";

export const meta = () => {
  return [{ title: "Accept Invite | Carta Maps" }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select()
    .match({ token: params.token as string })
    .single();

  if (!data || error) {
    throw new Response("", {
      status: 500,
      statusText: error.message ?? "Invitation not found",
    });
  }

  // does this email exist
  const { data: existingUser } = await admin
    .from("profiles")
    .select()
    .match({ email: data.email })
    .single();

  const response = new Response();
  const supabase = createServerClient(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && existingUser && session.user.id !== existingUser.id) {
    // the logged in user is not the same as the invite user, log them out?
    // return something like this user does not have access to this workspace
    // log out and try to accep thte invite again
  }

  if (!session) {
    let authPath = "/sign-up";
    if (existingUser) {
      authPath = "/sign-in";
    }

    const { pathname } = new URL(request.url);
    throw redirect(`${authPath}?redirectTo=${pathname}`, {
      headers: response.headers,
    });
  }

  {
    const session = await getSession(request);
    trackPageView({
      request,
      properties: {
        device_id: session.id,
        title: "auth:accept-invite",
        user_id: session.get("userId"),
      },
    });
  }

  return json(
    {
      token: params.token as string,
      invitation: data,
      existingUser,
    },
    {
      headers: response.headers,
    }
  );
}

const signUpFormSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8),
});
type SignUpForm = z.infer<typeof signUpFormSchema>;

export default function AcceptInviteRoute() {
  const { token, invitation, existingUser } = useLoaderData<typeof loader>();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [show, { toggle }] = useDisclosure(false);

  const setWorkspace = trpc.workspaces.set.useMutation({
    onSuccess() {
      navigate("/setup/user-info");
    },
  });

  const acceptInvitation = trpc.invites.accept.useMutation({
    onSuccess: (data) => {
      setWorkspace.mutate(data);
    },
  });

  const createUser = trpc.users.create.useMutation({
    async onSuccess(data) {
      await supabase.auth.setSession(data.session);
      acceptInvitation.mutate(token);
    },
  });

  const form = useForm<SignUpForm>({
    validate: zodResolver(signUpFormSchema),
    initialValues: {
      full_name: "",
      email: invitation.email,
      password: "",
    },
  });

  const createUserFormSubmit = (values: typeof form.values) => {
    createUser.mutate(values);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    acceptInvitation.mutate(token);
  };

  const isLoading =
    createUser.isLoading ||
    acceptInvitation.isLoading ||
    setWorkspace.isLoading;

  if (!existingUser) {
    return (
      <div className="w-full max-w-md flex flex-col gap-y-6 p-8 md:p-12 bg-white rounded-md shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            You've been invited!
          </h1>
          <p>
            Join the <strong>{invitation.workspace_name}</strong> workspace.
          </p>
        </div>
        <form
          onSubmit={form.onSubmit(createUserFormSubmit)}
          className="flex flex-col items-stretch gap-y-4"
        >
          <FormField
            type="text"
            label="Full Name"
            name="new-name"
            {...form.getInputProps("full_name")}
            render={(field) => <Input {...field} />}
          />

          <FormField
            type="email"
            label="Email Address"
            name="email"
            readOnly
            {...form.getInputProps("email")}
            render={(field) => <Input {...field} />}
          />

          <FormField
            type="password"
            label="Password"
            {...form.getInputProps("password")}
            render={(field) => (
              <>
                <div className="relative">
                  <Input
                    placeholder="very secure"
                    {...field}
                    type={show ? "text" : "password"}
                  />
                  <Button
                    className="absolute h-[85%] w-auto aspect-square top-1/2 right-1 transform -translate-y-1/2"
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={toggle}
                  >
                    {show ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ensure it's aleast 6 characters
                </p>
              </>
            )}
          />

          <div className="mt-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <IconLoader className="animate-spin mr-2" />}
              Sign Up
            </Button>
            <Link
              to={{
                pathname: "/sign-in",
                search: `redirectTo=/accept-invitation/${token}`,
              }}
              className="text-sm mt-2 text-center block w-full"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-y-6 p-8 md:p-12 bg-white rounded-md shadow-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          You've been invited!
        </h1>
        <p>
          Join the <strong>{invitation.workspace_name}</strong> workspace.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col items-stretch gap-y-4">
        <Button disabled={isLoading}>
          {isLoading && <IconLoader className="animate-spin mr-2" />}
          Accept
        </Button>
      </form>
    </div>
  );
}
