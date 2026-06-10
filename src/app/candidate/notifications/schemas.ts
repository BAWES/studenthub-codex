import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/notifications actions
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
