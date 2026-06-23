import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  ticketItemSchema,
  listTicketsResultSchema,
  ticketCommentItemSchema,
  ticketActionResultSchema,
  type TicketItem,
  type ListTicketsResult,
  type TicketCommentItem,
  type TicketActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// ticketItemSchema
// ---------------------------------------------------------------------------

function makeValidTicket(overrides: Partial<TicketItem> = {}): TicketItem {
  return {
    ticket_uuid: "ticket_abc123",
    candidate_id: 42,
    staff_id: null,
    ticket_detail: "Need help with my account",
    ticket_status: 0,
    created_at: new Date("2024-01-15T10:00:00Z"),
    updated_at: new Date("2024-06-01T12:00:00Z"),
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
      candidate_id: null,
      staff_id: null,
      ticket_detail: null,
      ticket_status: null,
      created_at: null,
      updated_at: null,
    });
    const result = ticketItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts candidate_id and staff_id as numbers", () => {
    const item = makeValidTicket({ candidate_id: 7, staff_id: 3 });
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

  it("rejects limit exceeding max", () => {
    const parsed = listTicketsResultSchema.safeParse({
      tickets: [],
      total: 0,
      page: 1,
      limit: 200,
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
      tickets: [{
        ticket_uuid: 123,
        candidate_id: null,
        staff_id: null,
        ticket_detail: null,
        ticket_status: null,
        created_at: null,
        updated_at: null,
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketCommentItemSchema
// ---------------------------------------------------------------------------

function makeValidComment(
  overrides: Partial<TicketCommentItem> = {},
): TicketCommentItem {
  return {
    ticket_comment_uuid: "comment_def456",
    ticket_uuid: "ticket_abc123",
    candidate_id: 42,
    staff_id: null,
    ticket_comment_detail: "Thanks for the help!",
    created_at: new Date("2024-02-10T14:30:00Z"),
    updated_at: new Date("2024-02-10T14:30:00Z"),
    ...overrides,
  };
}

describe("ticketCommentItemSchema", () => {
  it("parses a valid comment item", () => {
    const item = makeValidComment();
    const result = ticketCommentItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const item = makeValidComment({
      candidate_id: null,
      staff_id: null,
      ticket_comment_detail: null,
      created_at: null,
      updated_at: null,
    });
    const result = ticketCommentItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing ticket_comment_uuid", () => {
    const { ticket_comment_uuid: _, ...rest } = makeValidComment();
    const result = ticketCommentItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-string ticket_comment_detail", () => {
    const result = ticketCommentItemSchema.safeParse(
      makeValidComment({ ticket_comment_detail: 123 as any }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const result = ticketCommentItemSchema.safeParse(
      makeValidComment({ candidate_id: "abc" as any }),
    );
    expect(result.success).toBe(false);
  });

  it("validates an array of comments via z.array()", () => {
    const comments = [
      makeValidComment({ ticket_comment_uuid: "c1" }),
      makeValidComment({ ticket_comment_uuid: "c2" }),
    ];
    const parsed = z.array(ticketCommentItemSchema).safeParse(comments);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toHaveLength(2);
    }
  });

  it("rejects an array containing invalid comment items", () => {
    const comments = [
      makeValidComment({ ticket_comment_uuid: "c1" }),
      {
        ticket_comment_uuid: 123,
        ticket_uuid: "t_1",
        candidate_id: null,
        staff_id: null,
        ticket_comment_detail: null,
        created_at: null,
        updated_at: null,
      },
    ];
    const parsed = z.array(ticketCommentItemSchema).safeParse(comments);
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ticketActionResultSchema
// ---------------------------------------------------------------------------

describe("ticketActionResultSchema", () => {
  it("parses a success result", () => {
    const result: TicketActionResult = {
      operation: "success",
      message: "Ticket created successfully",
    };
    const parsed = ticketActionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("parses an error result", () => {
    const result: TicketActionResult = {
      operation: "error",
      message: "Ticket not found",
    };
    const parsed = ticketActionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const parsed = ticketActionResultSchema.safeParse({ message: "Done" });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing message", () => {
    const parsed = ticketActionResultSchema.safeParse({
      operation: "success",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const parsed = ticketActionResultSchema.safeParse({
      operation: 1,
      message: "Done",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const parsed = ticketActionResultSchema.safeParse({
      operation: "error",
      message: 42,
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts any valid string for operation (not just known values)", () => {
    const parsed = ticketActionResultSchema.safeParse({
      operation: "unknown_action",
      message: "Something happened",
    });
    expect(parsed.success).toBe(true);
  });
});
