"use server";

// ---------------------------------------------------------------------------
// Candidate Certification Edit — colocated server action for the
// candidate/certifications/[certificationId]/edit route
// ---------------------------------------------------------------------------

import { updateCertification } from "../actions";
import { updateCertificationSchema } from "./schemas";
import type {
  UpdateCertificationInput,
  CertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// updateCertificationAction — server action for the edit certification form
// ---------------------------------------------------------------------------

/**
 * Update an existing certification record for the current candidate.
 * Colocated route-level action that delegates to the parent `../actions`
 * `updateCertification` after route-level schema validation.
 *
 * @param certificationId - The ID of the certification to update (from route param).
 * @param data - The form data validated against the colocated schema.
 */
export async function updateCertificationAction(
  certificationId: number,
  data: UpdateCertificationInput,
): Promise<CertificationActionResult> {
  const parsed = updateCertificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  // Delegate to the parent [certificationId] action which handles
  // auth, ownership verification, and the actual Prisma update.
  return updateCertification({
    certificationId,
    ...parsed.data,
  });
}

// Re-export types for client components
export type { CertificationActionResult };
