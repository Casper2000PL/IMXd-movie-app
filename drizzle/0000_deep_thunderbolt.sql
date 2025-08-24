CREATE TYPE "public"."content_type" AS ENUM('movie', 'show');--> statement-breakpoint
CREATE TYPE "public"."media_category" AS ENUM('poster', 'backdrop', 'trailer', 'teaser', 'clip', 'still');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('producer', 'actor', 'director', 'writer');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('released', 'upcoming', 'in_production', 'canceled', 'ended');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cast_crew" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	"character_name" varchar(255),
	"credit_order" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_content_person_role" UNIQUE("content_id","person_id","role","character_name")
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" "content_type" NOT NULL,
	"description" text,
	"release_date" date,
	"runtime" integer,
	"rating" numeric(3, 1),
	"status" "status" DEFAULT 'released',
	"language" varchar(10) DEFAULT 'en',
	"number_of_seasons" integer,
	"number_of_episodes" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_content_genre" UNIQUE("content_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"episode_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"overview" text,
	"air_date" date,
	"runtime" integer,
	"rating" numeric(3, 1),
	"still_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_season_episode" UNIQUE("season_id","episode_number")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid,
	"file_url" varchar(500) NOT NULL,
	"type" "media_type" NOT NULL,
	"media_category" "media_category" NOT NULL,
	"title" varchar(255),
	"width" integer,
	"height" integer,
	"file_size" bigint,
	"duration" integer,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"biography" text,
	"birth_date" date,
	"profile_image_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"season_number" integer NOT NULL,
	"name" varchar(255),
	"overview" text,
	"air_date" date,
	"episode_count" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_content_season" UNIQUE("content_id","season_number")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cast_crew_content_role_idx" ON "cast_crew" USING btree ("content_id","role");--> statement-breakpoint
CREATE INDEX "cast_crew_person_role_idx" ON "cast_crew" USING btree ("person_id","role");--> statement-breakpoint
CREATE INDEX "content_type_idx" ON "content" USING btree ("type");--> statement-breakpoint
CREATE INDEX "content_title_idx" ON "content" USING btree ("title");--> statement-breakpoint
CREATE INDEX "content_release_date_idx" ON "content" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "episodes_air_date_idx" ON "episodes" USING btree ("air_date");--> statement-breakpoint
CREATE INDEX "media_content_type_idx" ON "media" USING btree ("content_id","type");--> statement-breakpoint
CREATE INDEX "media_category_idx" ON "media" USING btree ("media_category");--> statement-breakpoint
CREATE INDEX "media_primary_idx" ON "media" USING btree ("content_id","is_primary");--> statement-breakpoint
CREATE INDEX "people_name_idx" ON "people" USING btree ("name");