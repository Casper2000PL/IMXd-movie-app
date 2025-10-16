import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@server/middleware";
import { createContentSchema } from "@server/schemas/content";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "server/db";
import { content } from "server/db/schemas/system-schema";
import { type AuthType } from "server/lib/auth";

export const contentRouter = new Hono<{ Variables: AuthType }>()
  // routes with authMiddleware has to be at the top
  .get("/", authMiddleware, async (c) => {
    try {
      const contentData = await db.select().from(content);
      return c.json(contentData);
    } catch (error) {
      console.error("Error fetching content:", error);
      return c.json({ error: "Failed to fetch content" }, 500);
    }
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
  .patch("/:id", zValidator("form", createContentSchema), async (c) => {
    try {
      const id = c.req.param("id");
      const validatedData = c.req.valid("form");

      if (!id) {
        return c.json({ error: "Content ID is required" }, 400);
      }

      // First, check if the content exists
      const existingContent = await db
        .select()
        .from(content)
        .where(eq(content.id, id));

      if (existingContent.length === 0) {
        return c.json({ error: "Content not found" }, 404);
      }

      const currentContent = existingContent[0];

      if (!currentContent) {
        return c.json({ error: "Content not found" }, 404);
      }

      // Check if title is being changed and if new title already exists
      if (validatedData.title !== currentContent.title) {
        const titleExists = await db
          .select({ id: content.id })
          .from(content)
          .where(eq(content.title, validatedData.title));

        if (titleExists.length > 0) {
          return c.json(
            {
              error: "Content with this title already exists",
              field: "title",
            },
            409
          );
        }
      }

      const updatedContent = await db
        .update(content)
        .set({
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
        .where(eq(content.id, id))
        .returning();

      if (updatedContent.length === 0) {
        return c.json({ error: "Failed to update content" }, 500);
      }

      return c.json(updatedContent[0], 200);
    } catch (error) {
      console.error("Error updating content by ID:", error);
      return c.json(
        {
          error: "Failed to update content",
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
      return c.json(contentData[0], 201);
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
