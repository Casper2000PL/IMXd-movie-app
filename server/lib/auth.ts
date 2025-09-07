import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db/index";
import * as authSchema from "../db/schemas/auth-schema";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
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
});

export type Session = typeof auth.$Infer.Session;
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthType = {
  user: User | null;
  session: Session | null;
};
