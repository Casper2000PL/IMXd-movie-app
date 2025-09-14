import { createInsertSchema } from "drizzle-zod";
import { media } from "@server/db/schemas/system-schema";
import z from "zod";

const insertMediaSchema = createInsertSchema(media);

export const createMediaSchema = insertMediaSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    fileSize: z.string().transform((val) => Number(val)),
  });
