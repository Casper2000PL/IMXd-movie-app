import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth, type AuthType } from "../lib/auth";
import { authMiddleware } from "./middleware";
import { db } from "db";
import { content } from "../db/schemas/system-schema";
import { contentRouter } from "./routes/content";
import { mediaRouter } from "./routes/media";
import { fileRouter } from "./routes/file";

export const app = new Hono<{ Variables: AuthType }>()
  .get("/user-info", authMiddleware, (c) => {
    return c.json({ message: "User info!" });
  })
  .get("/content", async (c) => {
    const contentData = await db.select().from(content);
    return c.json(contentData);
  });

// Middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  return c.json({
    session,
    user,
  });
});

// Apply basePath and routes
const routes = app
  .basePath("/api")
  .route("/content", contentRouter)
  .route("/media", mediaRouter)
  .route("/file", fileRouter);

// Export the type after all routes are defined
export type AppType = typeof routes;

serve(routes);
