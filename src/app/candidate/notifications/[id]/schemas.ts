import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/notifications/[id] actions
// ---------------------------------------------------------------------------

export const getNotificationSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

export const markAsReadSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

export const deleteNotificationSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

export type GetNotificationParams = z.input<typeof getNotificationSchema>;
export type MarkAsReadParams = z.input<typeof markAsReadSchema>;
export type DeleteNotificationParams = z.input<typeof deleteNotificationSchema>;

export type ActionResponse =
  | { success: true }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Output validation schemas
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
