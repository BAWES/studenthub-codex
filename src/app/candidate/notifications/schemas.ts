import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas for candidate/notifications actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const getCandidateNotificationRowsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(80),
});

export const getCandidateNotificationDetailSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

export const dismissNotificationSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

export const updateNotificationSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
  isNew: z.boolean().optional(),
});

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
// Action response schema (discriminated union — used by [id] actions)
// ---------------------------------------------------------------------------

export const successResponseSchema = z.object({
  success: z.literal(true),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const actionResponseSchema = z.discriminatedUnion("success", [
  successResponseSchema,
  errorResponseSchema,
]);
