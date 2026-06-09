"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listTicketsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  candidateId: z.coerce.number().int().positive().optional(),
  staffId: z.coerce.number().int().positive().optional(),
  ticketStatus: z.coerce.number().int().min(0).max(255).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const getTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
});

const createTicketSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  staffId: z.coerce.number().int().positive().optional(),
  ticketDetail: z.string().min(1, "Ticket detail is required"),
  ticketStatus: z.coerce.number().int().min(0).max(255).optional().default(0),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListTicketsParams = z.input<typeof listTicketsSchema>;
export type GetTicketParams = z.input<typeof getTicketSchema>;
export type CreateTicketParams = z.input<typeof createTicketSchema>;

export type TicketListItem = {
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
};

export type TicketDetail = TicketListItem;

export type ListTicketsResult = {
  tickets: TicketListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateTicketResult = {
  operation: "success" | "error";
  message: string;
  ticket?: TicketDetail;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List tickets with pagination and optional filters.
 * Mirrors the legacy Yii2 TicketController::actionList pattern.
 */
export async function listTickets(
  params: ListTicketsParams = {},
): Promise<ListTicketsResult> {
  await requireCapability("tickets.read");

  const parsed = listTicketsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const {
    page,
    limit,
    candidateId,
    staffId,
    ticketStatus,
    startDate,
    endDate,
  } = parsed.data;

  const where: Record<string, unknown> = {};

  if (candidateId !== undefined) where.candidate_id = candidateId;
  if (staffId !== undefined) where.staff_id = staffId;
  if (ticketStatus !== undefined) where.ticket_status = ticketStatus;

  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    where.ticket_started_at = dateFilter;
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        ticket_uuid: true,
        candidate_id: true,
        staff_id: true,
        ticket_detail: true,
        ticket_status: true,
        ticket_started_at: true,
        ticket_completed_at: true,
        response_time: true,
        resolution_time: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.ticket.count({ where: where as any }),
  ]);

  return {
    tickets: tickets as TicketListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single ticket by UUID.
 * Mirrors the legacy Yii2 TicketController::actionView pattern.
 */
export async function getTicket(
  params: GetTicketParams,
): Promise<TicketDetail | null> {
  await requireCapability("tickets.read");

  const parsed = getTicketSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid ticket UUID");
  }

  const { ticketUuid } = parsed.data;

  const ticket = await prisma.ticket.findFirst({
    where: { ticket_uuid: ticketUuid },
  });

  return ticket as TicketDetail | null;
}

/**
 * Create a new ticket.
 * Mirrors the legacy Yii2 TicketController::actionCreate pattern.
 */
export async function createTicket(
  params: CreateTicketParams,
): Promise<CreateTicketResult> {
  await requireCapability("tickets.create");

  const parsed = createTicketSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid create parameters",
    };
  }

  const { candidateId, staffId, ticketDetail, ticketStatus } = parsed.data;

  const ticket = await prisma.ticket.create({
    data: {
      ticket_uuid: crypto.randomUUID(),
      candidate_id: candidateId,
      staff_id: staffId ?? null,
      ticket_detail: ticketDetail,
      ticket_status: ticketStatus,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/tickets");

  return {
    operation: "success",
    message: "Ticket created successfully",
    ticket: ticket as TicketDetail,
  };
}
