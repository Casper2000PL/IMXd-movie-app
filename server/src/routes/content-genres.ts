import { zValidator } from "@hono/zod-validator";
import { authAdminMiddleware } from "@server/middleware";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "server/db";
import { contentGenres, genres } from "server/db/schemas/system-schema";
import z from "zod";

const contentGenresSchema = z.object({
  contentId: z.string().min(1, { message: "contentId is required" }),
  genreId: z.string().min(1, { message: "genre is required" }),
});

const updateContentGenresSchema = z.object({
  genreIds: z.array(z.string()).min(0),
});

export const contentGenresRouter = new Hono()
  .post(
    "/",
    authAdminMiddleware,
    zValidator("json", contentGenresSchema),
    async (c) => {
      try {
        const { contentId, genreId } = await c.req.json();

        if (!contentId || !genreId) {
          return c.json({ error: "contentId and genre are required" }, 400);
        }

        const newGenre = await db
          .insert(contentGenres)
          .values({ contentId, genreId })
          .returning();

        return c.json(newGenre[0], 201);
      } catch (error) {
        console.error("Error creating genre:", error);
        return c.json(
          {
            error: "Failed to create genre",
            details: error,
          },
          500
        );
      }
    }
  )
  .post("/bulk", authAdminMiddleware, async (c) => {
    const { contentId, genreIds } = await c.req.json();

    // Validate input
    if (!contentId || !Array.isArray(genreIds) || genreIds.length === 0) {
      return c.json({ error: "Invalid input" }, 400);
    }

    try {
      // Prepare bulk insert data
      const contentGenresData = genreIds.map((genreId) => ({
        contentId,
        genreId,
      }));

      // Insert multiple records at once
      const result = await db
        .insert(contentGenres)
        .values(contentGenresData)
        .onConflictDoNothing() // Prevents duplicates if constraint exists
        .returning();

      return c.json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (error) {
      console.error("Bulk insert error:", error);
      return c.json({ error: "Failed to add genres" }, 500);
    }
  })
  .put(
    "/:id",
    authAdminMiddleware,
    zValidator("json", updateContentGenresSchema),
    async (c) => {
      const contentId = c.req.param("id");
      const { genreIds } = await c.req.json();

      if (!contentId) {
        return c.json({ error: "contentId is required" }, 400);
      }

      try {
        // Use a transaction to ensure atomicity
        await db.transaction(async (tx) => {
          // Delete all existing genres for this content
          await tx
            .delete(contentGenres)
            .where(eq(contentGenres.contentId, contentId));

          // Insert new genres if any
          if (genreIds.length > 0) {
            const contentGenresData = genreIds.map((genreId: string) => ({
              contentId,
              genreId,
            }));

            await tx
              .insert(contentGenres)
              .values(contentGenresData)
              .onConflictDoNothing();
          }
        });

        // Fetch and return updated genres
        const contentGenresData = await db
          .select()
          .from(contentGenres)
          .where(eq(contentGenres.contentId, contentId));

        const genresData = await db.select().from(genres);
        const updatedGenreIds = contentGenresData.map((cg) => cg.genreId);

        const contentGenresList = genresData
          .filter((genre) => updatedGenreIds.includes(genre.id))
          .map((genre) => ({
            id: genre.id,
            name: genre.name,
            contentId: contentId,
          }));

        return c.json({
          success: true,
          count: contentGenresList.length,
          data: contentGenresList,
        });
      } catch (error) {
        console.error("Update genres error:", error);
        return c.json({ error: "Failed to update genres" }, 500);
      }
    }
  )
  .get("/:id", async (c) => {
    try {
      const contentId = c.req.param("id");

      const contentGenresData = await db
        .select()
        .from(contentGenres)
        .where(eq(contentGenres.contentId, contentId));

      const genresData = await db.select().from(genres);

      const genreIds = contentGenresData.map((cg) => cg.genreId);

      const contentGenresList = genresData
        .filter((genre) => genreIds.includes(genre.id))
        .map((genre) => ({
          id: genre.id,
          name: genre.name,
          contentId: contentId,
        }));

      return c.json(contentGenresList, 200);
    } catch (error) {
      console.error("Error fetching genres by ID:", error);
      return c.json(
        {
          error: "Failed to fetch genres",
          details: error,
        },
        500
      );
    }
  });
