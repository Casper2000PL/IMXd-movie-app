import { db } from "db";
import { media } from "db/schemas/system-schema";
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
  });
