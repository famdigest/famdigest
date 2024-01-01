import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
  destroySession,
  getSession,
  requireAuthSession,
} from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, response } = await requireAuthSession(request);
  const session = await getSession(request);

  await supabase.auth.signOut();

  response.headers.append("set-cookie", await destroySession(session));

  return redirect("/sign-in", {
    headers: response.headers,
  });
}
