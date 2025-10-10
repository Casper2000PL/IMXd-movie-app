import { createInsertSchema } from "drizzle-zod";
import { people } from "server/db/schemas/system-schema";

export const insertPeopleSchema = createInsertSchema(people);

export const createPeopleSchema = insertPeopleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
