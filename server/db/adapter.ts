import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schemas/testSchema";
import postgres from "postgres";

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set in the environment variables.");
}

const queryClient = postgres(process.env.SUPABASE_URL, { prepare: true });

export const db = drizzle(queryClient, { schema, logger: false });
