import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const ticketItemSchema = z.object({
  ticket_uuid: z.string(),
  candidate_id: z.number().nullable(),
  staff_id: z.number().nullable(),
  ticket_detail: z.string().nullable(),
  ticket_status: z.number().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type TicketItem = z.output<typeof ticketItemSchema>;

export const listTicketsResultSchema = z.object({
  tickets: z.array(ticketItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListTicketsResult = z.output<typeof listTicketsResultSchema>;

export const ticketCommentItemSchema = z.object({
  ticket_comment_uuid: z.string(),
  ticket_uuid: z.string(),
  candidate_id: z.number().nullable(),
  staff_id: z.number().nullable(),
  ticket_comment_detail: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type TicketCommentItem = z.output<typeof ticketCommentItemSchema>;

export const ticketActionResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type TicketActionResult = z.output<typeof ticketActionResultSchema>;
