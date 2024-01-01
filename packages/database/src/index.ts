import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tables from "./schema";
import * as relations from "./relations";

// create the connection
const connection = postgres(process.env.DATABASE_URL!);

export const schema = {
  ...tables,
  ...relations,
};

export const db = drizzle(connection, { schema });

export * from "drizzle-orm";
export * from "./types";
