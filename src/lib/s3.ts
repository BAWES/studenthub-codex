/**
 * S3-compatible file storage client.
 *
 * Supports MinIO (local dev) and AWS S3 (production).
 * Configure via environment variables in .env.local:
 *   S3_ENDPOINT=http://127.0.0.1:9000      (MinIO endpoint — omit for AWS S3)
 *   S3_REGION=us-east-1                     (default)
 *   S3_ACCESS_KEY=minioadmin
 *   S3_SECRET_KEY=minioadmin
 *   S3_BUCKET=studenthub-uploads
 *   S3_PUBLIC_URL_BASE=http://127.0.0.1:9000/studenthub-uploads  (public URL prefix, optional)
 *
 * When S3_ENDPOINT is set, the client uses path-style addressing (MinIO-compatible).
 * When omitted, AWS S3 virtual-hosted-style is used.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";

function getConfig() {
  const endpoint = process.env.S3_ENDPOINT || "";
  const region = process.env.S3_REGION || "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY || "minioadmin";
  const secretAccessKey = process.env.S3_SECRET_KEY || "minioadmin";
  const bucket = process.env.S3_BUCKET || "studenthub-uploads";
  const publicUrlBase = process.env.S3_PUBLIC_URL_BASE || "";

  return { endpoint, region, accessKeyId, secretAccessKey, bucket, publicUrlBase };
}

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  const config = getConfig();

  _client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    ...(config.endpoint
      ? {
          endpoint: config.endpoint,
          forcePathStyle: true, // Required for MinIO
        }
      : {}),
  });

  return _client;
}

export interface UploadResult {
  /** Public URL to access the file */
  url: string;
  /** S3 key (path within bucket) */
  key: string;
  /** Bucket name */
  bucket: string;
}

/**
 * Upload a file to S3-compatible storage.
 *
 * @param key      - The S3 object key (e.g. "candidates/123/photo_uuid.jpg")
 * @param body     - File contents as Buffer, Uint8Array, Blob, or Readable stream
 * @param mimeType - Content-Type (e.g. "image/jpeg")
 * @returns UploadResult with public URL and key
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | Readable,
  mimeType: string,
): Promise<UploadResult> {
  const config = getConfig();
  const client = getClient();

  // Convert Blob to Buffer if needed
  let uploadBody: Buffer | Uint8Array | Readable;
  if (body instanceof Blob) {
    uploadBody = Buffer.from(await body.arrayBuffer());
  } else {
    uploadBody = body;
  }

  const upload = new Upload({
    client,
    params: {
      Bucket: config.bucket,
      Key: key,
      Body: uploadBody,
      ContentType: mimeType,
    },
  });

  await upload.done();

  // Build public URL
  let url: string;
  if (config.publicUrlBase) {
    url = `${config.publicUrlBase.replace(/\/+$/, "")}/${key}`;
  } else if (config.endpoint) {
    // MinIO: http://host:port/bucket/key
    url = `${config.endpoint.replace(/\/+$/, "")}/${config.bucket}/${key}`;
  } else {
    // AWS S3: https://bucket.s3.region.amazonaws.com/key
    url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
  }

  return { url, key, bucket: config.bucket };
}

/**
 * Delete a file from S3.
 */
export async function deleteFile(key: string): Promise<void> {
  const config = getConfig();
  const client = getClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

/**
 * Generate a unique S3 key for a candidate document.
 *
 * Example: candidates/42/photo_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
 */
export function candidateKey(candidateId: number, field: string, ext: string): string {
  const uuid = crypto.randomUUID();
  return `candidates/${candidateId}/${field}_${uuid}${ext}`;
}

/**
 * Extract the S3 key from a stored URL.
 * Useful if you need to delete/replace a previously uploaded file.
 */
export function keyFromUrl(url: string): string | null {
  const s3Match = url.match(/\/candidates\/\d+\/\w+_[a-f0-9-]+\.[a-z0-9]+/i);
  if (s3Match) return s3Match[0].replace(/^\//, "");
  return null;
}

/** Whether S3 is configured (has endpoint or access key, or AWS_TEMP_* vars) */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_ENDPOINT ||
    process.env.S3_ACCESS_KEY ||
    (process.env.AWS_TEMP_BUCKET_REGION &&
      process.env.AWS_TEMP_ACCESS_KEY_ID &&
      process.env.AWS_TEMP_SECRET_ACCESS_KEY &&
      process.env.AWS_TEMP_BUCKET_NAME)
  );
}

/** Check whether a stored path looks like an S3 key rather than a local path. */
export function isS3Path(path: string): boolean {
  return path.startsWith("s3://");
}

/** Strip S3 prefix to get the raw key. */
export function toS3Key(path: string): string {
  return path.startsWith("s3://") ? path.slice(5) : path;
}

/** Wrap a raw key with the S3 prefix for DB storage. */
export function toS3StoredPath(key: string): string {
  return `s3://${key}`;
}
