import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/aws actions
// ---------------------------------------------------------------------------

export const getPresignedUploadUrlSchema = z.object({
  fileName: z
    .string({ required_error: "File name is required" })
    .min(1, "File name is required")
    .max(255, "File name must be 255 characters or less")
    .regex(/^[^/\\]+\.\w+$/, "File name must have an extension and no path separators")
    .refine((v) => !v.includes(".."), "File name must not contain path traversal"),
  contentType: z
    .string({ required_error: "Content type is required" })
    .min(1, "Content type is required"),
});
export const getPresignedDownloadUrlSchema = z.object({
  key: z
    .string({ required_error: "S3 key is required" })
    .min(1, "S3 key is required")
    .refine((v) => !v.includes(".."), "Key must not contain path traversal")
    .refine((v) => v.length > 1 && !/^\/+$/.test(v), "Key must not be only slashes"),
});
// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const presignedUploadResultSchema = z.object({
  uploadUrl: z.string(),
  key: z.string(),
  bucket: z.string(),
  region: z.string(),
});
export type PresignedUploadResult = z.output<typeof presignedUploadResultSchema>;

export const presignedDownloadResultSchema = z.object({
  downloadUrl: z.string(),
  key: z.string(),
});
export type PresignedDownloadResult = z.output<typeof presignedDownloadResultSchema>;

// ---------------------------------------------------------------------------
// Direct S3 object operations
// ---------------------------------------------------------------------------

export const s3KeySchema = z
  .string({ required_error: "S3 key is required" })
  .min(1, "S3 key is required")
  .refine((v) => !v.includes(".."), "Key must not contain path traversal")
  .refine((v) => !v.startsWith("/"), "Key must not start with a slash");

export const putS3ObjectParamsSchema = z.object({
  key: s3KeySchema,
  contentType: z.string().min(1, "Content type is required"),
});

export const deleteS3ObjectParamsSchema = z.object({
  key: s3KeySchema,
});

export const s3OperationResultSchema = z.object({
  success: z.boolean(),
  key: z.string(),
  url: z.string().optional(),
  error: z.string().optional(),
});
export type S3OperationResult = z.output<typeof s3OperationResultSchema>;
