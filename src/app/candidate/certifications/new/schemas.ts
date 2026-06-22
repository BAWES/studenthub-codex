import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated for the candidate/certifications/new route
// ---------------------------------------------------------------------------

/**
 * Zod schema for creating a new certification.
 * Replicates the parent createCertificationSchema from ../schemas.ts
 * for colocated route-level validation.
 */
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

export { certificationActionResultOutputSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateCertificationInput = z.input<typeof createCertificationSchema>;

export type CertificationActionResult =
  | { success: true; certificationId: number }
  | { success: false; error: string };
