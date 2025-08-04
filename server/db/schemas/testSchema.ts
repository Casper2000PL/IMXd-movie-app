import { pgTable, text, integer } from "drizzle-orm/pg-core";
export const testSchema = pgTable("test_schema", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  value: integer("value").notNull(),
});
