import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Enums
export const contentTypeEnum = pgEnum("content_type", ["movie", "show"]);
export const roleEnum = pgEnum("role", [
  "producer",
  "actor",
  "director",
  "writer",
]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const mediaCategoryEnum = pgEnum("media_category", [
  "poster",
  "trailer",
  "clip",
]);
export const statusEnum = pgEnum("status", [
  "released",
  "upcoming",
  "in_production",
  "canceled",
  "ended",
]);

// Content table (movies and TV shows)
export const content = pgTable(
  "content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).unique().notNull(),
    type: contentTypeEnum("type").notNull(),
    description: text("description"),
    releaseDate: date("release_date"),
    runtime: integer("runtime"), // Runtime in minutes
    rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0"), // e.g., 8.5
    status: statusEnum("status").default("released"),
    language: varchar("language", { length: 10 }).default("en"),

    // TV show specific fields
    numberOfSeasons: integer("number_of_seasons").default(0),
    numberOfEpisodes: integer("number_of_episodes").default(0),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("content_type_idx").on(table.type),
    index("content_title_idx").on(table.title),
    index("content_release_date_idx").on(table.releaseDate),
  ]
);

// People table (actors, directors, writers, producers)
export const people = pgTable(
  "people",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    biography: text("biography"),
    birthDate: date("birth_date"),
    profileImageUrl: varchar("profile_image_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("people_name_idx").on(table.name)]
);

// Cast and crew roles
export const castCrew = pgTable(
  "cast_crew",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    characterName: varchar("character_name", { length: 255 }), // For actors
    creditOrder: integer("credit_order"), // Order in credits (1 = first billed)
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("cast_crew_content_role_idx").on(table.contentId, table.role),
    index("cast_crew_person_role_idx").on(table.personId, table.role),
    unique("unique_content_person_role").on(
      table.contentId,
      table.personId,
      table.role,
      table.characterName
    ),
  ]
);

// Media table (simplified)
export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id").references(() => content.id, {
      onDelete: "cascade",
    }),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    type: mediaTypeEnum("type").notNull(),
    mediaCategory: mediaCategoryEnum("media_category").notNull(),
    title: varchar("title", { length: 255 }),
    fileSize: bigint("file_size", { mode: "number" }), // File size in bytes
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("media_content_type_idx").on(table.contentId, table.type),
    index("media_category_idx").on(table.mediaCategory),
  ]
);

// Genres table
export const genres = pgTable(
  "genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique("genres_name_unique").on(table.name)]
);

// Content genres relationship (many-to-many)
export const contentGenres = pgTable(
  "content_genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique("unique_content_genre").on(table.contentId, table.genreId),
    index("content_genres_content_idx").on(table.contentId),
    index("content_genres_genre_idx").on(table.genreId),
  ]
);

// Seasons table (for TV shows)
export const seasons = pgTable(
  "seasons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    seasonNumber: integer("season_number").notNull(),
    name: varchar("name", { length: 255 }),
    overview: text("overview"),
    airDate: date("air_date"),
    episodeCount: integer("episode_count"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("unique_content_season").on(table.contentId, table.seasonNumber),
    index("seasons_content_idx").on(table.contentId),
  ]
);

// Episodes table (for TV shows)
export const episodes = pgTable(
  "episodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    episodeNumber: integer("episode_number").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    overview: text("overview"),
    airDate: date("air_date"),
    runtime: integer("runtime"), // Runtime in minutes
    rating: decimal("rating", { precision: 3, scale: 1 }),
    stillUrl: varchar("still_url", { length: 500 }), // Episode screenshot
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("unique_season_episode").on(table.seasonId, table.episodeNumber),
    index("episodes_air_date_idx").on(table.airDate),
    index("episodes_season_idx").on(table.seasonId),
  ]
);

// Relations (kept for TypeScript inference and query building)
export const contentRelations = relations(content, ({ many }) => ({
  castCrew: many(castCrew),
  media: many(media),
  contentGenres: many(contentGenres),
  seasons: many(seasons),
}));

export const peopleRelations = relations(people, ({ many }) => ({
  castCrew: many(castCrew),
}));

export const castCrewRelations = relations(castCrew, ({ one }) => ({
  content: one(content, {
    fields: [castCrew.contentId],
    references: [content.id],
  }),
  person: one(people, {
    fields: [castCrew.personId],
    references: [people.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  content: one(content, {
    fields: [media.contentId],
    references: [content.id],
  }),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  contentGenres: many(contentGenres),
}));

export const contentGenresRelations = relations(contentGenres, ({ one }) => ({
  content: one(content, {
    fields: [contentGenres.contentId],
    references: [content.id],
  }),
  genre: one(genres, {
    fields: [contentGenres.genreId],
    references: [genres.id],
  }),
}));

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  content: one(content, {
    fields: [seasons.contentId],
    references: [content.id],
  }),
  episodes: many(episodes),
}));

export const episodesRelations = relations(episodes, ({ one }) => ({
  season: one(seasons, {
    fields: [episodes.seasonId],
    references: [seasons.id],
  }),
}));

// Type exports for TypeScript
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;

export type CastCrew = typeof castCrew.$inferSelect;
export type NewCastCrew = typeof castCrew.$inferInsert;

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;

export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
