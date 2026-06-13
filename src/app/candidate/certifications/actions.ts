"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateCertifications as moduleListCertifications,
  getCandidateCertification as moduleGetCertification,
  createCandidateCertification as moduleCreateCertification,
  updateCandidateCertification as moduleUpdateCertification,
  deleteCandidateCertification as moduleDeleteCertification,
} from "@/modules/certifications/actions";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  certificationItemOutputSchema,
  certificationListOutputSchema,
  certificationActionResultOutputSchema,
} from "./schemas";
import type {
  ListCertificationsInput,
  CreateCertificationInput,
  UpdateCertificationInput,
  CertificationActionResult,
  CertificationItem,
} from "./schemas";

// Re-export types for client components
export type { CertificationActionResult, CertificationItem };

// ---------------------------------------------------------------------------
// Delegating Server Actions
// ---------------------------------------------------------------------------

/**
 * List certification records for the current candidate (paginated).
 */
export async function listCandidateCertifications(
  input: ListCertificationsInput = {},
): Promise<CertificationItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listCertificationsSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid certifications list params",
    );
  }

  const result = await moduleListCertifications(Number(session.id), parsed.data);

  // Validate output shape
  const outputParsed = certificationListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications] listCandidateCertifications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single certification record by ID.
 * Only returns records belonging to the current candidate.
 */
export async function getCandidateCertification(
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
        "[candidate/certifications] getCandidateCertification output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Create a new certification record for the current candidate.
 */
export async function createCandidateCertification(
  data: CreateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createCertificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  const result = await moduleCreateCertification(Number(session.id), parsed.data);

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications] createCandidateCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/certifications");
  }

  return result;
}

/**
 * Update an existing certification record.
 */
export async function updateCandidateCertification(
  data: UpdateCertificationInput,
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
      "[candidate/certifications] updateCandidateCertification output validation failed:",
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
 */
export async function deleteCandidateCertification(
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
      "[candidate/certifications] deleteCandidateCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/certifications");
  }

  return result;
}
