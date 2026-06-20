"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireCapability } from "@/modules/auth/session";
import {
  getPresignedUploadUrlSchema,
  getPresignedDownloadUrlSchema,
  presignedUploadResultSchema,
  presignedDownloadResultSchema,
  putS3ObjectParamsSchema,
  deleteS3ObjectParamsSchema,
  s3OperationResultSchema,
  type PresignedUploadResult,
  type PresignedDownloadResult,
  type S3OperationResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Environment config
// ---------------------------------------------------------------------------

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const config: ConstructorParameters<typeof S3Client>[0] = {
      region: process.env.AWS_TEMP_BUCKET_REGION ?? "",
      credentials: {
        accessKeyId: process.env.AWS_TEMP_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_TEMP_SECRET_ACCESS_KEY ?? "",
      },
    };

    // Support custom S3-compatible endpoint (MinIO, etc.)
    if (process.env.AWS_ENDPOINT_URL) {
      config.endpoint = process.env.AWS_ENDPOINT_URL;
    }

    // Force path-style addressing for MinIO compatibility
    if (process.env.AWS_S3_FORCE_PATH_STYLE === "true") {
      config.forcePathStyle = true;
    }

    s3Client = new S3Client(config);
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

// ---------------------------------------------------------------------------
// Direct S3 object operations
// ---------------------------------------------------------------------------

/**
 * Generate a presigned S3 download URL without capability check.
 *
 * Unlike getPresignedDownloadUrl (which requires document.read), this is a
 * pure utility that generates the URL from any authenticated context that
 * already performed its own authorization.
 */
export async function getS3DownloadUrl(
  key: string,
  expiresIn = 900,
): Promise<string | null> {
  const configError = configAvailable();
  if (configError) return null;

  const command = new GetObjectCommand({
    Bucket: bucketName(),
    Key: key,
  });

  try {
    return await getSignedUrl(getS3Client(), command, { expiresIn });
  } catch {
    return null;
  }
}
function bucketName(): string {
  return process.env.AWS_TEMP_BUCKET_NAME ?? "";
}

/** Check whether a stored path looks like an S3 key rather than a local path. */
export function isS3Path(path: string): boolean {
  return path.startsWith("s3://");
}

/** Strip S3 prefix to get the raw key. */
export function toS3Key(path: string): string {
  return path.startsWith("s3://") ? path.slice(4) : path;
}

/** Wrap a raw key with the S3 prefix for DB storage. */
export function toS3StoredPath(key: string): string {
  return `s3://${key}`;
}

/** Check whether S3 configuration is available. */
export async function isS3Configured(): Promise<boolean> {
  return configAvailable() === null;
}

/**
 * Upload a buffer directly to the S3/MinIO bucket.
 *
 * Used by server actions that receive FormData and need to store files in S3
 * rather than via client-side presigned uploads.
 */
export async function putS3Object(
  params: z.input<typeof putS3ObjectParamsSchema> & { buffer: Buffer },
): Promise<S3OperationResult> {
  const configError = configAvailable();
  if (configError) {
    return { success: false, error: configError, key: params.key };
  }

  const parsed = putS3ObjectParamsSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid parameters.",
      key: params.key,
    };
  }

  const { key, contentType } = parsed.data;
  const { buffer } = params;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await getS3Client().send(command);

    const result: S3OperationResult = { success: true, key };

    // Validate output shape
    const outputParsed = s3OperationResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/aws] putS3Object output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload object to S3";
    return { success: false, error: message, key: params.key };
  }
}

/**
 * Delete an object from the S3/MinIO bucket.
 */
export async function deleteS3Object(
  params: z.input<typeof deleteS3ObjectParamsSchema>,
): Promise<S3OperationResult> {
  const configError = configAvailable();
  if (configError) {
    return { success: false, error: configError, key: params.key };
  }

  const parsed = deleteS3ObjectParamsSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid parameters.",
      key: params.key,
    };
  }

  const { key } = parsed.data;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName(),
      Key: key,
    });

    await getS3Client().send(command);

    const result: S3OperationResult = { success: true, key };

    // Validate output shape
    const outputParsed = s3OperationResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/aws] deleteS3Object output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete object from S3";
    return { success: false, error: message, key: params.key };
  }
}
