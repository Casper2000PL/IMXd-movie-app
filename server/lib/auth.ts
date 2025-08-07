import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db/index";
import * as authSchema from "../db/schemas/auth-schema";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  secret: process.env.BETTER_AUTH_SECRET || undefined,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [openAPI()],
  trustedOrigins: [
    "http://localhost:3000", // Your frontend URL
    "http://localhost:5173", // Vite default port
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
