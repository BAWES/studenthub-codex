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
import {
  certificateDetailOutputSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
} from "../schemas";
import {
  getCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
} from "./schemas";

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

  const parsed = getCertificateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certificate input",
    );
  }

  const result = await moduleGetCertificate(candidateId, parsed.data);

  // Validate output shape
  const outputParsed = certificateDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates/[id]] getCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const parsed = updateCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Invalid certificate data",
    };
  }

  const result = await moduleUpdateCertificate(candidateId, parsed.data);

  // Validate output shape
  const outputParsed = certificateActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates/[id]] updateCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

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

  const parsed = deleteCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Invalid certificate UUID",
    };
  }

  const result = await moduleDeleteCertificate(candidateId, parsed.data);

  // Validate output shape
  const outputParsed = deleteCertificateResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certificates/[id]] deleteCertificate output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.operation === "success") {
    revalidatePath("/candidate/certificates");
  }

  return result;
}
