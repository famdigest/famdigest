import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import {
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconLoader,
  IconLoader2,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import GoogleIcon from "~/components/GoogleIcon";
import { Button, FormField, Input, useToast } from "@repo/ui";
import { useSupabase } from "~/components/SupabaseProvider";

const signInFormSchema = z.object({
  email: z.string().email(),
});
const signInWithPasswordSchema = signInFormSchema.extend({
  password: z.string().min(6),
});
type SignInForm = z.infer<typeof signInFormSchema>;
type SignInWithPassword = z.infer<typeof signInWithPasswordSchema>;

export const meta = () => {
  return [{ title: "Sign In | Carta Maps" }];
};

export default function AuthSignInRoute() {
  const supabase = useSupabase();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [show, { toggle: pwToggle }] = useDisclosure(false);
  const [usePassword, { toggle }] = useDisclosure(false);

  const signInWithOtp = useMutation({
    mutationFn: async (input: SignInForm) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: input.email,
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

  const signInWithPassword = useMutation({
    mutationFn: async (input: SignInWithPassword) => {
      const { data, error } = await supabase.auth.signInWithPassword(input);
      if (error) throw error;
      return data;
    },
    onSuccess(data) {
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Sorry",
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const form = useForm<SignInForm>({
    validate: zodResolver(signInFormSchema),
    initialValues: {
      email: "",
    },
  });

  const passwordForm = useForm<SignInWithPassword>({
    validate: zodResolver(signInWithPasswordSchema),
    initialValues: {
      email: "",
      password: "",
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

  const onSubmit = async (values: SignInForm) => {
    signInWithOtp.mutate(values);
  };

  const onSubmitWithPassword = async (values: SignInWithPassword) => {
    signInWithPassword.mutate({
      ...values,
    });
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
            Back to login
          </Button>
          {!usePassword ? (
            <div className="text-center flex items-center justify-center gap-x-2">
              <p className="text-sm text-muted-foreground">or</p>
              <Button
                variant="link"
                className="px-0"
                onClick={() => {
                  passwordForm.setFieldValue("email", form.values.email);
                  toggle();
                }}
              >
                use password
              </Button>
            </div>
          ) : (
            <form
              onSubmit={passwordForm.onSubmit(onSubmitWithPassword)}
              className="flex items-start gap-x-3"
            >
              <FormField
                type={show ? "text" : "password"}
                aria-label="Password"
                {...passwordForm.getInputProps("password")}
                className="flex-1"
                render={(field) => (
                  <>
                    <div className="relative">
                      <Input placeholder="Enter your password" {...field} />
                      <Button
                        className="absolute h-[85%] w-auto aspect-square top-1/2 right-1 transform -translate-y-1/2"
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={pwToggle}
                      >
                        {show ? (
                          <IconEye size={16} />
                        ) : (
                          <IconEyeOff size={16} />
                        )}
                      </Button>
                    </div>
                    <Link
                      to="/forgot"
                      className="mt-1 text-xs text-muted-foreground"
                    >
                      Forgot your password?
                    </Link>
                  </>
                )}
              />
              <Button type="submit" size="icon" className="">
                {signInWithPassword.isLoading ? (
                  <IconLoader2 size={20} className="animate-spin" />
                ) : (
                  <IconChevronRight size={20} />
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-y-6 p-8 md:p-12 bg-white rounded-md shadow-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
      </div>

      <Button variant="outline" onClick={signInWithGoogle}>
        <GoogleIcon size={24} className="mr-3" />
        Sign in with Google
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">or continue with email</p>
      </div>

      <form
        onSubmit={form.onSubmit(onSubmit)}
        className="flex flex-col items-stretch gap-y-4"
      >
        <FormField
          type="email"
          label="Email Address"
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
              pathname: "/sign-up",
              search: decodeURIComponent(searchParams.toString()),
            }}
            className="text-sm mt-2 text-center block w-full"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
