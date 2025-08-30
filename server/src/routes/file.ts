import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "../../lib/s3client";

const uploadRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
});

export const fileRouter = new Hono()
  .post("/", zValidator("json", uploadRequestSchema), async (c) => {
    try {
      const validation = c.req.valid("json");

      const { fileName, contentType, size } = validation;

      const uniqueKey = `${uuidv4()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uniqueKey,
        ContentType: contentType,
        ContentLength: size,
      });

      const presignedUrl = await getSignedUrl(S3, command, {
        expiresIn: 360, // 6 minutes
      });

      const response = {
        presignedUrl,
        key: uniqueKey,
      };

      return c.json(response, { status: 200 });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return c.json({ error: "Failed to generate presigned URL" }, 500);
    }
  })
  .delete("/:key", async (c) => {
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
