import { Hono } from "hono";
import { db } from "server/db";
import { genres } from "server/db/schemas/system-schema";

export const genresRouter = new Hono().get("/", async (c) => {
  try {
    const genresData = await db.select().from(genres);
    return c.json(genresData, 200);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return c.json(
      {
        error: "Failed to fetch genres",
        details: error,
      },
      500
    );
  }
});
