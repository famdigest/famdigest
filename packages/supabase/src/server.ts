import { createServerClient as _createServerClient } from "@supabase/auth-helpers-remix";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database";

export function createServerClient(request: Request, response: Response) {
  const { hostname } = new URL(request.url);
  const domain = hostname.split(".").slice(-2).join(".");

  return _createServerClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || "",
    {
      request,
      response,
      cookieOptions: {
        domain,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}

export function createAdminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || "",
    {
      auth: {
        persistSession: false,
      },
    }
  );
}
