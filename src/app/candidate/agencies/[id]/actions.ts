"use server";

// ---------------------------------------------------------------------------
// Candidate Agency [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/agencies for
// viewing, editing, and deleting a single agency entry.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getAgency as moduleGetAgency,
  updateAgency as moduleUpdateAgency,
  deleteAgency as moduleDeleteAgency,
} from "@/modules/candidates/agencies/actions";
import {
  getAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  type AgencyItem,
  type AgencyActionResult,
} from "../schemas";

// ---------------------------------------------------------------------------
// getAgency
// ---------------------------------------------------------------------------

/**
 * Get a single agency (company) by ID.
 * Delegates to modules/candidates/agencies.
 */
export async function getAgency(
  companyId: number,
): Promise<AgencyItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getAgencySchema.safeParse({ companyId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid company ID",
    );
  }

  return moduleGetAgency({ companyId: parsed.data.companyId });
}

// ---------------------------------------------------------------------------
// updateAgency
// ---------------------------------------------------------------------------

/**
 * Update an existing agency (company).
 * Delegates to modules/candidates/agencies.
 */
export async function updateAgency(
  data: Record<string, unknown>,
): Promise<AgencyActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateAgencySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid agency data",
    };
  }

  const result = await moduleUpdateAgency({
    companyId: parsed.data.companyId,
    companyName: parsed.data.companyName,
    companyEmail: parsed.data.companyEmail,
    companyWebsite: parsed.data.companyWebsite,
    commercialLicence: parsed.data.commercialLicence,
  });

  revalidatePath("/candidate/agencies");
  return result;
}

// ---------------------------------------------------------------------------
// deleteAgency
// ---------------------------------------------------------------------------

/**
 * Soft-delete an agency (company) by ID.
 * Delegates to modules/candidates/agencies.
 */
export async function deleteAgency(
  companyId: number,
): Promise<AgencyActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteAgencySchema.safeParse({ companyId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid company ID",
    };
  }

  const result = await moduleDeleteAgency({ companyId: parsed.data.companyId });

  revalidatePath("/candidate/agencies");
  return result;
}
