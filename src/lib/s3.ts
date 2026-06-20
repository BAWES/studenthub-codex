import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// S3 client (lazy-initialized, supports MinIO via AWS_ENDPOINT_URL)
// ---------------------------------------------------------------------------

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
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

export function s3ConfigAvailable(): boolean {
  return !!(
    process.env.AWS_TEMP_BUCKET_REGION &&
    process.env.AWS_TEMP_ACCESS_KEY_ID &&
    process.env.AWS_TEMP_SECRET_ACCESS_KEY &&
    process.env.AWS_TEMP_BUCKET_NAME
  );
}

// ---------------------------------------------------------------------------
// Upload helpers
// ---------------------------------------------------------------------------

/**
 * Upload a buffer to S3/MinIO.
 * Returns the S3 key on success, null if S3 is not configured.
 */
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string,
): Promise<string | null> {
  if (!s3ConfigAvailable()) return null;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_TEMP_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await getS3Client().send(command);
  return key;
}

/**
 * Generate a presigned download URL for an S3 object.
 * Returns null if S3 is not configured.
 */
export async function getS3DownloadUrl(
  key: string,
  expiresIn = 900, // 15 minutes
): Promise<string | null> {
  if (!s3ConfigAvailable()) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_TEMP_BUCKET_NAME,
    Key: key,
  });

  try {
    return await getSignedUrl(getS3Client(), command, { expiresIn });
  } catch {
    return null;
  }
}

/**
 * Delete an object from S3/MinIO.
 * Returns true if deletion was attempted, false if S3 is not configured.
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  if (!s3ConfigAvailable()) return false;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_TEMP_BUCKET_NAME,
    Key: key,
  });

  await getS3Client().send(command);
  return true;
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const S3_PREFIX = "s3://";

/** Check if a stored path is an S3 key (prefixed with s3://). */
export function isS3Path(path: string): boolean {
  return path.startsWith(S3_PREFIX);
}

/** Strip S3 prefix to get the raw key. */
export function toS3Key(path: string): string {
  return path.startsWith(S3_PREFIX) ? path.slice(S3_PREFIX.length) : path;
}

/** Wrap a raw key with the S3 prefix for DB storage. */
export function toS3StoredPath(key: string): string {
  return `${S3_PREFIX}${key}`;
}
