import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const notificationRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  typeCode: z.number(),
  message: z.string(),
  isNew: z.string(),
  created: z.string(),
});

export const notificationRowArraySchema = z.array(notificationRowSchema);

export const notificationDetailNotificationSchema = z.object({
  cn_uuid: z.string(),
  type: z.number(),
  message: z.string().nullable(),
  is_new: z.boolean().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  invitation_uuid: z.string().nullable(),
  request_uuid: z.string().nullable(),
  company_id: z.number().int().nullable(),
  store_id: z.number().int().nullable(),
  staff_id: z.number().int().nullable(),
});

export const notificationDetailSchema = z.object({
  notification: notificationDetailNotificationSchema.nullable(),
  typeLabel: z.string(),
});

export const dismissResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const updateResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type NotificationRow = z.output<typeof notificationRowSchema>;
export type NotificationDetail = z.output<typeof notificationDetailSchema>;
export type DismissResult = z.output<typeof dismissResultSchema>;
export type UpdateResult = z.output<typeof updateResultSchema>;
