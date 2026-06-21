import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas for notifications module
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

/**
 * Schema for a single notification row returned by getCandidateNotificationRows.
 */
export const notificationRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  typeCode: z.number(),
  message: z.string(),
  isNew: z.enum(["Unread", "Read"]),
  created: z.string(),
});

/**
 * Schema for the notification detail nested object.
 */
export const notificationDetailNotificationSchema = z.object({
  cn_uuid: z.string(),
  type: z.number(),
  message: z.string().nullable(),
  is_new: z.boolean().nullable(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
  invitation_uuid: z.string().nullable(),
  request_uuid: z.string().nullable(),
  company_id: z.number().int().nullable(),
  store_id: z.number().int().nullable(),
  staff_id: z.number().int().nullable(),
});

/**
 * Schema for the getCandidateNotificationDetail response.
 */
export const notificationDetailSchema = z.object({
  notification: notificationDetailNotificationSchema.nullable(),
  typeLabel: z.string(),
});

/**
 * Schema for action results (dismissNotification, updateNotification).
 */
export const notificationActionResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
