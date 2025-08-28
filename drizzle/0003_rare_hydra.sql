ALTER TABLE "media" ALTER COLUMN "media_category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."media_category";--> statement-breakpoint
CREATE TYPE "public"."media_category" AS ENUM('poster', 'trailer', 'clip');--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "media_category" SET DATA TYPE "public"."media_category" USING "media_category"::"public"."media_category";--> statement-breakpoint
DROP INDEX "media_primary_idx";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "height";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "is_primary";--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_title_unique" UNIQUE("title");