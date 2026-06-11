"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCertificate as moduleGetCertificate,
  updateCertificate as moduleUpdateCertificate,
  deleteCertificate as moduleDeleteCertificate,
} from "@/modules/candidates/certificates";
import type {
  CertificateItem,
  CertificateActionResult,
  DeleteCertificateResult,
  GetCertificateInput,
  UpdateCertificateInput,
  DeleteCertificateInput,
} from "@/modules/candidates/certificates";

// ---------------------------------------------------------------------------
// getCertificate
// ---------------------------------------------------------------------------

/**
 * Get a single certificate by UUID for the [id] route.
 * Delegates to the module-level getCertificate action.
 */
export async function getCertificate(
  input: GetCertificateInput,
): Promise<CertificateItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  return moduleGetCertificate(candidateId, input);
}

// ---------------------------------------------------------------------------
// updateCertificate
// ---------------------------------------------------------------------------

/**
 * Update a single certificate by UUID for the [id] route.
 * Delegates to the module-level updateCertificate action.
 */
export async function updateCertificate(
  input: UpdateCertificateInput,
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await moduleUpdateCertificate(candidateId, input);

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteCertificate
// ---------------------------------------------------------------------------

/**
 * Soft-delete a single certificate by UUID for the [id] route.
 * Delegates to the module-level deleteCertificate action.
 */
export async function deleteCertificate(
  input: DeleteCertificateInput,
): Promise<DeleteCertificateResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await moduleDeleteCertificate(candidateId, input);

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}
