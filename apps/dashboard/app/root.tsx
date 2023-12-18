import serifFontStyleSheet from "./fonts.css";
import globalStyleSheet from "@repo/ui/styles/global.css";
import sansFontStyleSheet from "@fontsource-variable/open-sans/index.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import {
  json,
  LinksFunction,
  MetaFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import {
  Session,
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
import { trackPageView } from "@repo/tracking";

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

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  return [
    {
      name: "description",
      content:
        "Send a short daily digest of your day to anyone via text message.",
    },
    {
      property: "og:description",
      content:
        "Send a short daily digest of your day to anyone via text message.",
    },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:site", content: "@famdigest" },
    { property: "twitter:creator", content: "@francoxavier33" },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: `${data?.url}${location.pathname}`,
    },
    {
      property: "og:image",
      content: `${data?.url}/assets/images/open-graph.jpg`,
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { session: cookieSession, cookie } = await createUserSession(
    request,
    user?.id
  );

  response.headers.append("set-cookie", cookie);

  const { hostname, origin, pathname } = new URL(request.url);
  trackPageView({
    request,
    properties: {
      device_id: cookieSession.id,
      title: pathname === "/" ? "home" : pathname.substring(1),
      user_id: user?.id,
    },
  });

  return json(
    {
      session,
      user,
      domain: hostname.split(".").slice(-2).join("."),
      theme: cookieSession.get(SESSION_KEYS.theme) ?? "light",
      url: origin,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        PUBLIC_STRIPE_KEY: process.env.PUBLIC_STRIPE_KEY,
        GA_TRACKING_ID: process.env.GA_TRACKING_ID,
        GTM_TRACKING_ID: process.env.GTM_TRACKING_ID,
        FACEBOOK_PIXEL_ID: process.env.FACEBOOK_PIXEL_ID,
        MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
        ENABLE_TRACKING: process.env.ENABLE_TRACKING === "true",
      },
    },
    {
      headers: response.headers,
    }
  );
}

export default function App() {
  const { env, session, theme, domain } = useLoaderData<typeof loader>();

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
      <Document theme={theme}>
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
  theme,
  children,
}: {
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
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body className="">
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
