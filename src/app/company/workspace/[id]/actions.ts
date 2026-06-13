"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/modules/auth/session";
import {
  findContactByUuid,
  getCompanyLinksForWorkspace,
  getWorkspaceStatsTx,
  updateContactByUuid,
} from "@/modules/company/workspace/actions";
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
 * Calls module-level raw Prisma wrappers, then formats + validates output.
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

  // 1. Fetch raw data via module-level Prisma wrappers
  const contact = await findContactByUuid(contactUuid);
  const companyLinks = await getCompanyLinksForWorkspace(contactUuid);

  const companyIds = companyLinks
    .map((link) => link.company?.company_id)
    .filter((id): id is number => Boolean(id));

  const [requests, stores, notes, recentRequests] = companyIds.length > 0
    ? await getWorkspaceStatsTx(companyIds)
    : [0, 0, 0, []] as const;

  // 2. Format as WorkspaceData
  const result: WorkspaceData = {
    contact: contact
      ? { contact_name: contact.contact_name, contact_email: contact.contact_email ?? "" }
      : null,
    metrics: [
      { label: "Companies", value: companyIds.length, note: "Companies linked to this contact" },
      { label: "Requests", value: requests as number, note: "Hiring requests across linked companies" },
      { label: "Stores", value: stores as number, note: "Active stores in the account" },
      { label: "Notes", value: notes as number, note: "Internal/customer notes connected to account" },
    ],
    companies: companyLinks.map((link) => ({
      id: link.company_contact_uuid,
      title: link.company?.company_name ?? "Unknown company",
      subtitle: link.contact_position ?? "Contact",
      meta: link.allow_access ? "Access allowed" : "Access disabled",
    })),
    requests: (recentRequests as any[]).map((request: any) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats`,
    })),
  };

  // 3. Validate output shape
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
 * Calls module-level updateContactByUuid.
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

  const { contactUuid, contact_name, contact_email } = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (contact_name !== undefined) updateData.contact_name = contact_name;
  if (contact_email !== undefined) updateData.contact_email = contact_email;

  if (Object.keys(updateData).length > 0) {
    updateData.contact_updated_at = new Date();
    await updateContactByUuid(contactUuid, updateData);
  }

  revalidatePath("/company/workspace/[id]", "page");

  const result: UpdateWorkspaceResult = { contactUuid };

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
