import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Verify — output validation schemas
// ---------------------------------------------------------------------------

export const verificationStatusSchema = z.enum(["pending", "verified", "rejected", "expired", "resubmitted"]);
export type VerificationStatus = z.output<typeof verificationStatusSchema>;

export const verificationTypeSchema = z.enum([
  "identity", "education", "employment", "certification", "reference", "address", "civil-id",
]);
export type VerificationType = z.output<typeof verificationTypeSchema>;

export const verificationDocumentSchema = z.object({
  document_uuid: z.string(),
  document_type: z.string(),
  file_name: z.string(),
  file_url: z.string(),
  uploaded_at: z.string(),
});
export type VerificationDocument = z.output<typeof verificationDocumentSchema>;

export const verificationItemSchema = z.object({
  verification_uuid: z.string(),
  verification_type: verificationTypeSchema,
  status: verificationStatusSchema,
  document_count: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  submitted_at: z.string(),
  verified_at: z.string().nullable(),
  verified_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type VerificationItem = z.output<typeof verificationItemSchema>;

export const listVerificationsResultSchema = z.object({
  verifications: z.array(verificationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListVerificationsResult = z.output<typeof listVerificationsResultSchema>;

export const verificationActionResultSchema = z.object({
  success: z.boolean(),
  verification_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type VerificationActionResult = z.output<typeof verificationActionResultSchema>;

export const verificationDetailSchema = z.object({
  verification_uuid: z.string(),
  verification_type: verificationTypeSchema,
  status: verificationStatusSchema,
  candidate_name: z.string(),
  candidate_email: z.string(),
  documents: z.array(verificationDocumentSchema),
  notes: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  submitted_at: z.string(),
  verified_at: z.string().nullable(),
  verified_by_name: z.string().nullable(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type VerificationDetail = z.output<typeof verificationDetailSchema>;
