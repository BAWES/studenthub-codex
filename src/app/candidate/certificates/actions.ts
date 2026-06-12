"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCertificates as moduleListCertificates,
  getCertificate as moduleGetCertificate,
  createCertificate as moduleCreateCertificate,
  updateCertificate as moduleUpdateCertificate,
  deleteCertificate as moduleDeleteCertificate,
} from "@/modules/candidates/certificates";
import type {
  CertificateItem,
  ListCertificatesResult,
  CertificateActionResult,
  DeleteCertificateResult,
} from "@/modules/candidates/certificates";
import {
  listCertificatesResultSchema,
  certificateDetailOutputSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
} from "./schemas";

// Re-export types for consumers
export type { CertificateItem, ListCertificatesResult, CertificateActionResult, DeleteCertificateResult };

// ---------------------------------------------------------------------------
// Delegating Server Actions
// ---------------------------------------------------------------------------

/**
 * List certificates for the authenticated candidate.
 */
export async function listCertificates(
  params: { page?: number; limit?: number } = {},
): Promise<ListCertificatesResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);
  const result = await moduleListCertificates(candidateId, params);

  // Validate output shape
  const outputParsed = listCertificatesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates] listCertificates output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single certificate by UUID, scoped to the authenticated candidate.
 */
export async function getCertificate(uuid: string): Promise<CertificateItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);
  const result = await moduleGetCertificate(candidateId, { uuid });

  // Validate output shape
  const outputParsed = certificateDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates] getCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new certificate for the authenticated candidate.
 */
export async function createCertificate(
  input: {
    certificateType?: boolean;
    certificateTitle?: string;
    certificateIssuer?: string;
    certificateUrl?: string;
    candidateWorkHistoryId?: number;
    examUuid?: string;
    storeId?: number;
    companyId?: number;
    parentCompanyId?: number;
    startDate?: string;
    endDate?: string;
  },
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await moduleCreateCertificate(candidateId, input);

  // Validate output shape
  const outputParsed = certificateActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates] createCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}

/**
 * Update an existing certificate, scoped to the authenticated candidate.
 */
export async function updateCertificate(
  input: {
    certificateUuid: string;
    certificateType?: boolean;
    certificateTitle?: string;
    certificateIssuer?: string;
    certificateUrl?: string;
    candidateWorkHistoryId?: number;
    examUuid?: string;
    storeId?: number;
    companyId?: number;
    parentCompanyId?: number;
    startDate?: string;
    endDate?: string;
  },
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await moduleUpdateCertificate(candidateId, input);

  // Validate output shape
  const outputParsed = certificateActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates] updateCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}

/**
 * Soft-delete a certificate, scoped to the authenticated candidate.
 */
export async function deleteCertificate(
  certificateUuid: string,
): Promise<DeleteCertificateResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await moduleDeleteCertificate(candidateId, { certificateUuid });

  // Validate output shape
  const outputParsed = deleteCertificateResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates] deleteCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}
