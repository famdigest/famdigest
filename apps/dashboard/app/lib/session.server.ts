import { v4 as uuid } from "uuid";
import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient, type UserPreferences } from "@repo/supabase";
import { createDatabaseSessionStorage } from "./database-session.server";
import { db, eq, schema } from "@repo/database";

export const sessionStorage = createDatabaseSessionStorage({
  cookie: {
    name: "__saas",
    httpOnly: true,
    domain:
      process.env.NODE_ENV === "production" ? "appvents.com" : "localhost",
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const { destroySession, commitSession } = sessionStorage;
export { destroySession, commitSession };

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getAuthSession(request: Request) {
  const response = new Response();
  const supabase = createServerClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    session,
    user: session?.user,
    supabase,
    response,
  };
}

export async function requireAuthSession(request: Request) {
  const response = new Response();
  const supabase = createServerClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = new URL(request.url);
  const redirectTo = [`/sign-in`];
  if (pathname !== "/" && pathname !== "/sign-in") {
    redirectTo.push(`?redirectTo=${pathname}`);
  }

  if (!session) {
    throw redirect(redirectTo.join(""), {
      headers: response.headers,
    });
  }

  const [user] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.id, session.user.id));

  if (!user) {
    throw redirect(redirectTo.join(""), {
      headers: response.headers,
    });
  }

  return {
    session,
    user: {
      ...user,
      preferences: user.preferences as UserPreferences,
    },
    response,
    supabase,
  };
}

export const getVisitorId = (session: Session, userId?: string): string => {
  const existingId = session.get("visitorId") as string;
  if (existingId) {
    return existingId;
  }
  const newId = userId ?? uuid();
  session.set("visitorId", newId);
  return newId;
};

export const createUserSession = async (request: Request, userId?: string) => {
  const session = await getSession(request);
  const id = getVisitorId(session, userId);
  const cookie = await sessionStorage.commitSession(session);
  return { cookie: cookie, visitorId: id, session: session };
};
