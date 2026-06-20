// ---------------------------------------------------------------------------
// Admin Settings — Zod schemas
// ---------------------------------------------------------------------------
// Ported from Yii2 setting model: code + key = unique KV store per namespace.
// ---------------------------------------------------------------------------

import { z } from "zod";

// ── Setting model ──

export const settingSchema = z.object({
  setting_uuid: z.string(),
  code: z.string().max(128),
  key: z.string().max(128),
  value: z.string().nullable(),
  serialized: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type SettingRow = z.infer<typeof settingSchema>;

// ── List ──

export const listSettingsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
});

export type ListSettingsInput = z.input<typeof listSettingsSchema>;

export const settingListResponseSchema = z.object({
  items: z.array(settingSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type SettingListResponse = z.infer<typeof settingListResponseSchema>;

// ── Get single ──

export const getSettingSchema = z.object({
  setting_uuid: z.string().min(1, "Setting UUID is required"),
});

export type GetSettingInput = z.input<typeof getSettingSchema>;

export const settingDetailSchema = settingSchema;

export type SettingDetail = z.infer<typeof settingDetailSchema>;

// ── Create ──

export const createSettingSchema = z.object({
  code: z.string().min(1).max(128),
  key: z.string().min(1).max(128),
  value: z.string().optional().default(""),
  serialized: z.boolean().optional().default(false),
});

export type CreateSettingInput = z.input<typeof createSettingSchema>;

// ── Update ──

export const updateSettingSchema = z.object({
  setting_uuid: z.string().min(1),
  code: z.string().min(1).max(128).optional(),
  key: z.string().min(1).max(128).optional(),
  value: z.string().optional(),
  serialized: z.boolean().optional(),
});

export type UpdateSettingInput = z.input<typeof updateSettingSchema>;

// ── Delete ──

export const deleteSettingSchema = z.object({
  setting_uuid: z.string().min(1),
});

export type DeleteSettingInput = z.input<typeof deleteSettingSchema>;

// ── Action response ──

export const settingActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  setting: settingSchema.optional(),
});

export type SettingActionResponse = z.infer<typeof settingActionResponseSchema>;
