"use server";

// ---------------------------------------------------------------------------
// Candidate Agencies — server actions for the list/create page
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/agencies for
// listing agencies, getting a single agency, creating, and deleting.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listAgencies as moduleListAgencies,
  createAgency as moduleCreateAgency,
} from "@/modules/candidates/agencies/actions";
import {
  listAgenciesSchema,
  createAgencySchema,
  listAgenciesResultOutputSchema,
  agencyActionResultOutputSchema,
} from "./schemas";
import type {
  ListAgenciesInput,
  CreateAgencyInput,
  AgencyItem,
  AgencyActionResult,
} from "./schemas";

// Re-export types for client components
export type { AgencyActionResult, AgencyItem };

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List agency records (paginated, searchable).
 * Delegates to modules/candidates/agencies.
 */
export async function listAgencies(
  input: ListAgenciesInput = {},
): Promise<{ items: AgencyItem[]; total: number }> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listAgenciesSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid agencies list params",
    );
  }

  const { page, limit, search } = parsed.data;
  const result = await moduleListAgencies({ page, limit, search });

  const listResult = { items: result.items, total: result.total };

  // Validate output shape
  const listOutputParsed = listAgenciesResultOutputSchema.safeParse(listResult);
  if (!listOutputParsed.success) {
    console.error(
      "[candidate/agencies] listAgencies output validation failed:",
      listOutputParsed.error.issues,
    );
  }

  return listResult;
}

/**
 * Create a new agency (company).
 * Requires candidate.profile.edit capability.
 */
export async function createAgency(
  data: CreateAgencyInput,
): Promise<AgencyActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createAgencySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid agency data",
    };
  }

  const result = await moduleCreateAgency({
    companyName: parsed.data.companyName,
    companyEmail: parsed.data.companyEmail,
    companyWebsite: parsed.data.companyWebsite,
    commercialLicence: parsed.data.commercialLicence,
  });

  revalidatePath("/candidate/agencies");

  // Validate output shape
  const createOutputParsed = agencyActionResultOutputSchema.safeParse(result);
  if (!createOutputParsed.success) {
    console.error(
      "[candidate/agencies] createAgency output validation failed:",
      createOutputParsed.error.issues,
    );
  }

  return result;
}
