import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button } from "@repo/ui";
import { requireAuthSession } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, response } = await requireAuthSession(request);

  return json(
    {
      user,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="p-16">
      <h1 className="text-8xl font-bold tracking-tighter leading-none mb-8">
        Welcome to Better Software
      </h1>
      <Button>Get Started</Button>
      <pre className="border rounded-md p-4 mt-6 bg-muted">
        <p>🎉 You are logged in!</p>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
