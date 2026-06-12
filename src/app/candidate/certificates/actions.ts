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
import {
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
  type ListCertificatesInput,
  type GetCertificateInput,
  type CreateCertificateInput,
  type UpdateCertificateInput,
  type DeleteCertificateInput,
  type CertificateItem,
  type ListCertificatesResult,
  type CertificateActionResult,
  type DeleteCertificateResult,
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
  params: ListCertificatesInput = {},
): Promise<ListCertificatesResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  // Validate input
  const parsed = listCertificatesSchema.safeParse(params);
  if (!parsed.success) {
    return { certificates: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const result = await moduleListCertificates(candidateId, parsed.data);

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

  // Validate input
  const parsed = getCertificateSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid certificate UUID");
  }

  const result = await moduleGetCertificate(candidateId, parsed.data);

  // Validate output shape
  const outputParsed = certificateItemSchema.nullable().safeParse(result);
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
  input: CreateCertificateInput,
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  // Validate input
  const parsed = createCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await moduleCreateCertificate(candidateId, parsed.data);

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
  input: UpdateCertificateInput,
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  // Validate input
  const parsed = updateCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await moduleUpdateCertificate(candidateId, parsed.data);

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
  input: DeleteCertificateInput,
): Promise<DeleteCertificateResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  // Validate input
  const parsed = deleteCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await moduleDeleteCertificate(candidateId, parsed.data);

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
