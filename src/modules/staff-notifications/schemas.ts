import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffNotificationItemSchema = z.object({
  sn_uuid: z.string(),
  staff_id: z.number().int().nullable(),
  permission: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type StaffNotificationItem = z.output<typeof staffNotificationItemSchema>;

export const listStaffNotificationsResultSchema = z.object({
  notifications: z.array(staffNotificationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStaffNotificationsResult = z.output<typeof listStaffNotificationsResultSchema>;

export const markNotificationReadResultSchema = z.object({
  sn_uuid: z.string(),
  updated_at: z.string(),
});

export type MarkNotificationReadResult = z.output<typeof markNotificationReadResultSchema>;
