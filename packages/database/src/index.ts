import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// create the connection
const connection = postgres(process.env.DATABASE_URL!);

export const db = drizzle(connection, { schema });

export { schema };
export * from "drizzle-orm";
