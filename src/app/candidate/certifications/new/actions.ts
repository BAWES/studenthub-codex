"use server";

// ---------------------------------------------------------------------------
// Candidate Certification Create — colocated server action for the
// candidate/certifications/new route
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import { createCandidateCertification as moduleCreateCertification } from "@/modules/certifications/actions";
import {
  createCertificationSchema,
  certificationActionResultOutputSchema,
  type CreateCertificationInput,
  type CertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// createCertification — server action for the new certification form
// ---------------------------------------------------------------------------

/**
 * Create a new certification record for the current candidate.
 * Colocated route-level action that delegates to the module.
 */
export async function createCertification(
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
      "[candidate/certifications/new] createCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/certifications");
  }

  return result;
}

// Re-export types for client components
export type { CertificationActionResult };
