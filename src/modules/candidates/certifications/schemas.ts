import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCandidateCertificationsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCandidateCertificationSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

export const createCandidateCertificationSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  certificationName: z
    .string()
    .min(1, "Certification name is required")
    .max(255, "Certification name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issuingOrganization: z
    .string()
    .min(1, "Issuing organization is required")
    .max(255, "Issuing organization must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z
    .string()
    .max(128, "Credential ID must be 128 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  credentialUrl: z
    .string()
    .max(500, "Credential URL must be 500 characters or fewer")
    .url("Credential URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export const updateCandidateCertificationSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
  certificationName: z
    .string()
    .min(1, "Certification name is required")
    .max(255, "Certification name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issuingOrganization: z
    .string()
    .min(1, "Issuing organization is required")
    .max(255, "Issuing organization must be 255 characters or fewer")
    .transform((v) => v.trim()),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z
    .string()
    .max(128, "Credential ID must be 128 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  credentialUrl: z
    .string()
    .max(500, "Credential URL must be 500 characters or fewer")
    .url("Credential URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export const deleteCandidateCertificationSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

// Input types
export type ListCandidateCertificationsParams = z.input<typeof listCandidateCertificationsSchema>;
export type GetCandidateCertificationParams = z.input<typeof getCandidateCertificationSchema>;
export type CreateCandidateCertificationParams = z.input<typeof createCandidateCertificationSchema>;
export type UpdateCandidateCertificationParams = z.input<typeof updateCandidateCertificationSchema>;
export type DeleteCandidateCertificationParams = z.input<typeof deleteCandidateCertificationSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateCertificationItemSchema = z.object({
  certification_id: z.number().int(),
  candidate_id: z.number().int(),
  certification_name: z.string(),
  issuing_organization: z.string(),
  issue_date: z.date().nullable(),
  expiry_date: z.date().nullable(),
  credential_id: z.string().nullable(),
  credential_url: z.string().nullable(),
  description: z.string().nullable(),
  deleted: z.number().int(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listCandidateCertificationsResultSchema = z.object({
  items: z.array(candidateCertificationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const candidateCertificationActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), certificationId: z.number().int() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type CandidateCertificationItem = z.output<typeof candidateCertificationItemSchema>;
export const candidateCertificationDetailSchema =
  candidateCertificationItemSchema.nullable();
export type CandidateCertificationDetail = z.output<
  typeof candidateCertificationDetailSchema
>;
export type ListCandidateCertificationsResult = z.output<typeof listCandidateCertificationsResultSchema>;
export type CandidateCertificationActionResult = z.output<typeof candidateCertificationActionResultSchema>;
