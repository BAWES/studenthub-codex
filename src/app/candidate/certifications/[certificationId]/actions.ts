"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateCertification as moduleGetCertification,
  updateCandidateCertification as moduleUpdateCertification,
  deleteCandidateCertification as moduleDeleteCertification,
} from "@/modules/certifications/actions";
import {
  getCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  certificationItemOutputSchema,
  certificationActionResultOutputSchema,
  type CertificationItem,
  type CertificationActionResult,
} from "../schemas";

// Re-export types for client components
export type { CertificationActionResult, CertificationItem };

// ---------------------------------------------------------------------------
// Delegating Server Actions
// ---------------------------------------------------------------------------

/**
 * Get a single certification record by ID.
 * Only returns records belonging to the current candidate.
 */
export async function getCertification(
  certificationId: number,
): Promise<CertificationItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getCertificationSchema.safeParse({ certificationId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certification ID",
    );
  }

  const result = await moduleGetCertification(Number(session.id), parsed.data.certificationId);

  // Validate output shape
  if (result !== null) {
    const outputParsed = certificationItemOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/certifications/[id]] getCertification output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Update an existing certification record.
 * Route-specific action for the [certificationId] edit form.
 */
export async function updateCertification(
  data: Record<string, unknown>,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateCertificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  const result = await moduleUpdateCertification(Number(session.id), parsed.data);

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications/[id]] updateCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/certifications");
  }

  return result;
}

/**
 * Delete a certification record by ID (soft-delete).
 * Route-specific action for the [certificationId] delete button.
 */
export async function deleteCertification(
  certificationId: number,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteCertificationSchema.safeParse({ certificationId });
  if (!parsed.success) {
    return { success: false, error: "Invalid certification ID" };
  }

  const result = await moduleDeleteCertification(Number(session.id), parsed.data.certificationId);

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications/[id]] deleteCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/certifications");
  }

  return result;
}
