import { db } from "db";
import { content } from "db/schemas/system-schema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createContentSchema } from "@shared/schemas/content";

export const contentRouter = new Hono()
  .get("/", async (c) => {
    const contentData = await db.select().from(content);
    return c.json(contentData);
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
          description: validatedData.description || null,
          releaseDate: validatedData.releaseDate || null,
          runtime: validatedData.runtime || null,
          language: validatedData.language || "en",
          status: validatedData.status || "released",
          numberOfEpisodes: validatedData.numberOfEpisodes || 0,
          numberOfSeasons: validatedData.numberOfSeasons || 0,
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
  });
