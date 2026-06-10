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
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type DocumentItem = {
  file_uuid: string;
  company_id: number | null;
  file_title: string;
  file_description: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  file_s3_path: string | null;
  file_created_datetime: Date;
};
export type ListDocumentsResult = {
  documents: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type UploadDocumentResult = {
  file_uuid: string;
  file_s3_path: string | null;
};
