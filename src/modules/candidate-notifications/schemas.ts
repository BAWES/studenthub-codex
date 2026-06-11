import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/candidate-notifications actions
// ---------------------------------------------------------------------------

export const listCandidateNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  appealUuid: z.string().optional(),
});
export const getCandidateNotificationSchema = z.object({
  cnUuid: z.string().min(1, "Notification UUID is required"),
});
export const createNotificationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  type: z.number().int().min(0).max(255, "Type must be 0–255"),
  message: z.string().min(1, "Message is required").max(500, "Message too long"),
});
export type ListCandidateNotificationsInput = z.input<
  typeof listCandidateNotificationsSchema
>;
export type CandidateNotificationItem = {
  cn_uuid: string;
  type: number;
  message: string | null;
  is_new: boolean | null;
  appeal_uuid: string | null;
  created_at: string | null;
};
export type CandidateNotificationDetail = CandidateNotificationItem | null;
export type ListCandidateNotificationsResult = {
  notifications: CandidateNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type CreateNotificationInput = z.input<typeof createNotificationSchema>;
export type CreateNotificationResult =
  | { success: true; notificationUuid: string }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const candidateNotificationItemSchema = z.object({
  cn_uuid: z.string(),
  type: z.number().int(),
  message: z.string().nullable(),
  is_new: z.boolean().nullable(),
  appeal_uuid: z.string().nullable(),
  created_at: z.string().nullable(),
});

export type CandidateNotificationItemSchema = z.output<
  typeof candidateNotificationItemSchema
>;

export const listCandidateNotificationsResultSchema = z.object({
  notifications: z.array(candidateNotificationItemSchema),
  total: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListCandidateNotificationsResultSchema = z.output<
  typeof listCandidateNotificationsResultSchema
>;

export const createNotificationResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), notificationUuid: z.string() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type CreateNotificationResultSchema = z.output<
  typeof createNotificationResultSchema
>;

export const markNotificationReadResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type MarkNotificationReadResultSchema = z.output<
  typeof markNotificationReadResultSchema
>;
