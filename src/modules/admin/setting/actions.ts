// ---------------------------------------------------------------------------
// Admin Setting — server actions
// All business logic lives in src/modules/settings/actions.ts (which has
// "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// Also adds admin-specific wrappers (updateSettingAction, deleteSettingAction)
// that match the {operation, message} API contract used by admin components.
// ---------------------------------------------------------------------------

export {
  listSettings,
  getSetting,
  createSetting,
} from "@/modules/settings/actions";

// Re-export types
export type {
  ListSettingsInput,
  GetSettingInput,
  CreateSettingInput,
  DeleteSettingInput,
  SettingItem,
  ListSettingsResult,
  UpdateSettingResult,
} from "@/modules/settings/schemas";

import { updateSetting, deleteSetting as deleteSettingFull, getSetting } from "@/modules/settings/actions";
import type { UpdateSettingInput, DeleteSettingInput, UpdateSettingResult, GetSettingInput } from "@/modules/settings/schemas";

import { getSettingSchema } from "./schemas";

// Re-export with original names for compatibility with admin detail forms
export { updateSetting };
const deleteSetting = deleteSettingFull;
export { deleteSetting };

/**
 * Get a setting by UUID — wraps getSetting for admin detail page compatibility.
 */
export async function getSettingDetail(id: string) {
  const parsed = getSettingSchema.safeParse({ settingUuid: id });
  if (!parsed.success) return null;
  return getSetting(parsed.data);
}

/**
 * Update a setting's value.
 * Delegates to src/modules/settings/actions.ts updateSetting.
 * Returns {operation, message} matching the admin component contract.
 */
export async function updateSettingAction(
  params: UpdateSettingInput,
): Promise<UpdateSettingResult> {
  return updateSetting(params);
}

/**
 * Delete a setting by UUID.
 * Delegates to src/modules/settings/actions.ts deleteSetting.
 * Returns {operation, message} matching the admin component contract.
 */
export async function deleteSettingAction(
  params: DeleteSettingInput,
): Promise<UpdateSettingResult> {
  return deleteSettingFull(params);
}
