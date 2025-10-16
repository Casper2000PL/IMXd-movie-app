import { createMiddleware } from "hono/factory";
import { auth } from "server/lib/auth";
import type { User } from "shared/dist/shared/src/types/index";

export type HonoEnv = {
  Variables: {
    user: User;
    session: typeof auth.$Infer.Session.session;
  };
};

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user as User);
  c.set("session", session.session);
  return await next();
});

export const authAdminMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = session.user as User;

    if (user.role !== "ADMIN") {
      return c.json({ error: "Forbidden" }, 403);
    }

    c.set("user", session.user as User);
    c.set("session", session.session);
    return await next();
  }
);
