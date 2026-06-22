import { describe, it, expect } from "vitest";
import { listTicketsSchema, getTicketSchema, createTicketSchema, updateTicketStatusSchema } from "./schemas";
import type { TicketItem, ListTicketsResult, TicketDetail } from "./schemas";

describe("listTicketsSchema", () => {
  it("accepts empty params", () => { const r = listTicketsSchema.safeParse({}); expect(r.success).toBe(true); if (r.success) { expect(r.data.page).toBe(1); expect(r.data.limit).toBe(20); } });
  it("accepts full params", () => {
    const r = listTicketsSchema.safeParse({ page: 2, limit: 50, status: 1, q: "support" });
    expect(r.success).toBe(true);
    if (r.success) { expect(r.data.page).toBe(2); expect(r.data.limit).toBe(50); expect(r.data.status).toBe(1); expect(r.data.q).toBe("support"); }
  });
  it("rejects limit over 100", () => expect(listTicketsSchema.safeParse({ limit: 999 }).success).toBe(false));
  it("rejects negative page", () => expect(listTicketsSchema.safeParse({ page: -1 }).success).toBe(false));
  it("accepts status filter without q", () => expect(listTicketsSchema.safeParse({ status: 2 }).success).toBe(true));
  it("accepts search without status", () => { const r = listTicketsSchema.safeParse({ q: "urgent" }); expect(r.success).toBe(true); });
});

describe("getTicketSchema", () => {
  it("accepts valid ticket_uuid", () => expect(getTicketSchema.safeParse({ ticketUuid: "ABC" }).success).toBe(true));
  it("rejects empty uuid", () => expect(getTicketSchema.safeParse({ ticketUuid: "" }).success).toBe(false));
  it("rejects missing uuid", () => expect(getTicketSchema.safeParse({}).success).toBe(false));
});

describe("createTicketSchema", () => {
  it("accepts valid params", () => {
    const r = createTicketSchema.safeParse({ detail: "Help", candidateId: 42 });
    expect(r.success).toBe(true);
  });
  it("rejects missing detail", () => expect(createTicketSchema.safeParse({ candidateId: 1 }).success).toBe(false));
  it("rejects empty detail", () => expect(createTicketSchema.safeParse({ detail: "", candidateId: 1 }).success).toBe(false));
});

describe("updateTicketStatusSchema", () => {
  it("accepts valid update", () => expect(updateTicketStatusSchema.safeParse({ ticketUuid: "ABC", status: 1 }).success).toBe(true));
  it("rejects missing uuid", () => expect(updateTicketStatusSchema.safeParse({ status: 2 }).success).toBe(false));
  it("rejects missing status", () => expect(updateTicketStatusSchema.safeParse({ ticketUuid: "ABC" }).success).toBe(false));
  it("rejects negative status", () => expect(updateTicketStatusSchema.safeParse({ ticketUuid: "ABC", status: -1 }).success).toBe(false));
});

describe("TicketItem type", () => {
  it("has required shape", () => {
    const item: TicketItem = { ticket_uuid: "ABC", ticket_detail: "detail", ticket_status: 0, created_at: new Date(), candidate_name: "John", staff_name: null };
    expect(item.ticket_uuid).toBe("ABC");
  });
  it("accepts nulls", () => {
    const item: TicketItem = { ticket_uuid: "DEF", ticket_detail: null, ticket_status: null, created_at: null, candidate_name: null, staff_name: null };
    expect(item.ticket_uuid).toBe("DEF");
  });
});

describe("ListTicketsResult", () => {
  it("has correct shape", () => { const r: ListTicketsResult = { tickets: [], total: 0, page: 1, limit: 20, totalPages: 0 }; expect(r.tickets).toHaveLength(0); });
});

describe("TicketDetail type", () => {
  it("has correct shape", () => {
    const d: TicketDetail = { ticket_uuid: "ABC", candidate_id: 42, staff_id: null, ticket_detail: "text", ticket_status: 0, ticket_started_at: null, ticket_completed_at: null, response_time: null, resolution_time: null, created_at: new Date(), updated_at: null, candidate_name: "Jane", staff_name: null };
    expect(d.ticket_uuid).toBe("ABC");
  });
});
