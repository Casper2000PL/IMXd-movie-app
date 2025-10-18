import { zValidator } from "@hono/zod-validator";
import { authAdminMiddleware } from "@server/middleware";
import { createPeopleSchema } from "@server/schemas/people";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "server/db";
import { people } from "server/db/schemas/system-schema";

export const peopleRouter = new Hono()
  .post(
    "/",
    authAdminMiddleware,
    zValidator("form", createPeopleSchema),
    async (c) => {
      try {
        const validatedData = c.req.valid("form");
        console.log("Backend - Validated data:", validatedData);

        const peopleData = await db
          .insert(people)
          .values({
            name: validatedData.name,
            biography: validatedData.biography,
            birthDate: validatedData.birthDate,
            profileImageUrl: validatedData.profileImageUrl,
          })
          .returning();

        console.log("Backend - Person created:", peopleData);
        return c.json(peopleData[0], 201);
      } catch (error) {
        console.error("Error creating person:", error);
        return c.json(
          {
            error: "Failed to create person",
            details: error,
          },
          500
        );
      }
    }
  )
  .get("/", async (c) => {
    try {
      const allPeople = await db
        .select()
        .from(people)
        .orderBy(people.createdAt);

      return c.json(allPeople, 200);
    } catch (error) {
      console.error("Error fetching people:", error);
      return c.json(
        {
          error: "Failed to fetch people",
          details: error,
        },
        500
      );
    }
  })
  .get("/:id", async (c) => {
    try {
      const personId = c.req.param("id");

      const person = await db
        .select()
        .from(people)
        .where(eq(people.id, personId))
        .limit(1)
        .then((res) => res[0]);

      if (!person) {
        return c.json({ error: "Person not found" }, 404);
      }

      return c.json(person, 200);
    } catch (error) {
      console.error("Error fetching person:", error);
      return c.json(
        {
          error: "Failed to fetch person",
          details: error,
        },
        500
      );
    }
  });
