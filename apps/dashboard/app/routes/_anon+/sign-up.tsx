import { useForm, zodResolver } from "@mantine/form";
import { Link, useSearchParams } from "@remix-run/react";
import { IconLoader } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import GoogleIcon from "~/components/GoogleIcon";
import { Button, FormField, Input, useToast } from "@repo/ui";
import { useSupabase } from "~/components/SupabaseProvider";

const signUpFormSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email(),
});
type SignUpForm = z.infer<typeof signUpFormSchema>;

export const meta = () => {
  return [{ title: "Create Your Account | Carta Maps" }];
};

export default function AuthSignUpRoute() {
  const supabase = useSupabase();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const signInWithOtp = useMutation({
    mutationFn: async (input: SignUpForm) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          data: {
            full_name: input.full_name,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      toast({
        title: "Sorry",
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const form = useForm<SignUpForm>({
    validate: zodResolver(signUpFormSchema),
    initialValues: {
      full_name: "",
      email: "",
    },
  });

  const signInWithGoogle = async () => {
    const options: any = {
      redirectTo: `${window.location.origin}/auth/callback`,
    };
    if (searchParams.has("redirectTo")) {
      options.queryParams = {
        redirectTo: searchParams.get("redirectTo")!,
      };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options,
    });

    if (error) {
      toast({
        title: "Sorry",
        description: error.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: SignUpForm) => {
    signInWithOtp.mutate(values);
  };

  if (signInWithOtp.data) {
    return (
      <div className="w-full max-w-md flex flex-col gap-y-6 p-8 md:p-12 bg-white rounded-md shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight mb-3">
            Check your email
          </h1>
          <div className="text-sm mb-2">
            <p>We've sent a temporary login link.</p>
            <p>
              Please check your inbox at <strong>{form.values.email}</strong>
            </p>
          </div>
          <Button variant="link" onClick={() => signInWithOtp.reset()}>
            Back to sign up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md flex flex-col gap-y-6 p-8 md:p-12 bg-white rounded-md shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
        </div>

        <Button variant="outline" onClick={signInWithGoogle}>
          <GoogleIcon size={24} className="mr-3" />
          Sign in with Google
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            or continue with email
          </p>
        </div>

        <form
          onSubmit={form.onSubmit(onSubmit)}
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
            {...form.getInputProps("email")}
            render={(field) => <Input {...field} />}
          />

          <div className="mt-2">
            <Button
              className="w-full"
              type="submit"
              disabled={signInWithOtp.isLoading}
            >
              {signInWithOtp.isLoading && (
                <IconLoader className="animate-spin mr-2" />
              )}
              Send Login Link
            </Button>
            <Link
              to={{
                pathname: "/sign-in",
                search: decodeURIComponent(searchParams.toString()),
              }}
              className="text-sm mt-2 text-center block w-full"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
