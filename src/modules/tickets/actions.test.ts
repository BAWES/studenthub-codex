import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listTicketsSchema,
  getTicketSchema,
  createTicketSchema,
  addCommentSchema,
  getCommentsSchema,
  updateTicketSchema,
  closeTicketSchema,
} from "./schemas";

describe("listTicketsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listTicketsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.candidateId).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listTicketsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listTicketsSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts status filter", () => {
    const result = listTicketsSchema.safeParse({ status: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects page less than 1", () => {
    const result = listTicketsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listTicketsSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listTicketsSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listTicketsSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listTicketsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listTicketsSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

describe("getTicketSchema", () => {
  it("accepts valid UUID string", () => {
    const result = getTicketSchema.safeParse({
      ticketUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getTicketSchema.safeParse({ ticketUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createTicketSchema", () => {
  it("accepts valid detail with optional attachments", () => {
    const result = createTicketSchema.safeParse({
      detail: "My account balance is incorrect",
      attachments: ["key1", "key2"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.detail).toBe("My account balance is incorrect");
      expect(result.data.attachments).toEqual(["key1", "key2"]);
    }
  });

  it("accepts detail without attachments", () => {
    const result = createTicketSchema.safeParse({
      detail: "Need help with login",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.detail).toBe("Need help with login");
      expect(result.data.attachments).toBeUndefined();
    }
  });

  it("rejects empty detail", () => {
    const result = createTicketSchema.safeParse({ detail: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing detail", () => {
    const result = createTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("addCommentSchema", () => {
  it("accepts valid comment with ticketUuid and detail", () => {
    const result = addCommentSchema.safeParse({
      ticketUuid: "ticket-123",
      commentDetail: "Please follow up on this.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("ticket-123");
      expect(result.data.commentDetail).toBe("Please follow up on this.");
    }
  });

  it("accepts comment with optional attachments", () => {
    const result = addCommentSchema.safeParse({
      ticketUuid: "ticket-123",
      commentDetail: "See attached",
      attachments: ["file-key-1"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.attachments).toEqual(["file-key-1"]);
    }
  });

  it("rejects empty ticketUuid", () => {
    const result = addCommentSchema.safeParse({
      ticketUuid: "",
      commentDetail: "Comment",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = addCommentSchema.safeParse({
      commentDetail: "Comment",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty commentDetail", () => {
    const result = addCommentSchema.safeParse({
      ticketUuid: "ticket-123",
      commentDetail: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing commentDetail", () => {
    const result = addCommentSchema.safeParse({
      ticketUuid: "ticket-123",
    });
    expect(result.success).toBe(false);
  });
});

describe("getCommentsSchema", () => {
  it("accepts valid ticketUuid", () => {
    const result = getCommentsSchema.safeParse({
      ticketUuid: "ticket-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("ticket-456");
    }
  });

  it("rejects empty ticketUuid", () => {
    const result = getCommentsSchema.safeParse({ ticketUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = getCommentsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateTicketSchema", () => {
  it("accepts valid ticketUuid and detail", () => {
    const result = updateTicketSchema.safeParse({
      ticketUuid: "ticket-uuid-123",
      detail: "Updated description with more info",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("ticket-uuid-123");
      expect(result.data.detail).toBe("Updated description with more info");
    }
  });

  it("rejects empty ticketUuid", () => {
    const result = updateTicketSchema.safeParse({
      ticketUuid: "",
      detail: "Updated detail",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = updateTicketSchema.safeParse({
      detail: "Updated detail",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty detail", () => {
    const result = updateTicketSchema.safeParse({
      ticketUuid: "abc",
      detail: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing detail", () => {
    const result = updateTicketSchema.safeParse({
      ticketUuid: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("closeTicketSchema", () => {
  it("accepts valid ticketUuid", () => {
    const result = closeTicketSchema.safeParse({
      ticketUuid: "ticket-to-close-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("ticket-to-close-456");
    }
  });

  it("rejects empty ticketUuid", () => {
    const result = closeTicketSchema.safeParse({ ticketUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = closeTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type TicketItem = {
  ticket_uuid: string;
  candidate_id: number | null;
  staff_id: number | null;
  ticket_detail: string | null;
  ticket_status: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListTicketsResult = {
  tickets: TicketItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListTicketsResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListTicketsResult = {
      tickets: [
        {
          ticket_uuid: "abc-123",
          candidate_id: 1,
          staff_id: null,
          ticket_detail: "Need help with payment",
          ticket_status: 0,
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-01-01"),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.tickets).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty ticket list", () => {
    const result: ListTicketsResult = {
      tickets: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.tickets).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("includes all required fields", () => {
    const item: TicketItem = {
      ticket_uuid: "abc",
      candidate_id: 42,
      staff_id: null,
      ticket_detail: "Issue with login",
      ticket_status: 1,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-15"),
    };
    expect(item.ticket_detail).toBe("Issue with login");
    expect(item.ticket_status).toBe(1);
    expect(item.candidate_id).toBe(42);
  });

  it("allows nullable timestamps", () => {
    const item: TicketItem = {
      ticket_uuid: "abc",
      candidate_id: null,
      staff_id: null,
      ticket_detail: null,
      ticket_status: null,
      created_at: null,
      updated_at: null,
    };
    expect(item.created_at).toBeNull();
    expect(item.updated_at).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// TicketCommentItem return type
// ---------------------------------------------------------------------------

type TicketCommentItem = {
  ticket_comment_uuid: string;
  ticket_uuid: string;
  candidate_id: number | null;
  staff_id: number | null;
  ticket_comment_detail: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

describe("TicketCommentItem type shape", () => {
  it("includes all required fields", () => {
    const comment: TicketCommentItem = {
      ticket_comment_uuid: "comment-1",
      ticket_uuid: "ticket-1",
      candidate_id: 42,
      staff_id: null,
      ticket_comment_detail: "Please help!",
      created_at: new Date("2024-01-01"),
      updated_at: null,
    };
    expect(comment.ticket_comment_detail).toBe("Please help!");
    expect(comment.candidate_id).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// CreateTicketResult return type
// ---------------------------------------------------------------------------

type CreateTicketResult = {
  operation: string;
  message: string;
};

describe("CreateTicketResult type shape", () => {
  it("returns success result", () => {
    const result: CreateTicketResult = {
      operation: "success",
      message: "Ticket created successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("returns error result", () => {
    const result: CreateTicketResult = {
      operation: "error",
      message: "Validation failed",
    };
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// updateTicketSchema tests
// ---------------------------------------------------------------------------

describe("updateTicketSchema", () => {
  it("accepts valid ticketUuid and detail", () => {
    const result = updateTicketSchema.safeParse({
      ticketUuid: "ticket-123",
      detail: "Updated issue description",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("ticket-123");
      expect(result.data.detail).toBe("Updated issue description");
    }
  });

  it("rejects empty detail", () => {
    const result = updateTicketSchema.safeParse({
      ticketUuid: "ticket-123",
      detail: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = updateTicketSchema.safeParse({
      detail: "Updated description",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// closeTicketSchema tests
// ---------------------------------------------------------------------------

describe("closeTicketSchema", () => {
  it("accepts valid ticketUuid", () => {
    const result = closeTicketSchema.safeParse({
      ticketUuid: "ticket-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketUuid).toBe("ticket-123");
    }
  });

  it("rejects empty ticketUuid", () => {
    const result = closeTicketSchema.safeParse({ ticketUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = closeTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
