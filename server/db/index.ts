import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  account,
  session,
  user,
  verification,
} from "../db/schemas/auth-schema";

//console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set in the environment variables.");
}

const queryClient = postgres(process.env.SUPABASE_URL, { prepare: true });

export const db = drizzle(queryClient, {
  schema: {
    user,
    account,
    session,
    verification,
  },
  logger: false,
});
