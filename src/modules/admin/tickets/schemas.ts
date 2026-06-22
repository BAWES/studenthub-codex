import { z } from "zod";

export const listTicketsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.coerce.number().int().optional(),
  q: z.string().optional(),
});

export const getTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
});

export const createTicketSchema = z.object({
  detail: z.string().min(1, "Ticket detail is required"),
  candidateId: z.coerce.number().int().positive().optional(),
});

export const updateTicketStatusSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be >= 0"),
});

export const ticketItemSchema = z.object({
  ticket_uuid: z.string().min(1),
  ticket_detail: z.string().nullable(),
  ticket_status: z.number().int().nullable(),
  created_at: z.date().nullable(),
  candidate_name: z.string().nullable(),
  staff_name: z.string().nullable(),
});

export const listTicketsResultSchema = z.object({
  tickets: z.array(ticketItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const ticketDetailSchema = z.object({
  ticket_uuid: z.string().min(1),
  candidate_id: z.number().int().nullable(),
  staff_id: z.number().int().nullable(),
  ticket_detail: z.string().nullable(),
  ticket_status: z.number().int().nullable(),
  ticket_started_at: z.date().nullable(),
  ticket_completed_at: z.date().nullable(),
  response_time: z.number().int().nullable(),
  resolution_time: z.number().int().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  candidate_name: z.string().nullable(),
  staff_name: z.string().nullable(),
});

export const getTicketResultSchema = z.object({
  ticket: ticketDetailSchema.nullable(),
});

export const ticketActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListTicketsInput = z.input<typeof listTicketsSchema>;
export type GetTicketInput = z.input<typeof getTicketSchema>;
export type CreateTicketInput = z.input<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.input<typeof updateTicketStatusSchema>;

// Output types derived from Zod schemas
export type TicketItem = z.output<typeof ticketItemSchema>;
export type ListTicketsResult = z.output<typeof listTicketsResultSchema>;
export type TicketDetail = z.output<typeof ticketDetailSchema>;
