// ---------------------------------------------------------------------------
// Admin Setting — schemas
// Delegates to the full settings module, adding admin-specific additions.
// ---------------------------------------------------------------------------

export {
  listSettingsSchema,
  getSettingSchema,
  createSettingSchema,
  deleteSettingSchema,
  settingItemSchema,
  listSettingsResultSchema,
  updateSettingResultSchema,
} from "@/modules/settings/schemas";

export type {
  ListSettingsInput,
  GetSettingInput,
  CreateSettingInput,
  DeleteSettingInput,
  SettingItem,
  ListSettingsResult,
  UpdateSettingResult,
} from "@/modules/settings/schemas";
