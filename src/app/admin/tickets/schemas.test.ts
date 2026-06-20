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

// ---------------------------------------------------------------------------
// listTicketsSchema
// ---------------------------------------------------------------------------
describe("listTicketsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listTicketsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listTicketsSchema.safeParse({ page: 2, limit: 50, status: 1, q: "urgent" }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listTicketsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listTicketsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listTicketsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(listTicketsSchema.safeParse({ status: "open" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTicketSchema
// ---------------------------------------------------------------------------
describe("getTicketSchema", () => {
  it("accepts valid input", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: "ticket-123" }).success).toBe(true);
  });

  it("rejects missing ticketUuid", () => {
    expect(getTicketSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty ticketUuid", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createTicketSchema
// ---------------------------------------------------------------------------
describe("createTicketSchema", () => {
  it("accepts minimal valid input", () => {
    expect(createTicketSchema.safeParse({ detail: "Issue description" }).success).toBe(true);
  });

  it("accepts input with candidateId", () => {
    expect(createTicketSchema.safeParse({ detail: "Issue", candidateId: 1 }).success).toBe(true);
  });

  it("rejects missing detail", () => {
    expect(createTicketSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty detail", () => {
    expect(createTicketSchema.safeParse({ detail: "" }).success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    expect(createTicketSchema.safeParse({ detail: "Issue", candidateId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTicketStatusSchema
// ---------------------------------------------------------------------------
describe("updateTicketStatusSchema", () => {
  it("accepts valid input", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "t-1", status: 2 }).success).toBe(true);
  });

  it("accepts zero status", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "t-1", status: 0 }).success).toBe(true);
  });

  it("rejects missing ticketUuid", () => {
    expect(updateTicketStatusSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects empty ticketUuid", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "", status: 1 }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "t-1" }).success).toBe(false);
  });

  it("rejects negative status", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "t-1", status: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketItemSchema (output)
// ---------------------------------------------------------------------------
describe("ticketItemSchema", () => {
  const validItem = {
    ticket_uuid: "ticket-1",
    ticket_detail: "Something broken",
    ticket_status: 1,
    created_at: new Date("2024-01-01"),
    candidate_name: "John Doe",
    staff_name: "Staff A",
  };

  it("accepts a valid item", () => {
    expect(ticketItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      ticketItemSchema.safeParse({
        ticket_uuid: "t-1",
        ticket_detail: null,
        ticket_status: null,
        created_at: null,
        candidate_name: null,
        staff_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing ticket_uuid", () => {
    const { ticket_uuid: _, ...rest } = validItem;
    expect(ticketItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty ticket_uuid", () => {
    expect(ticketItemSchema.safeParse({ ...validItem, ticket_uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for ticket_status", () => {
    expect(ticketItemSchema.safeParse({ ...validItem, ticket_status: "open" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTicketsResultSchema (output)
// ---------------------------------------------------------------------------
describe("listTicketsResultSchema", () => {
  const validResult = {
    tickets: [
      {
        ticket_uuid: "t-1",
        ticket_detail: null,
        ticket_status: null,
        created_at: null,
        candidate_name: null,
        staff_name: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listTicketsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty tickets array", () => {
    expect(
      listTicketsResultSchema.safeParse({ ...validResult, tickets: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing tickets", () => {
    const { tickets: _, ...rest } = validResult;
    expect(listTicketsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listTicketsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listTicketsResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(listTicketsResultSchema.safeParse({ ...validResult, limit: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listTicketsResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketDetailSchema (output)
// ---------------------------------------------------------------------------
describe("ticketDetailSchema", () => {
  const validDetail = {
    ticket_uuid: "t-1",
    candidate_id: 1,
    staff_id: 2,
    ticket_detail: "Details here",
    ticket_status: 1,
    ticket_started_at: new Date("2024-01-01"),
    ticket_completed_at: null,
    response_time: 3600,
    resolution_time: null,
    created_at: new Date("2024-01-01"),
    updated_at: null,
    candidate_name: "John",
    staff_name: "Staff",
  };

  it("accepts a valid detail", () => {
    expect(ticketDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      ticketDetailSchema.safeParse({
        ticket_uuid: "t-1",
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
      }).success,
    ).toBe(true);
  });

  it("rejects missing ticket_uuid", () => {
    const { ticket_uuid: _, ...rest } = validDetail;
    expect(ticketDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty ticket_uuid", () => {
    expect(ticketDetailSchema.safeParse({ ...validDetail, ticket_uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(ticketDetailSchema.safeParse({ ...validDetail, candidate_id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTicketResultSchema (output)
// ---------------------------------------------------------------------------
describe("getTicketResultSchema", () => {
  it("accepts valid ticket detail", () => {
    expect(
      getTicketResultSchema.safeParse({
        ticket: {
          ticket_uuid: "t-1",
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
        },
      }).success,
    ).toBe(true);
  });

  it("accepts null ticket", () => {
    expect(getTicketResultSchema.safeParse({ ticket: null }).success).toBe(true);
  });

  it("rejects missing ticket field", () => {
    expect(getTicketResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketActionResponseSchema (output)
// ---------------------------------------------------------------------------
describe("ticketActionResponseSchema", () => {
  it("accepts valid response", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "create", message: "Ticket created" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(ticketActionResponseSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "", message: "Done" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "create" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "create", message: "" }).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: 123, message: "Done" }).success).toBe(false);
  });
});
