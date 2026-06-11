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

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const settingItemSchema = z.object({
  setting_uuid: z.string().min(1),
  code: z.string().min(1),
  key: z.string().min(1),
  value: z.string().nullable(),
  serialized: z.boolean(),
  created_at: z.nullable(
    z.union([z.string(), z.date()]).transform((v) => (v instanceof Date ? v.toISOString() : v)),
  ),
  updated_at: z.nullable(
    z.union([z.string(), z.date()]).transform((v) => (v instanceof Date ? v.toISOString() : v)),
  ),
});

export const listSettingsResultSchema = z.object({
  settings: z.array(settingItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const updateSettingResultSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});
