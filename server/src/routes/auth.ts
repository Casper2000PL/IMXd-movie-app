import { Hono } from "hono";
import { auth } from "../../lib/auth";
import type { AuthType } from "../../lib/auth";
import { cors } from "hono/cors";

const authRouter = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

authRouter.use(
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: "http://localhost:3000", // replace with your origin
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

authRouter.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRouter;
