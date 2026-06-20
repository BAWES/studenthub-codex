import { describe, it, expect } from "vitest";
import {
  ticketItemSchema,
  listTicketsResultSchema,
  ticketDetailSchema,
  getTicketResultSchema,
  ticketActionResponseSchema,
  type TicketItem,
  type ListTicketsResult,
  type TicketDetail,
} from "./schemas";

// ---------------------------------------------------------------------------
// ticketItemSchema
// ---------------------------------------------------------------------------

function makeValidTicket(overrides: Partial<TicketItem> = {}): TicketItem {
  return {
    ticket_uuid: "ticket_abc123",
    ticket_detail: "Need help with my account",
    ticket_status: 0,
    created_at: new Date("2024-01-15T10:00:00Z"),
    candidate_name: "John Doe",
    staff_name: null,
    ...overrides,
  };
}

describe("ticketItemSchema", () => {
  it("parses a valid ticket item", () => {
    const item = makeValidTicket();
    const result = ticketItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const item = makeValidTicket({
      ticket_detail: null,
      ticket_status: null,
      created_at: null,
      candidate_name: null,
      staff_name: null,
    });
    const result = ticketItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts staff_name as a string", () => {
    const item = makeValidTicket({ staff_name: "Jane Staff" });
    const result = ticketItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing ticket_uuid", () => {
    const { ticket_uuid: _, ...rest } = makeValidTicket();
    const result = ticketItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-string ticket_uuid", () => {
    const result = ticketItemSchema.safeParse(
      makeValidTicket({ ticket_uuid: 123 as any }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string ticket_detail", () => {
    const result = ticketItemSchema.safeParse(
      makeValidTicket({ ticket_detail: 456 as any }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number ticket_status", () => {
    const result = ticketItemSchema.safeParse(
      makeValidTicket({ ticket_status: "open" as any }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    const result = ticketItemSchema.safeParse(
      makeValidTicket({ created_at: "yesterday" as any }),
    );
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTicketsResultSchema
// ---------------------------------------------------------------------------

describe("listTicketsResultSchema", () => {
  it("parses a valid list result with tickets", () => {
    const result: ListTicketsResult = {
      tickets: [
        makeValidTicket({ ticket_uuid: "ticket_001" }),
        makeValidTicket({ ticket_uuid: "ticket_002" }),
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    const parsed = listTicketsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("parses an empty list result", () => {
    const result: ListTicketsResult = {
      tickets: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTicketsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects negative total", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects zero page", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing tickets array", () => {
    const parsed = listTicketsResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-array tickets", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-integer total", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: [],
      total: 1.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid ticket items inside the array", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: [{ ticket_uuid: 123, ticket_detail: null, ticket_status: null, created_at: null, candidate_name: null, staff_name: null }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketDetailSchema
// ---------------------------------------------------------------------------

function makeValidTicketDetail(overrides: Partial<TicketDetail> = {}): TicketDetail {
  return {
    ticket_uuid: "ticket_full_001",
    candidate_id: 42,
    staff_id: null,
    ticket_detail: "Full ticket detail description",
    ticket_status: 0,
    ticket_started_at: new Date("2024-01-15T10:00:00Z"),
    ticket_completed_at: null,
    response_time: null,
    resolution_time: null,
    created_at: new Date("2024-01-15T10:00:00Z"),
    updated_at: new Date("2024-01-16T12:00:00Z"),
    candidate_name: "John Doe",
    staff_name: null,
    ...overrides,
  };
}

describe("ticketDetailSchema", () => {
  it("parses a valid full ticket detail", () => {
    const detail = makeValidTicketDetail();
    const result = ticketDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const detail = makeValidTicketDetail({
      candidate_id: null,
      staff_id: null,
      ticket_detail: null,
      ticket_status: null,
      ticket_started_at: null,
      ticket_completed_at: null,
      response_time: null,
      resolution_time: null,
      created_at: null,
      updated_at: null,
      candidate_name: null,
      staff_name: null,
    });
    const result = ticketDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("rejects missing ticket_uuid", () => {
    const { ticket_uuid: _, ...rest } = makeValidTicketDetail();
    const result = ticketDetailSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const result = ticketDetailSchema.safeParse(
      makeValidTicketDetail({ candidate_id: "abc" as any }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string ticket_detail", () => {
    const result = ticketDetailSchema.safeParse(
      makeValidTicketDetail({ ticket_detail: 456 as any }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number response_time", () => {
    const result = ticketDetailSchema.safeParse(
      makeValidTicketDetail({ response_time: "fast" as any }),
    );
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTicketResultSchema
// ---------------------------------------------------------------------------

describe("getTicketResultSchema", () => {
  it("parses a result with a valid ticket detail", () => {
    const result = {
      ticket: makeValidTicketDetail(),
    };
    const parsed = getTicketResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("parses a result with null ticket", () => {
    const result = { ticket: null };
    const parsed = getTicketResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing ticket key", () => {
    const parsed = getTicketResultSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it("rejects non-object ticket", () => {
    const parsed = getTicketResultSchema.safeParse({ ticket: "not-an-object" });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketActionResponseSchema
// ---------------------------------------------------------------------------

describe("ticketActionResponseSchema", () => {
  it("parses a success response", () => {
    const result = {
      operation: "createTicket",
      message: "Ticket created successfully",
    };
    const parsed = ticketActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("parses an error response", () => {
    const result = {
      operation: "updateTicketStatus",
      message: "Ticket not found",
    };
    const parsed = ticketActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const parsed = ticketActionResponseSchema.safeParse({ message: "Done" });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing message", () => {
    const parsed = ticketActionResponseSchema.safeParse({ operation: "createTicket" });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const parsed = ticketActionResponseSchema.safeParse({
      operation: 1,
      message: "Done",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const parsed = ticketActionResponseSchema.safeParse({
      operation: "createTicket",
      message: 42,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty string operation", () => {
    const parsed = ticketActionResponseSchema.safeParse({
      operation: "",
      message: "Done",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty string message", () => {
    const parsed = ticketActionResponseSchema.safeParse({
      operation: "createTicket",
      message: "",
    });
    expect(parsed.success).toBe(false);
  });
});
