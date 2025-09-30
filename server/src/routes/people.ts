import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "server/db";
import { people } from "server/db/schemas/system-schema";
import { createPeopleSchema } from "shared/dist/shared/src/schemas/people";

export const peopleRouter = new Hono()
  .post("/", zValidator("form", createPeopleSchema), async (c) => {
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
  })
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
  });
