import { zValidator } from "@hono/zod-validator";
import { db } from "db";
import { user } from "db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).max(20),
});

export const userRouter = new Hono()
  .get("/:id", async (c) => {
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
  })
  // In your backend route (userRouter)
  .put("/:id", zValidator("form", updateUserSchema), async (c) => {
    const id = c.req.param("id");
    const validatedData = c.req.valid("form");

    console.log("Validated data: ", validatedData.name);

    try {
      const updatedUser = await db
        .update(user)
        .set({
          name: validatedData.name,
        })
        .where(eq(user.id, id))
        .returning();

      if (updatedUser.length === 0) {
        return c.json({ error: "User not found or no changes made" }, 404);
      }

      // Return the updated user data
      return c.json(updatedUser[0], 200);
    } catch (error) {
      console.error("Error updating user info:", error);
      return c.json({ error: "Failed to update user info" }, 500);
    }
  });
