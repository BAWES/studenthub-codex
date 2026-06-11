// ---------------------------------------------------------------------------
// Candidate Documents — type definitions and constants
// ---------------------------------------------------------------------------
// Separated from actions.ts to avoid "use server" export restrictions.
// Server-action files can only export async functions.
// ---------------------------------------------------------------------------

import { z } from "zod";

// ---------------------------------------------------------------------------
// Document types
// ---------------------------------------------------------------------------

export const DOCUMENT_TYPES = [
  "photo",
  "cv",
  "video",
  "civilFront",
  "civilBack",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** A single document entry returned from list / get. */
export type CandidateDocumentItem = {
  type: DocumentType;
  label: string;
  filePath: string | null;
  fileUrl: string | null;
};

export type ListCandidateDocumentsResult = {
  items: CandidateDocumentItem[];
  candidateId: number;
};

/** Upload result shape for useActionState. */
export type UploadDocumentState = {
  success: boolean;
  error?: string;
  filePath?: string;
};

/** Delete result shape for useActionState. */
export type DeleteDocumentState = {
  success: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Zod input schemas
// ---------------------------------------------------------------------------

export const listDocumentsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const getDocumentSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type. Must be one of: photo, cv, video, civilFront, civilBack." }),
  }),
});

export const uploadDocumentParamsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type" }),
  }),
});

export const deleteDocumentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type. Must be one of: photo, cv, video, civilFront, civilBack." }),
  }),
});

export type ListDocumentsParams = z.input<typeof listDocumentsSchema>;
export type GetDocumentParams = z.input<typeof getDocumentSchema>;
export type UploadDocumentParams = z.input<typeof uploadDocumentParamsSchema>;
export type DeleteDocumentParams = z.input<typeof deleteDocumentSchema>;

// ---------------------------------------------------------------------------
// Zod output validation schemas
// ---------------------------------------------------------------------------

export const candidateDocumentItemResultSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  label: z.string(),
  filePath: z.string().nullable(),
  fileUrl: z.string().nullable(),
});

export const listCandidateDocumentsResultSchema = z.object({
  items: z.array(candidateDocumentItemResultSchema),
  candidateId: z.number().int(),
});

export const getCandidateDocumentResultSchema =
  candidateDocumentItemResultSchema.nullable();

export const uploadDocumentStateResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  filePath: z.string().optional(),
});

export const deleteDocumentStateResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
