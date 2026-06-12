import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCertificationsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCertificationSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

export const createCertificationSchema = z.object({
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

export const updateCertificationSchema = z.object({
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

export const deleteCertificationSchema = z.object({
  certificationId: z.coerce.number().int().positive("Certification ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const certificationItemOutputSchema = z.object({
  certification_id: z.number().int(),
  certification_name: z.string(),
  issuing_organization: z.string(),
  issue_date: z.date().nullable(),
  expiry_date: z.date().nullable(),
  credential_id: z.string().nullable(),
  credential_url: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const certificationListOutputSchema = z.array(certificationItemOutputSchema);

export const certificationActionResultOutputSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      certificationId: z.number().int(),
    }),
    z.object({ success: z.literal(false), error: z.string() }),
  ],
);

// Output types
export type CertificationItem = z.output<typeof certificationItemOutputSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCertificationsInput = z.input<typeof listCertificationsSchema>;
export type GetCertificationInput = z.input<typeof getCertificationSchema>;
export type CreateCertificationInput = z.input<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.input<typeof updateCertificationSchema>;
export type DeleteCertificationInput = z.input<typeof deleteCertificationSchema>;

export type CertificationActionResult =
  | { success: true; certificationId: number }
  | { success: false; error: string };
