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
  return moduleListCertificates(candidateId, params);
}

/**
 * Get a single certificate by UUID, scoped to the authenticated candidate.
 */
export async function getCertificate(uuid: string): Promise<CertificateItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);
  return moduleGetCertificate(candidateId, { uuid });
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

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}
