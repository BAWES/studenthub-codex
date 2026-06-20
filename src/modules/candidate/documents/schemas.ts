import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/documents route-level server actions
// ---------------------------------------------------------------------------

const DOCUMENT_TYPES = ["photo", "cv", "video", "civilFront", "civilBack"] as const;

export const listDocumentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getDocumentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, {
    errorMap: () => ({ message: "Invalid document type. Must be one of: photo, cv, video, civilFront, civilBack." }),
  }),
});

// ---------------------------------------------------------------------------
// Output validation — re-exports from module-level schemas
// ---------------------------------------------------------------------------

export {
  candidateDocumentItemResultSchema as documentItemOutputSchema,
  listCandidateDocumentsResultSchema as listDocumentsOutputSchema,
  getCandidateDocumentResultSchema as getDocumentOutputSchema,
  uploadDocumentStateResultSchema as uploadDocumentOutputSchema,
  deleteDocumentStateResultSchema as deleteDocumentOutputSchema,
} from "@/modules/candidates/documents/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDocumentsParams = z.input<typeof listDocumentsSchema>;
export type GetDocumentParams = z.input<typeof getDocumentSchema>;
