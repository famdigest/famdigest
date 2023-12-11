import serifFontStyleSheet from "./fonts.css";
import globalStyleSheet from "@repo/ui/styles/global.css";
// @ts-ignore
import sansFontStyleSheet from "@fontsource-variable/open-sans/index.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import { json, LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import {
  TypesafeClient,
  UserPreferences,
  createBrowserClient,
  createServerClient,
} from "@repo/supabase";
import { createUserSession } from "./lib/session.server";
import { SESSION_KEYS } from "./constants";
import { useState } from "react";
import { Button, cn, Toaster } from "@repo/ui";
import { AppProviders } from "./components/AppProviders";

export const links: LinksFunction = () => [
  { rel: "preload", href: serifFontStyleSheet, as: "style" },
  { rel: "preload", href: sansFontStyleSheet, as: "style" },
  { rel: "preload", href: globalStyleSheet, as: "style" },
  ...(cssBundleHref
    ? [{ rel: "preload", href: cssBundleHref, as: "style" }]
    : []),

  //These should match the css preloads above to avoid css as render blocking resource
  { rel: "stylesheet", href: serifFontStyleSheet },
  { rel: "stylesheet", href: sansFontStyleSheet },
  { rel: "stylesheet", href: globalStyleSheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    visitorId,
    session: cookieSession,
    cookie,
  } = await createUserSession(request, user?.id);

  response.headers.append("set-cookie", cookie);

  const { hostname } = new URL(request.url);

  return json(
    {
      session,
      user,
      visitorId,
      domain: hostname.split(".").slice(-2).join("."),
      theme: cookieSession.get(SESSION_KEYS.theme) ?? "light",
      env: {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        PUBLIC_STRIPE_KEY: process.env.PUBLIC_STRIPE_KEY,
        GA_TRACKING_ID: process.env.GA_TRACKING_ID,
        GTM_TRACKING_ID: process.env.GTM_TRACKING_ID,
        FACEBOOK_PIXEL_ID: process.env.FACEBOOK_PIXEL_ID,
        ENABLE_TRACKING: process.env.ENABLE_TRACKING === "true",
      },
    },
    {
      headers: response.headers,
    }
  );
}

export default function App() {
  const { env, session, visitorId, theme, domain } =
    useLoaderData<typeof loader>();

  const [supabase] = useState<TypesafeClient>(() =>
    createBrowserClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      domain,
      env.NODE_ENV === "production"
    )
  );

  return (
    <AppProviders supabase={supabase} session={session}>
      <Document visitorId={visitorId} theme={theme}>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
      </Document>
    </AppProviders>
  );
}

function Document({
  visitorId,
  theme,
  children,
}: {
  visitorId: string;
  theme: UserPreferences["theme"];
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={cn("", theme === "dark" && "dark")}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"
        />
        <Meta />
        <Links />
      </head>
      <body className="selection:bg-pink-300/50">
        {/* <GoogleNoScript /> */}
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const renderErrorMarkup = () => {
    if (isRouteErrorResponse(error)) {
      return (
        <>
          <div className="flex items-center gap-x-2 text-sm text-primary uppercase tracking-wider font-medium mb-8 border px-2 py-1.5 rounded-md bg-background border-primary">
            <span className="h-2 w-2 rounded-full bg-primary overflow-hidden"></span>
            <p>{error.status} error</p>
          </div>
          <h1 className="text-7xl font-sans font-semibold mb-8 leading-none">
            {error.status === 404
              ? "We can't find that page"
              : "Sorry, something went wrong."}
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            {error.statusText
              ? error.statusText
              : "Sorry, the page you are looking for doesn't exist or has been moved."}
          </p>
          <Button asChild>
            <a href="/">
              <div className="h-full flex items-center justify-center font-bold">
                Back Home
              </div>
            </a>
          </Button>
        </>
      );
    }

    let errorMessage: string = "Unknown error";
    if (error instanceof Error && "message" in error) {
      errorMessage = error.message as string;
    }

    return (
      <>
        <div className="flex items-center gap-x-2 text-sm text-primary uppercase tracking-wider font-medium mb-8 border px-2 py-1.5 rounded-md bg-background border-primary">
          <span className="h-2 w-2 rounded-full bg-primary overflow-hidden"></span>
          <p>Oh No</p>
        </div>
        <h1 className="text-7xl font-sans font-semibold mb-4">
          Sorry, something went wrong.
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{errorMessage}</p>
        <Button asChild>
          <a href="/">
            <div className="h-full flex items-center justify-center font-bold">
              Back Home
            </div>
          </a>
        </Button>
      </>
    );
  };

  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body className="h-screen w-screen bg-muted flex items-center justify-start">
        <div className="container max-w-screen-md flex flex-col items-start">
          {renderErrorMarkup()}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
