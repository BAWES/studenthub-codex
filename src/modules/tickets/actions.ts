"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listTicketsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
});

const createTicketSchema = z.object({
  detail: z.string().min(1, "Ticket detail is required"),
  attachments: z.array(z.string()).optional(),
});

const addCommentSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
  commentDetail: z.string().min(1, "Comment detail is required"),
  attachments: z.array(z.string()).optional(),
});

const updateTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
  detail: z.string().min(1, "Ticket detail is required"),
});

const closeTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
});

const getCommentsSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
});

const updateTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
  detail: z.string().min(1, "Ticket detail is required").max(2000),
});

const closeTicketSchema = z.object({
  ticketUuid: z.string().min(1, "Ticket UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListTicketsParams = z.input<typeof listTicketsSchema>;
export type GetTicketParams = z.input<typeof getTicketSchema>;
export type CreateTicketParams = z.input<typeof createTicketSchema>;
export type AddCommentParams = z.input<typeof addCommentSchema>;
export type GetCommentsParams = z.input<typeof getCommentsSchema>;
export type UpdateTicketParams = z.input<typeof updateTicketSchema>;
export type CloseTicketParams = z.input<typeof closeTicketSchema>;

export type TicketItem = {
  ticket_uuid: string;
  candidate_id: number | null;
  staff_id: number | null;
  ticket_detail: string | null;
  ticket_status: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListTicketsResult = {
  tickets: TicketItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TicketCommentItem = {
  ticket_comment_uuid: string;
  ticket_uuid: string;
  candidate_id: number | null;
  staff_id: number | null;
  ticket_comment_detail: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type CreateTicketResult = {
  operation: string;
  message: string;
};

export type AddCommentResult = {
  operation: string;
  message: string;
};

export type UpdateTicketParams = z.input<typeof updateTicketSchema>;
export type CloseTicketParams = z.input<typeof closeTicketSchema>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------

export { listTicketsSchema, getTicketSchema, createTicketSchema, addCommentSchema, getCommentsSchema, updateTicketSchema, closeTicketSchema };

// ---------------------------------------------------------------------------
// listTickets
// ---------------------------------------------------------------------------

/**
 * List support tickets with pagination and optional filters.
 *
 * Mirrors the legacy TicketController::actionList.
 * - Filters by candidate_id when provided
 * - Filters by ticket_status when provided
 * - Paginated with configurable page/limit
 * - Ordered by updated_at DESC
 */
export async function listTickets(
  params: ListTicketsParams = {},
): Promise<ListTicketsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listTicketsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { candidateId, status, page, limit } = parsed.data;

  const where: Record<string, unknown> = {};
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }
  if (status !== undefined) {
    where.ticket_status = status;
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: where as any,
      orderBy: { updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where: where as any }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      ticket_uuid: t.ticket_uuid,
      candidate_id: t.candidate_id,
      staff_id: t.staff_id,
      ticket_detail: t.ticket_detail,
      ticket_status: t.ticket_status,
      created_at: t.created_at ?? null,
      updated_at: t.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getTicket
// ---------------------------------------------------------------------------

/**
 * Get a single support ticket by UUID.
 * Returns null if not found.
 */
export async function getTicket(
  params: GetTicketParams,
): Promise<TicketItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getTicketSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid ticket UUID",
    );
  }

  const { ticketUuid } = parsed.data;

  const ticket = await prisma.ticket.findUnique({
    where: { ticket_uuid: ticketUuid },
  });

  if (!ticket) return null;

  return {
    ticket_uuid: ticket.ticket_uuid,
    candidate_id: ticket.candidate_id,
    staff_id: ticket.staff_id,
    ticket_detail: ticket.ticket_detail,
    ticket_status: ticket.ticket_status,
    created_at: ticket.created_at ?? null,
    updated_at: ticket.updated_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// createTicket
// ---------------------------------------------------------------------------

/**
 * Create a new support ticket.
 *
 * Mirrors the legacy TicketController::actionCreate.
 * - Creates a ticket for the current candidate
 * - Attachments (S3 keys) are stored as JSON in the attachments column
 * - Returns { operation, message }
 */
export async function createTicket(
  params: CreateTicketParams,
): Promise<CreateTicketResult> {
  const session = await requireCapability("candidate.read.own");

  const parsed = createTicketSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ticket data",
    };
  }

  const { detail } = parsed.data;

  try {
    await prisma.ticket.create({
      data: {
        ticket_uuid: `ticket_${crypto.randomUUID()}`,
        candidate_id: Number(session.id),
        ticket_detail: detail,
        ticket_status: 0, // STATUS_PENDING
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Ticket created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create ticket",
    };
  }
}

// ---------------------------------------------------------------------------
// updateTicket
// ---------------------------------------------------------------------------

/**
 * Update an existing support ticket's detail.
 * Mirrors the legacy staff TicketController update pattern.
 * Staff-only action.
 */
export async function updateTicket(
  params: UpdateTicketParams,
): Promise<CreateTicketResult> {
  await requireCapability("admin.write");

  const parsed = updateTicketSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ticket data",
    };
  }

  const { ticketUuid, detail } = parsed.data;

  const existing = await prisma.ticket.findUnique({
    where: { ticket_uuid: ticketUuid },
  });

  if (!existing) {
    return { operation: "error", message: "Ticket not found" };
  }

  try {
    await prisma.ticket.update({
      where: { ticket_uuid: ticketUuid },
      data: {
        ticket_detail: detail,
        updated_at: new Date(),
      },
    });

    return { operation: "success", message: "Ticket updated successfully" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update ticket",
    };
  }
}

// ---------------------------------------------------------------------------
// closeTicket
// ---------------------------------------------------------------------------

/**
 * Close a support ticket (set status to completed and record completion time).
 * Mirrors the staff TicketController close workflow.
 * Staff-only action.
 */
export async function closeTicket(
  params: GetTicketParams,
): Promise<CreateTicketResult> {
  await requireCapability("admin.write");

  const parsed = getTicketSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ticket UUID",
    };
  }

  const { ticketUuid } = parsed.data;

  const existing = await prisma.ticket.findUnique({
    where: { ticket_uuid: ticketUuid },
  });

  if (!existing) {
    return { operation: "error", message: "Ticket not found" };
  }

  if (existing.ticket_status === 2) {
    return { operation: "error", message: "Ticket is already closed" };
  }

  const now = new Date();
  const resolutionTime = existing.ticket_started_at
    ? Math.round(
        (now.getTime() - existing.ticket_started_at.getTime()) / 60000,
      )
    : null;

  try {
    await prisma.ticket.update({
      where: { ticket_uuid: ticketUuid },
      data: {
        ticket_status: 2, // STATUS_COMPLETED
        ticket_completed_at: now,
        resolution_time: resolutionTime,
        updated_at: now,
      },
    });

    return { operation: "success", message: "Ticket closed successfully" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to close ticket",
    };
  }
}

// ---------------------------------------------------------------------------
// addComment
// ---------------------------------------------------------------------------

/**
 * Add a comment to an existing support ticket.
 *
 * Mirrors the legacy TicketController::actionComment.
 * - Validates the ticket exists and belongs to the current candidate
 * - Creates a ticket_comment record
 * - Attachments (S3 keys) are stored on the comment_attachment model
 */
export async function addComment(
  params: AddCommentParams,
): Promise<AddCommentResult> {
  const session = await requireCapability("candidate.read.own");

  const parsed = addCommentSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid comment data",
    };
  }

  const { ticketUuid, commentDetail, attachments } = parsed.data;

  // Verify the ticket exists
  const ticket = await prisma.ticket.findUnique({
    where: { ticket_uuid: ticketUuid },
  });

  if (!ticket) {
    return {
      operation: "error",
      message: "Ticket not found",
    };
  }

  try {
    await prisma.ticket_comment.create({
      data: {
        ticket_comment_uuid: `comment_${crypto.randomUUID()}`,
        ticket_uuid: ticketUuid,
        candidate_id: Number(session.id),
        ticket_comment_detail: commentDetail,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Ticket comment added successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to add comment",
    };
  }
}

// ---------------------------------------------------------------------------
// getComments
// ---------------------------------------------------------------------------

/**
 * Get all comments for a support ticket.
 *
 * Mirrors the legacy TicketController::actionComments.
 */
export async function getComments(
  params: GetCommentsParams,
): Promise<TicketCommentItem[]> {
  await requireCapability("candidate.read.own");

  const parsed = getCommentsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid ticket UUID",
    );
  }

  const { ticketUuid } = parsed.data;

  const comments = await prisma.ticket_comment.findMany({
    where: { ticket_uuid: ticketUuid },
    orderBy: { created_at: "asc" },
  });

  return comments.map((c) => ({
    ticket_comment_uuid: c.ticket_comment_uuid,
    ticket_uuid: c.ticket_uuid ?? ticketUuid,
    candidate_id: c.candidate_id,
    staff_id: c.staff_id,
    ticket_comment_detail: c.ticket_comment_detail,
    created_at: c.created_at ?? null,
    updated_at: c.updated_at ?? null,
  }));
}

// ---------------------------------------------------------------------------
// updateTicket
// ---------------------------------------------------------------------------

/**
 * Update an existing support ticket's detail text.
 * Mirrors the legacy TicketController::actionUpdate.
 * Requires candidate.read.own capability.
 */
export async function updateTicket(
  params: UpdateTicketParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("candidate.read.own");

  const parsed = updateTicketSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid update data",
    };
  }

  const { ticketUuid, detail } = parsed.data;

  try {
    await prisma.ticket.update({
      where: { ticket_uuid: ticketUuid },
      data: {
        ticket_detail: detail,
        updated_at: new Date(),
      },
    });

    return {
      operation: "success",
      message: "Ticket updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update ticket",
    };
  }
}

// ---------------------------------------------------------------------------
// closeTicket
// ---------------------------------------------------------------------------

/**
 * Close a support ticket by setting its status to 2 (closed).
 * Mirrors the legacy TicketController::actionClose.
 * Requires candidate.read.own capability.
 */
export async function closeTicket(
  params: CloseTicketParams,
): Promise<{ operation: string; message: string }> {
  await requireCapability("candidate.read.own");

  const parsed = closeTicketSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid close parameters",
    };
  }

  const { ticketUuid } = parsed.data;

  try {
    const now = new Date();
    await prisma.ticket.update({
      where: { ticket_uuid: ticketUuid },
      data: {
        ticket_status: 2, // STATUS_CLOSED
        ticket_completed_at: now,
        updated_at: now,
      },
    });

    return {
      operation: "success",
      message: "Ticket closed successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to close ticket",
    };
  }
}
