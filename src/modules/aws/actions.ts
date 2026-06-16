"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireCapability } from "@/modules/auth/session";
import {
  getPresignedUploadUrlSchema,
  getPresignedDownloadUrlSchema,
  presignedUploadResultSchema,
  presignedDownloadResultSchema,
  type PresignedUploadResult,
  type PresignedDownloadResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Environment config
// ---------------------------------------------------------------------------

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_TEMP_BUCKET_REGION ?? "",
      credentials: {
        accessKeyId: process.env.AWS_TEMP_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_TEMP_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return s3Client;
}

const UPLOAD_URL_EXPIRES_IN = 300; // 5 minutes
const DOWNLOAD_URL_EXPIRES_IN = 900; // 15 minutes

function configAvailable(): string | null {
  if (!process.env.AWS_TEMP_BUCKET_REGION) return "AWS_TEMP_BUCKET_REGION is not configured";
  if (!process.env.AWS_TEMP_ACCESS_KEY_ID) return "AWS_TEMP_ACCESS_KEY_ID is not configured";
  if (!process.env.AWS_TEMP_SECRET_ACCESS_KEY) return "AWS_TEMP_SECRET_ACCESS_KEY is not configured";
  if (!process.env.AWS_TEMP_BUCKET_NAME) return "AWS_TEMP_BUCKET_NAME is not configured";
  return null;
}

// ---------------------------------------------------------------------------
// getPresignedUploadUrl
// ---------------------------------------------------------------------------

/**
 * Generate a presigned S3 upload URL.
 *
 * The candidate (or any authenticated user with `document.write` capability)
 * can request a presigned URL to upload a file directly to the temporary S3
 * bucket. The URL expires after 5 minutes.
 */
export async function getPresignedUploadUrl(
  params: z.input<typeof getPresignedUploadUrlSchema>,
): Promise<PresignedUploadResult | { error: string }> {
  await requireCapability("document.write");

  const configError = configAvailable();
  if (configError) {
    return { error: configError };
  }

  const parsed = getPresignedUploadUrlSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid parameters." };
  }

  const { fileName, contentType } = parsed.data;

  // Generate a unique S3 key to prevent collisions
  const ext = fileName.split(".").pop() ?? "";
  const uuid = crypto.randomUUID();
  const key = `uploads/temp/${uuid}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_TEMP_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const uploadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: UPLOAD_URL_EXPIRES_IN,
    });

    const result = {
      uploadUrl,
      key,
      bucket: process.env.AWS_TEMP_BUCKET_NAME ?? "",
      region: process.env.AWS_TEMP_BUCKET_REGION ?? "",
    };

    const outputParsed = presignedUploadResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/aws] getPresignedUploadUrl output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate presigned upload URL";
    return { error: message };
  }
}

// ---------------------------------------------------------------------------
// getPresignedDownloadUrl
// ---------------------------------------------------------------------------

/**
 * Generate a presigned S3 download URL.
 *
 * Returns a time-limited URL to download or view a file from the S3 bucket.
 * The URL expires after 15 minutes.
 */
export async function getPresignedDownloadUrl(
  params: z.input<typeof getPresignedDownloadUrlSchema>,
): Promise<PresignedDownloadResult | { error: string }> {
  await requireCapability("document.read");

  const configError = configAvailable();
  if (configError) {
    return { error: configError };
  }

  const parsed = getPresignedDownloadUrlSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid parameters." };
  }

  const { key } = parsed.data;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_TEMP_BUCKET_NAME,
    Key: key,
  });

  try {
    const downloadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: DOWNLOAD_URL_EXPIRES_IN,
    });

    const result = {
      downloadUrl,
      key,
    };

    const outputParsed = presignedDownloadResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/aws] getPresignedDownloadUrl output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate presigned download URL";
    return { error: message };
  }
}
