"use server";

// ---------------------------------------------------------------------------
// Candidate Certification Create — colocated server action for the
// candidate/certifications/new route
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { createCertificationSchema } from "./schemas";
import {
  certificationActionResultOutputSchema,
  type CreateCertificationInput,
  type CertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// createCertification — server action for the new certification form
// ---------------------------------------------------------------------------

/**
 * Create a new certification record for the current candidate.
 * Colocated route-level action that wraps the shared parent logic.
 */
export async function createCertification(
  data: CreateCertificationInput,
): Promise<CertificationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createCertificationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid certification data",
    };
  }

  const now = new Date();

  const row = await prisma.candidate_certification.create({
    data: {
      candidate_id: Number(session.id),
      certification_name: parsed.data.certificationName,
      issuing_organization: parsed.data.issuingOrganization,
      issue_date: parsed.data.issueDate
        ? new Date(parsed.data.issueDate)
        : null,
      expiry_date: parsed.data.expiryDate
        ? new Date(parsed.data.expiryDate)
        : null,
      credential_id: parsed.data.credentialId ?? null,
      credential_url: parsed.data.credentialUrl || null,
      description: parsed.data.description ?? null,
      deleted: 0,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/certifications");

  const actionResult = { success: true as const, certificationId: row.certification_id };

  // Validate output shape
  const outputParsed = certificationActionResultOutputSchema.safeParse(actionResult);
  if (!outputParsed.success) {
    console.error(
      "[candidate/certifications/new] createCertification output validation failed:",
      outputParsed.error.issues,
    );
  }

  return actionResult;
}

// Re-export types for client components
export type { CertificationActionResult };
