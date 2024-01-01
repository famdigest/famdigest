import { v4 as uuid } from "uuid";
import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient, type UserPreferences } from "@repo/supabase";
import { createDatabaseSessionStorage } from "./database-session.server";
import { db, eq, schema } from "@repo/database";

export const sessionStorage = createDatabaseSessionStorage({
  cookie: {
    name: "__famdigest",
    httpOnly: true,
    domain:
      process.env.NODE_ENV === "production" ? "famdigest.com" : "localhost",
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

export async function getPossibleSession(request: Request) {
  const response = new Response();
  const supabase = createServerClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { response, supabase };

  const user = await db.query.profiles.findFirst({
    where: (table, { eq }) => eq(table.id, session.user.id),
  });
  if (!user) return { response, supabase };

  return {
    session,
    user: {
      ...user,
      ...session.user.user_metadata,
      preferences: user.preferences as UserPreferences,
    },
    response,
    supabase,
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
  if (!session) {
    const browserSession = await getSession(request);
    if (pathname !== "/" && pathname !== "/sign-in") {
      browserSession.set("redirect_uri", pathname);
      redirectTo.push(`?redirectTo=${pathname}`);
    }
    response.headers.append("set-cookie", await commitSession(browserSession));
    throw redirect(redirectTo.join(""), {
      headers: response.headers,
    });
  }

  const user = await db.query.profiles.findFirst({
    where: (table, { eq }) => eq(table.id, session.user.id),
  });

  if (!user) {
    throw redirect(redirectTo.join(""), {
      headers: response.headers,
    });
  }

  return {
    session,
    user: {
      ...user,
      ...session.user.user_metadata,
      // preferences: user.preferences as UserPreferences,
    },
    response,
    supabase,
  };
}

export const getDeviceId = (session: Session, userId?: string): string => {
  const existingId = session.get("device_id") as string;
  if (existingId) {
    return existingId;
  }
  const newId = userId ?? uuid();
  session.set("device_id", newId);
  return newId;
};

export const createUserSession = async (request: Request, userId?: string) => {
  const session = await getSession(request);
  const id = getDeviceId(session, userId);
  const cookie = await sessionStorage.commitSession(session);
  const nextSession = await sessionStorage.getSession(cookie);
  return { cookie: cookie, deviceId: id, session: nextSession };
};
