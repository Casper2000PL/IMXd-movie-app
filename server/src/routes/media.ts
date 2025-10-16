import { zValidator } from "@hono/zod-validator";
import { db } from "server/db";
import { media } from "server/db/schemas/system-schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { S3 } from "server/lib/s3client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createMediaSchema } from "@server/schemas/media";
import { authMiddleware } from "@server/middleware";

export const mediaRouter = new Hono()
  .get("/", async (c) => {
    try {
      const mediaData = await db.select().from(media);
      return c.json(mediaData);
    } catch (error) {
      console.error("Error fetching media:", error);
      return c.json({ error: "Failed to fetch media" }, 500);
    }
  })
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const mediaData = await db.select().from(media).where(eq(media.id, id));

      if (mediaData.length === 0) {
        return c.json({ error: "Media not found" }, 404);
      }

      return c.json(mediaData[0], 200);
    } catch (error) {
      console.error("Error fetching media by ID:", error);
      return c.json(
        {
          error: "Failed to fetch media",
          details: error,
        },
        500
      );
    }
  })
  .get("/content/:contentId", async (c) => {
    try {
      const contentId = c.req.param("contentId");
      const mediaData = await db
        .select()
        .from(media)
        .where(eq(media.contentId, contentId));

      console.log("Fetched media data backend:", mediaData);

      // Return empty array if no results found
      return c.json(mediaData);
    } catch (error) {
      console.error("Error fetching media by ID:", error);
      return c.json(
        {
          error: "Failed to fetch media",
          details: error,
        },
        500
      );
    }
  })
  .post("/", zValidator("form", createMediaSchema), async (c) => {
    try {
      const validatedData = c.req.valid("form");
      console.log("Backend - Validated data:", validatedData);

      const createdMedia = await db
        .insert(media)
        .values(validatedData)
        .returning();

      return c.json(createdMedia, 201);
    } catch (error) {
      console.error("Error creating media:", error);
      return c.json(
        {
          error: "Failed to create media",
          details: error,
        },
        500
      );
    }
  })
  .put("/:id", zValidator("form", createMediaSchema), async (c) => {
    try {
      const id = c.req.param("id");

      const validatedData = c.req.valid("form");

      const updatedMedia = await db
        .update(media)
        .set(validatedData)
        .where(eq(media.id, id))
        .returning();

      return c.json(updatedMedia, 200);
    } catch (error) {
      console.error("Error updating media:", error);
      return c.json(
        {
          error: "Failed to update media",
          details: error,
        },
        500
      );
    }
  })
  .delete("/image/:key", async (c) => {
    try {
      const key = c.req.param("key");

      if (!key) {
        return c.json({ error: "File key is required" }, { status: 400 });
      }

      const mediaToDelete = await db
        .select()
        .from(media)
        .where(eq(media.key, key));

      if (mediaToDelete.length === 0) {
        return c.json({ error: "Media not found" }, 404);
      }

      try {
        const command = new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        });

        await S3.send(command);

        await db.delete(media).where(eq(media.key, key));

        return c.json(
          { message: "Image deleted successfully" },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error deleting image:", error);
        return c.json({ error: "Failed to delete image" }, { status: 500 });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      return c.json(
        {
          error: "Failed to delete image",
          details: error,
        },
        500
      );
    }
  });
