"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import crypto from "crypto";
import {
  listTicketsSchema,
  getTicketSchema,
  createTicketSchema,
  updateTicketStatusSchema,
  ticketItemSchema,
  listTicketsResultSchema,
  getTicketResultSchema,
  ticketDetailSchema,
  ticketActionResponseSchema,
} from "./schemas";
import type { ListTicketsInput, ListTicketsResult, TicketDetail } from "./schemas";

export async function listTickets(
  input: ListTicketsInput = {},
): Promise<ListTicketsResult> {
  await requireCapability("admin.read");
  const parsed = listTicketsSchema.safeParse(input);
  if (!parsed.success) {
    return { tickets: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
  const { page, limit, status, q } = parsed.data;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (status !== undefined) where.ticket_status = status;
  if (q && q.trim().length > 0) {
    where.OR = [{ ticket_detail: { contains: q.trim() } }];
  }
  const [rows, total] = await Promise.all([
    prisma.ticket.findMany({
      where: where as any,
      orderBy: { updated_at: "desc" },
      skip, take: limit,
      select: {
        ticket_uuid: true, ticket_detail: true, ticket_status: true, created_at: true,
        candidate: { select: { candidate_name: true } },
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.ticket.count({ where: where as any }),
  ]);
  const tickets = rows.map((row) => ({
    ticket_uuid: row.ticket_uuid,
    ticket_detail: row.ticket_detail,
    ticket_status: row.ticket_status,
    created_at: row.created_at,
    candidate_name: row.candidate?.candidate_name ?? null,
    staff_name: row.staff?.staff_name ?? null,
  }));
  const result = { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listTicketsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/tickets] listTickets output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function getTicket(
  ticketUuid: string,
): Promise<{ ticket: TicketDetail | null }> {
  await requireCapability("admin.read");
  const parsed = getTicketSchema.safeParse({ ticketUuid });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid ticket UUID");
  const row = await prisma.ticket.findUnique({
    where: { ticket_uuid: parsed.data.ticketUuid },
    select: {
      ticket_uuid: true, candidate_id: true, staff_id: true, ticket_detail: true,
      ticket_status: true, ticket_started_at: true, ticket_completed_at: true,
      response_time: true, resolution_time: true, created_at: true, updated_at: true,
      candidate: { select: { candidate_name: true } },
      staff: { select: { staff_name: true } },
    },
  });
  if (!row) {
    const result = { ticket: null };
    const outputParsed = getTicketResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tickets] getTicket output failed:", outputParsed.error.issues);
    }
    return result;
  }
  const detail: TicketDetail = {
    ticket_uuid: row.ticket_uuid, candidate_id: row.candidate_id, staff_id: row.staff_id,
    ticket_detail: row.ticket_detail, ticket_status: row.ticket_status,
    ticket_started_at: row.ticket_started_at, ticket_completed_at: row.ticket_completed_at,
    response_time: row.response_time, resolution_time: row.resolution_time,
    created_at: row.created_at, updated_at: row.updated_at,
    candidate_name: row.candidate?.candidate_name ?? null,
    staff_name: row.staff?.staff_name ?? null,
  };
  const result = { ticket: detail };
  const outputParsed = getTicketResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/tickets] getTicket output failed:", outputParsed.error.issues);
  }
  return result;
}

export async function createTicket(
  detail: string, candidateId?: number,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");
  const parsed = createTicketSchema.safeParse({ detail, candidateId });
  if (!parsed.success) {
    const result = { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
    const outputParsed = ticketActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tickets] createTicket output failed:", outputParsed.error.issues);
    }
    return result;
  }
  try {
    await prisma.ticket.create({
      data: {
        ticket_uuid: crypto.randomUUID(),
        ticket_detail: parsed.data.detail,
        ticket_status: 0,
        candidate_id: parsed.data.candidateId ?? null,
      },
    });
    revalidatePath("/admin/tickets");
    const result = { operation: "success", message: "Ticket created successfully" };
    const outputParsed = ticketActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tickets] createTicket output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem creating the ticket, please contact us for assistance." };
    const outputParsed = ticketActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tickets] createTicket output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function updateTicketStatus(
  ticketUuid: string, status: number,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");
  const parsed = updateTicketStatusSchema.safeParse({ ticketUuid, status });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.ticket.findUnique({ where: { ticket_uuid: parsed.data.ticketUuid }, select: { ticket_uuid: true } });
    if (!existing) return { operation: "error", message: "Ticket not found" };
    await prisma.ticket.update({
      where: { ticket_uuid: parsed.data.ticketUuid },
      data: { ticket_status: parsed.data.status },
    });
    revalidatePath("/admin/tickets");
    const result = { operation: "success", message: "Ticket status updated successfully" };
    const outputParsed = ticketActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tickets] updateTicketStatus output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem updating the ticket, please contact us for assistance." };
    const outputParsed = ticketActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/tickets] updateTicketStatus output failed:", outputParsed.error.issues);
    }
    return result;
  }
}
