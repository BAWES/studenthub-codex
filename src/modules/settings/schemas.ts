import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listSettingsSchema = z.object({
  code: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getSettingSchema = z.object({
  settingUuid: z.string().min(1, "Setting UUID is required"),
});

export const updateSettingSchema = z.object({
  settingUuid: z.string().min(1, "Setting UUID is required"),
  value: z.string().nullable(),
});

// Input types
export type ListSettingsInput = z.input<typeof listSettingsSchema>;
export type GetSettingInput = z.input<typeof getSettingSchema>;
export type UpdateSettingInput = z.input<typeof updateSettingSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const settingItemSchema = z.object({
  setting_uuid: z.string(),
  code: z.string(),
  key: z.string(),
  value: z.string().nullable(),
  serialized: z.boolean(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
});

export const listSettingsResultSchema = z.object({
  settings: z.array(settingItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const updateSettingResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

// Output types
export type SettingItem = z.output<typeof settingItemSchema>;
export type ListSettingsResult = z.output<typeof listSettingsResultSchema>;
export type UpdateSettingResult = z.output<typeof updateSettingResultSchema>;
