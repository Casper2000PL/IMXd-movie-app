import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "server/db";
import { castCrew, content, people } from "server/db/schemas/system-schema";
import { z } from "zod";

const createCastCrewSchema = z.object({
  contentId: z.string(),
  personId: z.string(),
  role: z.enum(["producer", "actor", "director", "writer"]),
  characterName: z.string().optional(),
  creditOrder: z.number().int().positive().optional(),
});

export const castCrewRouter = new Hono()
  .get("/", async (c) => {
    try {
      const crewData = await db
        .select({
          id: castCrew.id,
          contentId: castCrew.contentId,
          personId: castCrew.personId,
          role: castCrew.role,
          characterName: castCrew.characterName,
          creditOrder: castCrew.creditOrder,
          personName: people.name,
          contentTitle: content.title,
          createdAt: castCrew.createdAt,
        })
        .from(castCrew)
        .leftJoin(people, eq(castCrew.personId, people.id))
        .leftJoin(content, eq(castCrew.contentId, content.id))
        .orderBy(castCrew.creditOrder);

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
  })
  .get("/:contentId", async (c) => {
    try {
      const contentId = c.req.param("contentId");

      const crewData = await db
        .select({
          id: castCrew.id,
          contentId: castCrew.contentId,
          personId: castCrew.personId,
          role: castCrew.role,
          characterName: castCrew.characterName,
          creditOrder: castCrew.creditOrder,
          personName: people.name,
          personProfileImageUrl: people.profileImageUrl,
          createdAt: castCrew.createdAt,
        })
        .from(castCrew)
        .leftJoin(people, eq(castCrew.personId, people.id))
        .where(eq(castCrew.contentId, contentId))
        .orderBy(castCrew.creditOrder);

      return c.json(crewData, 200);
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
  })
  .post("/", zValidator("json", createCastCrewSchema), async (c) => {
    try {
      const validatedData = c.req.valid("json");
      console.log("Backend - Creating cast/crew:", validatedData);

      const newCastCrew = await db
        .insert(castCrew)
        .values({
          contentId: validatedData.contentId,
          personId: validatedData.personId,
          role: validatedData.role,
          characterName: validatedData.characterName,
          creditOrder: validatedData.creditOrder,
        })
        .returning();

      console.log("Backend - Cast/crew created:", newCastCrew);
      return c.json(newCastCrew[0], 201);
    } catch (error) {
      console.error("Error creating cast/crew:", error);
      return c.json(
        {
          error: "Failed to create cast/crew",
          details: error,
        },
        500
      );
    }
  })
  .delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");

      const deleted = await db
        .delete(castCrew)
        .where(eq(castCrew.id, id))
        .returning();

      if (deleted.length === 0) {
        return c.json({ error: "Cast/crew not found" }, 404);
      }

      return c.json({ message: "Cast/crew deleted successfully" }, 200);
    } catch (error) {
      console.error("Error deleting cast/crew:", error);
      return c.json(
        {
          error: "Failed to delete cast/crew",
          details: error,
        },
        500
      );
    }
  });
