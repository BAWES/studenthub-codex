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
} from "../schemas";

// ---------------------------------------------------------------------------
// listTicketsSchema
// ---------------------------------------------------------------------------
describe("listTicketsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listTicketsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listTicketsSchema.safeParse({ page: 2, limit: 50, status: 10, q: "bug" }).success,
    ).toBe(true);
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

  it("rejects non-integer status", () => {
    expect(listTicketsSchema.safeParse({ status: "active" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTicketSchema
// ---------------------------------------------------------------------------
describe("getTicketSchema", () => {
  it("accepts valid input", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: "tkt-123" }).success).toBe(true);
  });

  it("rejects missing ticketUuid", () => {
    expect(getTicketSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty ticketUuid", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: "" }).success).toBe(false);
  });

  it("rejects non-string ticketUuid", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createTicketSchema
// ---------------------------------------------------------------------------
describe("createTicketSchema", () => {
  it("accepts minimal input", () => {
    expect(createTicketSchema.safeParse({ detail: "Server down" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createTicketSchema.safeParse({ detail: "Server down", candidateId: 42 }).success,
    ).toBe(true);
  });

  it("rejects missing detail", () => {
    expect(createTicketSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty detail", () => {
    expect(createTicketSchema.safeParse({ detail: "" }).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(
      createTicketSchema.safeParse({ detail: "Issue", candidateId: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(
      createTicketSchema.safeParse({ detail: "Issue", candidateId: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTicketStatusSchema
// ---------------------------------------------------------------------------
describe("updateTicketStatusSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateTicketStatusSchema.safeParse({ ticketUuid: "tkt-1", status: 10 }).success,
    ).toBe(true);
  });

  it("rejects missing ticketUuid", () => {
    expect(updateTicketStatusSchema.safeParse({ status: 10 }).success).toBe(false);
  });

  it("rejects empty ticketUuid", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "", status: 10 }).success).toBe(false);
  });

  it("rejects negative status", () => {
    expect(
      updateTicketStatusSchema.safeParse({ ticketUuid: "tkt-1", status: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketItemSchema
// ---------------------------------------------------------------------------
describe("ticketItemSchema", () => {
  const validItem = {
    ticket_uuid: "tkt-1",
    ticket_detail: "Server issue",
    ticket_status: 10,
    created_at: new Date("2026-06-01"),
    candidate_name: "Ahmed",
    staff_name: "Staff 1",
  };

  it("accepts a valid ticket item", () => {
    expect(ticketItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      ticketItemSchema.safeParse({
        ...validItem,
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
// listTicketsResultSchema
// ---------------------------------------------------------------------------
describe("listTicketsResultSchema", () => {
  const validResult = {
    tickets: [
      {
        ticket_uuid: "tkt-1",
        ticket_detail: "Issue",
        ticket_status: 10,
        created_at: new Date(),
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
      listTicketsResultSchema.safeParse({ ...validResult, tickets: [], total: 0, totalPages: 0 })
        .success,
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
});

// ---------------------------------------------------------------------------
// ticketDetailSchema
// ---------------------------------------------------------------------------
describe("ticketDetailSchema", () => {
  const validDetail = {
    ticket_uuid: "tkt-1",
    candidate_id: 42,
    staff_id: 1,
    ticket_detail: "Detailed issue description",
    ticket_status: 10,
    ticket_started_at: new Date("2026-06-01"),
    ticket_completed_at: null,
    response_time: 3600,
    resolution_time: null,
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-02"),
    candidate_name: "Ahmed",
    staff_name: "Staff 1",
  };

  it("accepts a valid ticket detail", () => {
    expect(ticketDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      ticketDetailSchema.safeParse({
        ...validDetail,
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

  it("strips extra fields", () => {
    const result = ticketDetailSchema.parse({ ...validDetail, extra_field: "should strip" });
    expect((result as any).extra_field).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getTicketResultSchema
// ---------------------------------------------------------------------------
describe("getTicketResultSchema", () => {
  it("accepts a valid ticket", () => {
    const result = getTicketResultSchema.safeParse({
      ticket: {
        ticket_uuid: "tkt-1",
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
    });
    expect(result.success).toBe(true);
  });

  it("accepts null ticket", () => {
    expect(getTicketResultSchema.safeParse({ ticket: null }).success).toBe(true);
  });

  it("rejects missing ticket", () => {
    expect(getTicketResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketActionResponseSchema
// ---------------------------------------------------------------------------
describe("ticketActionResponseSchema", () => {
  it("accepts a valid response", () => {
    expect(
      ticketActionResponseSchema.safeParse({ operation: "success", message: "Done" }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(ticketActionResponseSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(
      ticketActionResponseSchema.safeParse({ operation: "", message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      ticketActionResponseSchema.safeParse({ operation: "success", message: "" }).success,
    ).toBe(false);
  });
});
