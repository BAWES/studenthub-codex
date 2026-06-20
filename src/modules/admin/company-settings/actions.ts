"use server";

import { requireCapability } from "@/modules/auth/session";
import {
  list as listCompanySettings,
  get as getCompanySettings,
  update as updateCompanySettings,
} from "@/modules/company/company-settings/actions";
import type {
  AdminCompanySettingsListResult,
  AdminCompanySettingsItem,
  AdminCompanySettingsActionResponse,
} from "./schemas";
import {
  adminCompanySettingsListResultSchema,
  adminCompanySettingsActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Admin wrappers for company settings — adds admin capability checks
// ---------------------------------------------------------------------------

/**
 * List all company settings. Requires admin.read capability.
 */
export async function listAdminCompanySettings(): Promise<AdminCompanySettingsListResult> {
  await requireCapability("admin.read");

  const result = await listCompanySettings();

  // Validate output shape
  const outputParsed = adminCompanySettingsListResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/company-settings] listAdminCompanySettings output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result as AdminCompanySettingsListResult;
}

/**
 * Get a single company's settings by ID. Requires admin.read capability.
 */
export async function getAdminCompanySettings(
  companyId: number,
): Promise<AdminCompanySettingsItem | null> {
  await requireCapability("admin.read");

  const result = await getCompanySettings(companyId);
  return result as AdminCompanySettingsItem | null;
}

/**
 * Update a company's settings. Requires admin.write capability.
 */
export async function updateAdminCompanySettings(
  companyId: number,
  input: Record<string, unknown>,
): Promise<AdminCompanySettingsActionResponse> {
  await requireCapability("admin.write");

  const result = await updateCompanySettings(companyId, input);

  // Validate output shape
  const outputParsed = adminCompanySettingsActionResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/company-settings] updateAdminCompanySettings output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result as AdminCompanySettingsActionResponse;
}
