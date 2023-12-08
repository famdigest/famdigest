import { createBrowserClient as _createBrowserClient } from "@supabase/auth-helpers-remix";
import { Database } from "./database";

export function createBrowserClient(
  url: string,
  key: string,
  domain: string,
  secure: boolean
) {
  return _createBrowserClient<Database>(url, key, {
    cookieOptions: {
      domain,
      path: "/",
      sameSite: "lax",
      secure,
    },
  });
}
