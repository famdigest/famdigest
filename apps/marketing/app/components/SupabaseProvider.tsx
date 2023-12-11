import { useMatches } from "@remix-run/react";
import { createContext, useContext } from "react";
import type { TypesafeClient } from "@repo/supabase";

interface SupabaseContextProps {
  supabase: TypesafeClient;
}

const SupabaseContext = createContext<SupabaseContextProps>(
  null as unknown as SupabaseContextProps
);

export function SupabaseProvider({
  supabase,
  children,
}: {
  supabase: TypesafeClient;
  children: React.ReactNode;
}) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const { supabase } = useContext(SupabaseContext);
  return supabase;
}
