import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { zValidator } from "@hono/zod-validator";
import { db } from "server/db";
import { user } from "server/db/schemas/auth-schema";
import { media } from "server/db/schemas/system-schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { S3 } from "server/lib/s3client";
import z from "zod";
import { authMiddleware } from "@server/middleware";

const updateUserSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  email: z.email().optional(),
  image: z.string().optional(),
});

export const userRouter = new Hono()
  .put(
    "/:id",
    authMiddleware,
    zValidator("form", updateUserSchema),
    async (c) => {
      const id = c.req.param("id");
      const validatedData = c.req.valid("form");

      console.log("Validated data: ", validatedData.name);

      try {
        const updatedUser = await db
          .update(user)
          .set({
            name: validatedData.name,
            email: validatedData.email,
            image: validatedData.image,
            updatedAt: new Date(),
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
    }
  )
  .delete("/profile-image/:userId", authMiddleware, async (c) => {
    const userId = c.req.param("userId");

    try {
      const userInfo = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (userInfo.length === 0) {
        return c.json({ error: "User not found" }, 404);
      }

      const imageUrl = userInfo[0]?.image;

      if (imageUrl) {
        const imageMedia = await db
          .select()
          .from(media)
          .where(eq(media.fileUrl, imageUrl))
          .limit(1);

        const key = imageMedia[0]?.key;

        try {
          if (!key) {
            return c.json({ error: "File key is required" }, { status: 400 });
          }

          const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          });

          await S3.send(command);

          await db.delete(media).where(eq(media.key, key));

          return c.json(
            { message: "File deleted successfully" },
            { status: 200 }
          );
        } catch (error) {
          console.error("Error deleting file:", error);
          return c.json({ error: "Failed to delete file" }, { status: 500 });
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      return c.json({ error: "Failed to fetch user info" }, 500);
    }
  })
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
  });
