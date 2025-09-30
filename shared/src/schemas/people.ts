import { people } from "@server/db/schemas/system-schema";
import { createInsertSchema } from "drizzle-zod";

export const insertPeopleSchema = createInsertSchema(people);

export const createPeopleSchema = insertPeopleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
