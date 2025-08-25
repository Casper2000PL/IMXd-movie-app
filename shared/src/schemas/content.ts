import { createInsertSchema } from "drizzle-zod";
import { content } from "../../../server/db/schemas/system-schema";
import * as z from "zod";

const insertContentSchema = createInsertSchema(content);

export const createContentSchema = insertContentSchema
  .omit({
    id: true,
    rating: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Ensure string to number conversion for form data
    runtime: z
      .string()
      .optional()
      .transform((val) => (val && val !== "" ? parseInt(val, 10) : undefined)),
    numberOfSeasons: z
      .string()
      .optional()
      .transform((val) => (val && val !== "" ? parseInt(val, 10) : undefined)),
    numberOfEpisodes: z
      .string()
      .optional()
      .transform((val) => (val && val !== "" ? parseInt(val, 10) : undefined)),
  });
