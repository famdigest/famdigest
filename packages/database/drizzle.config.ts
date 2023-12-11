import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./src/new",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  introspect: {
    casing: "preserve",
  },
  schemaFilter: ["auth", "public"],
} satisfies Config;
