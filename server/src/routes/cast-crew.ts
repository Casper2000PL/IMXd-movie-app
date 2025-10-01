import { Hono } from "hono";
import { db } from "server/db";
import { castCrew } from "server/db/schemas/system-schema";

export const castCrewRouter = new Hono().get("/", async (c) => {
  try {
    const crewData = await db.select().from(castCrew);
    return c.json(crewData);
  } catch (error) {
    console.error("Error fetching crew data:", error);
    return c.json(
      {
        error: "Failed to fetch crew data",
        details: error,
      },
      500
    );
  }
});
