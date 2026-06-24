import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/documents actions
// ---------------------------------------------------------------------------

export const listDocumentsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getDocumentSchema = z.object({
  file_uuid: z
    .string({ required_error: "File UUID is required" })
    .min(1, "File UUID is required"),
});
export const uploadDocumentSchema = z.object({
  company_id: z.number().int().positive(),
  file_title: z
    .string({ required_error: "File title is required" })
    .min(1, "File title is required")
    .max(255),
  file_name: z
    .string({ required_error: "File name is required" })
    .min(1, "File name is required")
    .max(255),
  file_type: z.string().max(100).optional(),
  file_size: z.number().int().nonnegative().optional(),
  file_description: z.string().max(65535).optional(),
});
// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single document item returned from listDocuments / getDocument.
 */
export const documentItemSchema = z.object({
  file_uuid: z.string(),
  company_id: z.number().int().nullable(),
  file_title: z.string(),
  file_description: z.string().nullable(),
  file_name: z.string().nullable(),
  file_type: z.string().nullable(),
  file_size: z.number().int().nullable(),
  file_s3_path: z.string().nullable(),
  file_created_datetime: z.date(),
});

/**
 * Schema for getDocument result (item or null).
 */
export const documentDetailSchema = documentItemSchema.nullable();

/**
 * Schema for the listDocuments response.
 */
export const listDocumentsResultSchema = z.object({
  documents: z.array(documentItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the uploadDocument response.
 */
export const uploadDocumentResultSchema = z.object({
  file_uuid: z.string(),
  file_s3_path: z.string().nullable(),
});

/**
 * Schema for deleteDocumentRecord input.
 */
export const deleteDocumentRecordSchema = z.object({
  file_uuid: z
    .string({ required_error: "File UUID is required" })
    .min(1, "File UUID is required"),
});

/**
 * Schema for the deleteDocumentRecord response.
 */
export const deleteDocumentRecordResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDocumentsInput = z.input<typeof listDocumentsSchema>;
export type UploadDocumentInput = z.input<typeof uploadDocumentSchema>;
export type DocumentItem = z.output<typeof documentItemSchema>;
export type DocumentDetail = z.output<typeof documentDetailSchema>;
export type ListDocumentsResult = z.output<typeof listDocumentsResultSchema>;
export type UploadDocumentResult = z.output<typeof uploadDocumentResultSchema>;
