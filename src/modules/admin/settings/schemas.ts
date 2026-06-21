import { z } from "zod";

export const settingSchema = z.object({
  setting_uuid: z.string().min(1),
  code: z.string().min(1),
  key: z.string().min(1),
  value: z.string().nullable(),
  serialized: z.boolean().default(false),
});

export type Setting = z.infer<typeof settingSchema>;

export const settingsListResultSchema = z.object({
  records: z.array(settingSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(200),
  totalPages: z.number().int().min(0),
});

export const settingUpdateSchema = z.object({
  value: z.string().min(1, "Value is required"),
  serialized: z.boolean().optional(),
});

export type SettingUpdate = z.infer<typeof settingUpdateSchema>;
