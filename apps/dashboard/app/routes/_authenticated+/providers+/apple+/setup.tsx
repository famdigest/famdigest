import { useForm, zodResolver } from "@mantine/form";
import { Link, useSearchParams, useSubmit } from "@remix-run/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormField,
  Input,
} from "@repo/ui";
import { z } from "zod";

const appleCredentialSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function Route() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const form = useForm({
    validate: zodResolver(appleCredentialSchema),
    initialValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: typeof form.values) => {
    submit(
      {
        ...values,
        redirect_uri: searchParams.get("redirect_uri"),
      },
      {
        action: "/providers/apple",
        method: "POST",
      }
    );
  };

  return (
    <form
      className="bg-muted h-[100svh] w-full flex items-center justify-center"
      onSubmit={form.onSubmit(onSubmit)}
    >
      <Card className="max-w-screen-sm">
        <CardHeader>
          <CardTitle>Connect to Apple Server</CardTitle>
          <CardDescription>
            Generate an app specific password to use with FamDigest.com at{" "}
            <a
              className="font-bold hover:underline"
              href="https://appleid.apple.com/account/manage"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://appleid.apple.com/account/manage
            </a>
            . Your credentials will be stored and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4">
            <FormField
              label="Apple ID"
              {...form.getInputProps("username")}
              render={(field) => <Input {...field} />}
            />
            <FormField
              label="Password"
              {...form.getInputProps("password")}
              type="password"
              render={(field) => <Input {...field} />}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-x-2">
          <Button type="button" variant="outline" asChild>
            <Link to={".."}>Cancel</Link>
          </Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
