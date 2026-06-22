import { z } from "zod";
import {
  certificateItemSchema as _certificateItemSchema,
  listCertificatesResultSchema as _listCertificatesResultSchema,
  certificateActionResultSchema as _certificateActionResultSchema,
  deleteCertificateResultSchema as _deleteCertificateResultSchema,
  listCertificatesSchema as _listCertificatesSchema,
  getCertificateSchema as _getCertificateSchema,
  createCertificateSchema as _createCertificateSchema,
  updateCertificateSchema as _updateCertificateSchema,
  deleteCertificateSchema as _deleteCertificateSchema,
} from "@/modules/candidates/certificates/schemas";

// ---------------------------------------------------------------------------
// Schema + type re-exports — input schemas for validation, output schemas for
// safeParse guards, and TypeScript types for function signatures
// ---------------------------------------------------------------------------

// Input schemas
export const listCertificatesSchema = _listCertificatesSchema;
export const getCertificateSchema = _getCertificateSchema;
export const createCertificateSchema = _createCertificateSchema;
export const updateCertificateSchema = _updateCertificateSchema;
export const deleteCertificateSchema = _deleteCertificateSchema;

// Output schemas
export const certificateItemSchema = _certificateItemSchema;
export const listCertificatesResultSchema = _listCertificatesResultSchema;
export const certificateActionResultSchema = _certificateActionResultSchema;
export const deleteCertificateResultSchema = _deleteCertificateResultSchema;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCertificatesInput = z.input<typeof listCertificatesSchema>;
export type GetCertificateInput = z.input<typeof getCertificateSchema>;
export type CreateCertificateInput = z.input<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.input<typeof updateCertificateSchema>;
export type DeleteCertificateInput = z.input<typeof deleteCertificateSchema>;

export type CertificateItem = z.output<typeof certificateItemSchema>;
export type ListCertificatesResult = z.output<typeof listCertificatesResultSchema>;
export type CertificateActionResult = z.output<typeof certificateActionResultSchema>;
export type DeleteCertificateResult = z.output<typeof deleteCertificateResultSchema>;
