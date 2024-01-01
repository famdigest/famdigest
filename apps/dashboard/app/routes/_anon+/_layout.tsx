import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Logo } from "~/components/Logo";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { cn } from "@repo/ui";
import noise from "~/assets/noise.svg";
import { getSession } from "~/lib/session.server";
import { SESSION_KEYS } from "~/constants";
import { db } from "@repo/database";
import { IconMailCheck } from "@tabler/icons-react";

export const meta: MetaFunction = () => {
  return [];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  let joinData: { token: string; invited_by: string } | undefined;
  if (session.has(SESSION_KEYS.join)) {
    joinData = JSON.parse(session.get(SESSION_KEYS.join));
    const invited_by = await db.query.profiles.findFirst({
      where: (table, { eq }) => eq(table.id, joinData?.invited_by as string),
    });
    return json({
      join: true,
      invited_by,
    });
  }

  return json({
    join: false,
    invited_by: undefined,
  });
}

export default function AuthLayout() {
  const { join, invited_by } = useLoaderData<typeof loader>();

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
      <main
        id="main"
        className="grid grid-cols-1 lg:grid-cols-2 flex-1 relative z-10"
      >
        {join && invited_by && (
          <div className="absolute top-6 inset-x-0 flex justify-center">
            <div className="bg-foreground text-white rounded-lg p-4 w-full max-w-sm flex items-center justify-center gap-x-2 text-sm">
              <IconMailCheck size={20} />
              <p>You are joining {invited_by.full_name}'s workspace.</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center overflow-hidden relative z-10 px-8">
          <div className="flex flex-col items-center lg:items-start gap-y-2 w-full max-w-lg">
            <p className="text-2xl font-medium font-serif mb-8">FamDigest</p>

            <h1 className="text-5xl md:text-6xl font-medium font-serif">
              Never use a shared calendar again.
            </h1>
            <h2 className="text-2xl mt-4">
              Send a short daily digest of your day to{" "}
              <span className="underline italic">anyone</span> via text message.
            </h2>
            <p className="text-xs mt-3">
              By creating an account, you agree to our{" "}
              <Link to="https://www.famdigest.com/terms" className="underline">
                terms of use
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center lg:justify-center p-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
