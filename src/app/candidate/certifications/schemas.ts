import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
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
// Types
// ---------------------------------------------------------------------------

export type ListCertificationsInput = z.input<typeof listCertificationsSchema>;
export type GetCertificationInput = z.input<typeof getCertificationSchema>;
export type CreateCertificationInput = z.input<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.input<typeof updateCertificationSchema>;
export type DeleteCertificationInput = z.input<typeof deleteCertificationSchema>;

// Re-export types from module
export type {
  CertificationItem,
  CertificationActionResult,
} from "@/modules/certifications/schemas";

// Re-export output schemas from module with original names for compatibility
import {
  certificationItemSchema as _certItemSchema,
  certificationListSchema as _certListSchema,
  certificationActionResultSchema as _certActionResultSchema,
} from "@/modules/certifications/schemas";

export const certificationItemOutputSchema = _certItemSchema;
export const certificationListOutputSchema = _certListSchema;
export const certificationActionResultOutputSchema = _certActionResultSchema;
