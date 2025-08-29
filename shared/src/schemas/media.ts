import { createInsertSchema } from "drizzle-zod";
import { media } from "../../../server/db/schemas/system-schema";

const insertMediaSchema = createInsertSchema(media);

export const createMediaSchema = insertMediaSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
