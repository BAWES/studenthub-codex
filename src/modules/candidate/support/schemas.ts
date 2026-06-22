import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Support — output validation schemas
// ---------------------------------------------------------------------------

export const supportTicketStatusSchema = z.enum(["open", "in-progress", "resolved", "closed", "reopened"]);
export type SupportTicketStatus = z.output<typeof supportTicketStatusSchema>;

export const supportTicketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type SupportTicketPriority = z.output<typeof supportTicketPrioritySchema>;

export const supportTicketCategorySchema = z.enum([
  "account", "application", "document", "payment", "profile", "technical", "other",
]);
export type SupportTicketCategory = z.output<typeof supportTicketCategorySchema>;

export const supportMessageSchema = z.object({
  message_uuid: z.string(),
  sender_name: z.string(),
  message: z.string(),
  is_staff: z.boolean(),
  created_at: z.string(),
});
export type SupportMessage = z.output<typeof supportMessageSchema>;

export const supportTicketItemSchema = z.object({
  ticket_uuid: z.string(),
  subject: z.string(),
  category: supportTicketCategorySchema,
  status: supportTicketStatusSchema,
  priority: supportTicketPrioritySchema,
  last_message_preview: z.string().nullable(),
  unread_count: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SupportTicketItem = z.output<typeof supportTicketItemSchema>;

export const listSupportTicketsResultSchema = z.object({
  tickets: z.array(supportTicketItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListSupportTicketsResult = z.output<typeof listSupportTicketsResultSchema>;

export const supportTicketActionResultSchema = z.object({
  success: z.boolean(),
  ticket_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type SupportTicketActionResult = z.output<typeof supportTicketActionResultSchema>;

export const supportTicketDetailSchema = z.object({
  ticket_uuid: z.string(),
  subject: z.string(),
  category: supportTicketCategorySchema,
  status: supportTicketStatusSchema,
  priority: supportTicketPrioritySchema,
  messages: z.array(supportMessageSchema),
  candidate_name: z.string(),
  candidate_email: z.string(),
  assigned_to: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_at: z.string().nullable(),
});
export type SupportTicketDetail = z.output<typeof supportTicketDetailSchema>;
