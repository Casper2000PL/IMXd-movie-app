import { db } from "db";
import { user } from "db/schemas/auth-schema";
import { Hono } from "hono";
import { authClient } from "@client/lib/auth-client";
import { eq } from "drizzle-orm";

export const userRouter = new Hono().get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const userInfo = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (userInfo.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(userInfo[0], 200);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return c.json({ error: "Failed to fetch user info" }, 500);
  }
});
