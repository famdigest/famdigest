import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database";

export type TypesafeClient = SupabaseClient<Database>;

export type TableKey<T> = Extract<keyof Database["public"]["Tables"], T>;

export type Table<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type View<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type Keyed<T> = {
  [key: string]: T;
};
