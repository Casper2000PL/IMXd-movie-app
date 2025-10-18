import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { S3 } from "server/lib/s3client";
import { db } from "server/db";
import { media } from "server/db/schemas/system-schema";
import { user } from "server/db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { authAdminMiddleware, authMiddleware } from "@server/middleware";

const uploadRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
  mediaCategory: z.enum(["poster", "gallery_image", "trailer", "clip"]),
  contentTitle: z.string(), // title of the movie or show NOT THE FILENAME
  contentId: z.string(), // contentId from content table NOT FROM S3 bucket
  type: z.enum(["video", "image"]),
});

const uploadProfileImageSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
  userId: z.string(),
});

const uploadPersonImageSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
});

export const fileRouter = new Hono()
  .post(
    "/upload-profile-image",
    authMiddleware,
    zValidator("json", uploadProfileImageSchema),
    async (c) => {
      try {
        const validation = c.req.valid("json");
        const { fileName, contentType, size, userId } = validation;

        const uniqueKey = `profile_image-${fileName}`;

        // Check if file already exists in S3
        try {
          const checkCommand = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: uniqueKey,
          });
          await S3.send(checkCommand);

          // If we reach here, file exists
          console.log(
            "Profile image with name",
            fileName,
            "already exists in S3 bucket"
          );
          return c.json({ error: "File already exists" }, 409);
        } catch (error: any) {
          // If error code is NoSuchKey, file doesn't exist - continue with upload
          if (error.name !== "NoSuchKey") {
            // Some other error occurred
            console.error("Error checking file existence:", error);
            return c.json(
              { error: { message: "Failed to check file existence" } },
              500
            );
          }
          // File doesn't exist, continue with upload process
        }

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: uniqueKey,
          ContentType: contentType,
          ContentLength: size,
        });

        const presignedUrl = await getSignedUrl(S3, command, {
          expiresIn: 360, // 6 minutes
        });

        const publicUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;

        // Insert media record into database
        try {
          await db.insert(media).values({
            fileUrl: publicUrl,
            type: "image",
            mediaCategory: "profile_image",
            title: fileName,
            fileSize: size,
            key: uniqueKey,
          });
        } catch (error) {
          console.error("Error inserting media record into database:", error);
          return c.json(
            { error: `Failed to insert media record: ${error}` },
            500
          );
        }

        try {
          await db
            .update(user)
            .set({ image: publicUrl })
            .where(eq(user.id, userId))
            .returning();
        } catch (error) {}

        const response = {
          presignedUrl,
          publicUrl,
          key: uniqueKey,
        };

        return c.json(response, { status: 200 });
      } catch (error) {
        console.error("Error generating presigned URL:", error);
        return c.json({ error: "Failed to generate presigned URL" }, 500);
      }
    }
  )
  .post(
    "/upload-person-image",
    authAdminMiddleware,
    zValidator("json", uploadPersonImageSchema),
    async (c) => {
      try {
        const validation = c.req.valid("json");
        const { fileName, contentType, size } = validation;

        const uniqueKey = `person_image-${fileName}`;

        // Check if file already exists in S3
        try {
          const checkCommand = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: uniqueKey,
          });
          await S3.send(checkCommand);

          // If we reach here, file exists
          console.log(
            "Person image with name",
            fileName,
            "already exists in S3 bucket"
          );
          return c.json({ error: "File already exists" }, 409);
        } catch (error: any) {
          // If error code is NoSuchKey, file doesn't exist - continue with upload
          if (error.name !== "NoSuchKey") {
            // Some other error occurred
            console.error("Error checking file existence:", error);
            return c.json(
              { error: { message: "Failed to check file existence" } },
              500
            );
          }
          // File doesn't exist, continue with upload process
        }

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: uniqueKey,
          ContentType: contentType,
          ContentLength: size,
        });

        const presignedUrl = await getSignedUrl(S3, command, {
          expiresIn: 360, // 6 minutes
        });

        const publicUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;

        // Insert media record into database
        try {
          await db.insert(media).values({
            fileUrl: publicUrl,
            type: "image",
            mediaCategory: "profile_image",
            title: fileName,
            fileSize: size,
            key: uniqueKey,
          });
        } catch (error) {
          console.error("Error inserting media record into database:", error);
          return c.json(
            { error: `Failed to insert media record: ${error}` },
            500
          );
        }

        const response = {
          presignedUrl,
          publicUrl,
          key: uniqueKey,
        };

        return c.json(response, { status: 200 });
      } catch (error) {
        console.error("Error generating presigned URL:", error);
        return c.json({ error: "Failed to generate presigned URL" }, 500);
      }
    }
  )
  .post(
    "/",
    authAdminMiddleware,
    zValidator("json", uploadRequestSchema),
    async (c) => {
      try {
        const validation = c.req.valid("json");
        const {
          fileName,
          contentType,
          size,
          mediaCategory,
          contentTitle,
          contentId,
        } = validation;

        const uniqueKey = `${contentTitle}-${mediaCategory}-${fileName}`;

        // Check if file already exists in S3
        try {
          const checkCommand = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: uniqueKey,
          });

          await S3.send(checkCommand);

          // If we reach here, file exists
          console.log(
            "File with name",
            fileName,
            "already exists in S3 bucket"
          );
          return c.json({ error: "File already exists" }, 409);
        } catch (error: any) {
          // If error code is NoSuchKey, file doesn't exist - continue with upload
          if (error.name !== "NoSuchKey") {
            // Some other error occurred
            console.error("Error checking file existence:", error);
            return c.json(
              { error: { message: "Failed to check file existence" } },
              500
            );
          }
          // File doesn't exist, continue with upload process
        }

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: uniqueKey,
          ContentType: contentType,
          ContentLength: size,
        });

        const presignedUrl = await getSignedUrl(S3, command, {
          expiresIn: 360, // 6 minutes
        });

        const publicUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;

        // Insert media record into database
        try {
          await db.insert(media).values({
            contentId,
            fileUrl: publicUrl,
            type: "image",
            mediaCategory,
            title: fileName,
            fileSize: size,
            key: uniqueKey,
          });
        } catch (error) {
          console.error("Error inserting media record into database:", error);
          return c.json(
            { error: `Failed to insert media record: ${error}` },
            500
          );
        }

        const response = {
          presignedUrl,
          publicUrl,
          key: uniqueKey,
        };

        return c.json(response, { status: 200 });
      } catch (error) {
        console.error("Error generating presigned URL:", error);
        return c.json({ error: "Failed to generate presigned URL" }, 500);
      }
    }
  )
  .get("/:key", authAdminMiddleware, async (c) => {
    try {
      const key = c.req.param("key");
      if (!key) {
        return c.json({ error: "File key is required" }, { status: 400 });
      }

      // Tigris public URL
      const publicUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${key}`;

      return c.json(
        {
          url: publicUrl,
          key,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error generating URL:", error);
      return c.json({ error: "Failed to generate URL" }, { status: 500 });
    }
  })
  .delete("/:key", authAdminMiddleware, async (c) => {
    try {
      const key = c.req.param("key");
      if (!key) {
        return c.json({ error: "File key is required" }, { status: 400 });
      }

      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      });

      await S3.send(command);
      return c.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting file:", error);
      return c.json({ error: "Failed to delete file" }, { status: 500 });
    }
  });
