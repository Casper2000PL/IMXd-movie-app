import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth, type AuthType } from "server/lib/auth";
import type { User } from "shared/dist/shared/src/types/index";
import { authMiddleware } from "server/src/middleware";
import { content } from "server/db/schemas/system-schema";
import { contentRouter } from "server/src/routes/content";
import { mediaRouter } from "server/src/routes/media";
import { fileRouter } from "server/src/routes/file";
import { userRouter } from "server/src/routes/user";
import { db } from "server/db";
import { peopleRouter } from "./routes/people";
import { castCrewRouter } from "./routes/cast-crew";

export const app = new Hono<{ Variables: AuthType }>();

// Add CORS middleware FIRST - before other middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow both dev server and API server
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // Important for cookies/sessions
  })
);

// Your existing middleware (should come after CORS)
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user as User);
  c.set("session", session);
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
  .route("/file", fileRouter)
  .route("/user", userRouter)
  .route("/people", peopleRouter)
  .route("/castCrew", castCrewRouter)
  .get("/user-info", authMiddleware, (c) => {
    return c.json({ message: "User info!" });
  })
  .get("/content", async (c) => {
    const contentData = await db.select().from(content);
    return c.json(contentData);
  });

// Export the type after all routes are defined
export type AppType = typeof routes;

serve(routes);
