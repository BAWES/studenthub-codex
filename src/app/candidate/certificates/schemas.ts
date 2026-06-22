import { z } from "zod";
import {
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
} from "@/modules/candidates/certificates/schemas";

// ---------------------------------------------------------------------------
// Schema + type re-exports — input schemas for validation, output schemas for
// safeParse guards, and TypeScript types for function signatures
// ---------------------------------------------------------------------------

export {
  // Input schemas
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  // Output schemas
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
};

// Re-export inferred input/output types
export type {
  ListCertificatesInput,
  GetCertificateInput,
  CreateCertificateInput,
  UpdateCertificateInput,
  DeleteCertificateInput,
  CertificateItem,
  ListCertificatesResult,
  CertificateActionResult,
  DeleteCertificateResult,
} from "@/modules/candidates/certificates/schemas";

/** Nullable variant for getCertificate which returns CertificateItem | null */
export const certificateDetailOutputSchema = certificateItemSchema.nullable();
