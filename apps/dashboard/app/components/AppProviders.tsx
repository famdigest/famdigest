import { useNavigate, useRevalidator } from "@remix-run/react";
import { Session, TypesafeClient, createBrowserClient } from "@repo/supabase";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupabaseProvider } from "./SupabaseProvider";
import { trpc } from "~/lib/trpc";
import SuperJSON from "superjson";
import { httpBatchLink } from "@trpc/react-query";

export function AppProviders({
  supabase,
  session,
  children,
}: {
  supabase: TypesafeClient;
  session: Session | null;
  children: React.ReactNode;
}) {
  const { revalidate } = useRevalidator();
  const navigate = useNavigate();

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }

      if (
        event === "PASSWORD_RECOVERY" &&
        window.location.pathname !== "/recovery"
      ) {
        return navigate("/recovery");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate, navigate]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: SuperJSON,
      links: [
        httpBatchLink({
          url: `/api/trpc`,
        }),
      ],
    })
  );

  return (
    <SupabaseProvider supabase={supabase}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SupabaseProvider>
  );
}
