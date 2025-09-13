import { createMiddleware } from "hono/factory";
import { auth } from "lib/auth";
import type { User } from "shared/src/types/index";

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
  return next();
});
