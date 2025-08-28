import { db } from "db";
import { content } from "db/schemas/system-schema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
// import { createContentSchema } from "@shared/schemas/content";
import { createContentSchema } from "../../../shared/src/schemas/content";
import { eq } from "drizzle-orm";

export const contentRouter = new Hono()
  .get("/", async (c) => {
    const contentData = await db.select().from(content);
    return c.json(contentData);
  })
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const contentData = await db
        .select()
        .from(content)
        .where(eq(content.id, id));

      if (contentData.length === 0) {
        return c.json({ error: "Content not found" }, 404);
      }

      return c.json(contentData[0]);
    } catch (error) {
      console.error("Error fetching content by ID:", error);
      return c.json(
        {
          error: "Failed to fetch content",
          details: error,
        },
        500
      );
    }
  })
  .post("/", zValidator("form", createContentSchema), async (c) => {
    try {
      const validatedData = c.req.valid("form");
      console.log("Backend - Validated data:", validatedData);

      const contentData = await db
        .insert(content)
        .values({
          title: validatedData.title,
          type: validatedData.type,
          description: validatedData.description,
          releaseDate: validatedData.releaseDate,
          runtime: validatedData.runtime,
          language: validatedData.language,
          status: validatedData.status,
          numberOfEpisodes: validatedData.numberOfEpisodes || undefined,
          numberOfSeasons: validatedData.numberOfSeasons || undefined,
        })
        .returning();

      console.log("Backend - Content created:", contentData);
      return c.json(contentData[0]);
    } catch (error) {
      console.error("Error creating content:", error);
      return c.json(
        {
          error: "Failed to create content",
          details: error,
        },
        500
      );
    }
  })
  .post("/upload-file", async (c) => {
    const contentData = "upload file endpoint";
    return c.json(contentData);
  });
