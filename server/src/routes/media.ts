import { zValidator } from "@hono/zod-validator";
import { db } from "db";
import { media } from "db/schemas/system-schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createMediaSchema } from "../../../shared/src/schemas/media";

export const mediaRouter = new Hono()
  .get("/", async (c) => {
    const mediaData = await db.select().from(media);
    return c.json(mediaData);
  })
  .get("/:contentId", async (c) => {
    try {
      const contentId = c.req.param("contentId");
      const mediaData = await db
        .select()
        .from(media)
        .where(eq(media.contentId, contentId));

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
  });
