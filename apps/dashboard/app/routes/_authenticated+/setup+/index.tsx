import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireAuthSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireAuthSession(request);

  // if (user.phone) {
  //   return redirect("/setup/calendars");
  // }

  return redirect("/setup/user-info");
}
