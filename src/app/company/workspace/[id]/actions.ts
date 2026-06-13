"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/modules/auth/session";
import { getCompanyWorkspace, updateContactProfile as moduleUpdateContactProfile } from "@/modules/company/actions";
import {
  getWorkspaceSchema,
  updateWorkspaceSchema,
} from "./schemas";
import type {
  WorkspaceData,
  UpdateWorkspaceInput,
  UpdateWorkspaceResult,
} from "./schemas";

import {
  workspaceOverviewOutputSchema,
  updateWorkspaceResultSchema,
} from "../../schemas";

// ---------------------------------------------------------------------------
// Get Company Workspace
// ---------------------------------------------------------------------------

/**
 * Fetch the company workspace data for a given contact UUID.
 * Delegates to src/modules/company/actions.ts getCompanyWorkspace.
 * Called from company/workspace/[id] route.
 */
export async function getWorkspace(
  contactUuid: string,
): Promise<WorkspaceData> {
  await requireCapability("company.read");

  const parsed = getWorkspaceSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  const result: WorkspaceData = await getCompanyWorkspace(contactUuid) as WorkspaceData;

  // Validate output shape
  const validated = workspaceOverviewOutputSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[company/workspace] getWorkspace output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Update Workspace Settings
// ---------------------------------------------------------------------------

/**
 * Update the workspace settings (contact profile) for a contact.
 * Allows updating contact_name and/or contact_email.
 * Delegates to src/modules/company/actions.ts updateContactProfile.
 * Called from company/workspace/[id] route.
 */
export async function updateWorkspace(
  data: UpdateWorkspaceInput,
): Promise<UpdateWorkspaceResult> {
  await requireCapability("company.write.linked");

  const parsed = updateWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid workspace data");
  }

  await moduleUpdateContactProfile(parsed.data);

  revalidatePath("/company/workspace/[id]", "page");

  const result: UpdateWorkspaceResult = { contactUuid: parsed.data.contactUuid };

  // Validate output shape
  const validated = updateWorkspaceResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[company/workspace] updateWorkspace output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}
