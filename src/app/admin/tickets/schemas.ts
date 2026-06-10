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

export type ListTicketsInput = z.input<typeof listTicketsSchema>;
export type GetTicketInput = z.input<typeof getTicketSchema>;
export type CreateTicketInput = z.input<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.input<typeof updateTicketStatusSchema>;

export type TicketItem = {
  ticket_uuid: string;
  ticket_detail: string | null;
  ticket_status: number | null;
  created_at: Date | null;
  candidate_name: string | null;
  staff_name: string | null;
};

export type ListTicketsResult = {
  tickets: TicketItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TicketDetail = {
  ticket_uuid: string;
  candidate_id: number | null;
  staff_id: number | null;
  ticket_detail: string | null;
  ticket_status: number | null;
  ticket_started_at: Date | null;
  ticket_completed_at: Date | null;
  response_time: number | null;
  resolution_time: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  candidate_name: string | null;
  staff_name: string | null;
};
