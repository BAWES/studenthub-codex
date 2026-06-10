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
export type PresignedUploadResult = {
  uploadUrl: string;
  key: string;
  bucket: string;
  region: string;
};
export type PresignedDownloadResult = {
  downloadUrl: string;
  key: string;
};
