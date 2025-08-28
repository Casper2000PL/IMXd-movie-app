import { db } from "db";
import { content, media } from "db/schemas/system-schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

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

      if (mediaData.length === 0) {
        return c.json({ error: "Media not found" }, 404);
      }

      return c.json(mediaData); // Return all media, not just first one
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
  });
