import { describe, it, expect } from "vitest";
import {
  listTicketsSchema,
  getTicketSchema,
  createTicketSchema,
  updateTicketStatusSchema,
  ticketItemSchema,
  listTicketsResultSchema,
  ticketDetailSchema,
  getTicketResultSchema,
  ticketActionResponseSchema,
} from "./schemas";

/**
 * Page migration test for admin/tickets.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin tickets page — data contract", () => {
  it("listTicketsSchema parses with defaults", () => {
    const r = listTicketsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listTicketsSchema accepts filters", () => {
    const r = listTicketsSchema.safeParse({ status: 1, q: "login" });
    expect(r.success).toBe(true);
  });

  it("getTicketSchema validates with ticketUuid", () => {
    const r = getTicketSchema.safeParse({ ticketUuid: "tkt-001" });
    expect(r.success).toBe(true);
  });

  it("getTicketSchema rejects missing ticketUuid", () => {
    const r = getTicketSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createTicketSchema validates with detail", () => {
    const r = createTicketSchema.safeParse({
      detail: "Cannot access reports page",
    });
    expect(r.success).toBe(true);
  });

  it("createTicketSchema accepts optional candidateId", () => {
    const r = createTicketSchema.safeParse({
      detail: "Issue with application",
      candidateId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("createTicketSchema rejects missing detail", () => {
    const r = createTicketSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateTicketStatusSchema validates with ticketUuid and status number", () => {
    const r = updateTicketStatusSchema.safeParse({
      ticketUuid: "tkt-001",
      status: 2,
    });
    expect(r.success).toBe(true);
  });

  it("updateTicketStatusSchema rejects negative status", () => {
    const r = updateTicketStatusSchema.safeParse({
      ticketUuid: "tkt-001",
      status: -1,
    });
    expect(r.success).toBe(false);
  });

  it("ticketItemSchema validates a ticket list entry", () => {
    const r = ticketItemSchema.safeParse({
      ticket_uuid: "tkt-001",
      ticket_detail: "Issue with login",
      ticket_status: 1,
      created_at: new Date("2026-06-14"),
      candidate_name: "Ahmed",
      staff_name: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.ticket_uuid).toBe("tkt-001");
    }
  });

  it("listTicketsResultSchema validates paginated result", () => {
    const r = listTicketsResultSchema.safeParse({
      tickets: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("ticketDetailSchema validates full detail", () => {
    const r = ticketDetailSchema.safeParse({
      ticket_uuid: "tkt-001",
      candidate_id: 42,
      staff_id: 7,
      ticket_detail: "Issue description",
      ticket_status: 2,
      ticket_started_at: new Date("2026-06-14"),
      ticket_completed_at: null,
      response_time: null,
      resolution_time: null,
      created_at: new Date("2026-06-14"),
      updated_at: null,
      candidate_name: "Ahmed",
      staff_name: "Staff User",
    });
    expect(r.success).toBe(true);
  });

  it("getTicketResultSchema validates nullable ticket detail", () => {
    const r = getTicketResultSchema.safeParse({ ticket: null });
    expect(r.success).toBe(true);
  });

  it("ticketActionResponseSchema validates action result", () => {
    const r = ticketActionResponseSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(r.success).toBe(true);
  });
});
