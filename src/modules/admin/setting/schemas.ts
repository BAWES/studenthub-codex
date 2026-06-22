// ---------------------------------------------------------------------------
// Admin Setting — schemas
// Delegates to the full settings module, adding admin-specific additions.
// ---------------------------------------------------------------------------

export {
  listSettingsSchema,
  createSettingSchema,
  deleteSettingSchema,
  settingItemSchema,
  listSettingsResultSchema,
  updateSettingResultSchema,
} from "@/modules/settings/schemas";

export type {
  ListSettingsInput,
  CreateSettingInput,
  DeleteSettingInput,
  SettingItem,
  ListSettingsResult,
  UpdateSettingResult,
} from "@/modules/settings/schemas";
