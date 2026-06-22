import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCandidateReferencesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCandidateReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

export const createCandidateReferenceSchema = z.object({
  name: z
    .string()
    .min(1, "Reference name is required")
    .max(255, "Name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  company: z
    .string()
    .max(255, "Company must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  position: z
    .string()
    .max(255, "Position must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  email: z
    .string()
    .max(255, "Email must be 255 characters or fewer")
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .default(""),
  relationship: z
    .string()
    .max(255, "Relationship must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

export const updateCandidateReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
  name: z
    .string()
    .min(1, "Reference name is required")
    .max(255, "Name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  company: z
    .string()
    .max(255, "Company must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  position: z
    .string()
    .max(255, "Position must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  email: z
    .string()
    .max(255, "Email must be 255 characters or fewer")
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .default(""),
  relationship: z
    .string()
    .max(255, "Relationship must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

export const deleteCandidateReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

// Input types
export type ListCandidateReferencesParams = z.input<typeof listCandidateReferencesSchema>;
export type CreateCandidateReferenceParams = z.input<typeof createCandidateReferenceSchema>;
export type UpdateCandidateReferenceParams = z.input<typeof updateCandidateReferenceSchema>;
export type DeleteCandidateReferenceParams = z.input<typeof deleteCandidateReferenceSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateReferenceItemSchema = z.object({
  reference_uuid: z.string(),
  candidate_id: z.number().int().nullable(),
  name: z.string(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  relationship: z.string().nullable(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
});

export const listCandidateReferencesResultSchema = z.object({
  items: z.array(candidateReferenceItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

/** Validates the CandidateReferenceActionResult discriminated union. */
export const candidateReferenceActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), referenceUuid: z.string() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type CandidateReferenceItem = z.output<typeof candidateReferenceItemSchema>;
export const candidateReferenceDetailSchema =
  candidateReferenceItemSchema.nullable();
export type CandidateReferenceDetail = z.output<
  typeof candidateReferenceDetailSchema
>;
export type ListCandidateReferencesResult = z.output<typeof listCandidateReferencesResultSchema>;
export type CandidateReferenceActionResult = z.output<typeof candidateReferenceActionResultSchema>;
