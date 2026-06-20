import { z } from "zod";

export const listSettingsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const settingItemSchema = z.object({
  setting_uuid: z.string().min(1),
  code: z.string().nullable(),
  key: z.string().nullable(),
  value: z.string().nullable(),
  serialized: z.boolean().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listSettingsResultSchema = z.object({
  settings: z.array(settingItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListSettingsInput = z.input<typeof listSettingsSchema>;
export type SettingItem = z.output<typeof settingItemSchema>;
export type ListSettingsResult = z.output<typeof listSettingsResultSchema>;
