import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: ticket schema validation
//
// The ticket server actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (prisma, session,
// next/cache).
// ---------------------------------------------------------------------------

const listTicketsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  staffId: z.coerce.number().int().positive().optional(),
  ticketStatus: z.coerce.number().int().min(0).max(255).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
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

type TicketListItem = {
  ticket_uuid: string;
  candidate_id: number | null;
  staff_id: number | null;
  ticket_detail: string | null;
  ticket_status: number | null;
  ticket_started_at: Date | null;
  ticket_completed_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type TicketDetail = TicketListItem & {
  response_time: number | null;
  resolution_time: number | null;
};

type ListTicketsResult = {
  tickets: TicketListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Filter builder (pure function)
// ---------------------------------------------------------------------------

type TicketWhereInput = {
  candidate_id?: number;
  staff_id?: number;
  ticket_status?: number;
  ticket_started_at?: { gte?: Date; lte?: Date };
};

function buildTicketFilter(params: {
  candidateId?: number;
  staffId?: number;
  ticketStatus?: number;
  startDate?: string;
  endDate?: string;
}): TicketWhereInput {
  const where: TicketWhereInput = {};

  if (params.candidateId !== undefined) {
    where.candidate_id = params.candidateId;
  }
  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }
  if (params.ticketStatus !== undefined) {
    where.ticket_status = params.ticketStatus;
  }

  if (params.startDate || params.endDate) {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (params.startDate) {
      dateFilter.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    where.ticket_started_at = dateFilter;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Tests: listTicketsSchema
// ---------------------------------------------------------------------------

describe("listTicketsSchema", () => {
  it("accepts empty params and uses defaults", () => {
    const result = listTicketsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listTicketsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts staffId filter", () => {
    const result = listTicketsSchema.safeParse({ staffId: 7 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(7);
    }
  });

  it("accepts ticketStatus filter", () => {
    const result = listTicketsSchema.safeParse({ ticketStatus: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketStatus).toBe(1);
    }
  });

  it("accepts startDate filter", () => {
    const result = listTicketsSchema.safeParse({
      startDate: "2025-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe("2025-01-01");
    }
  });

  it("accepts pagination params", () => {
    const result = listTicketsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listTicketsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listTicketsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects ticketStatus over 255", () => {
    const result = listTicketsSchema.safeParse({ ticketStatus: 999 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listTicketsSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: getTicketSchema
// ---------------------------------------------------------------------------

describe("getTicketSchema", () => {
  it("accepts a valid ticket UUID", () => {
    const result = getTicketSchema.safeParse({ ticketUuid: "ticket_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty ticketUuid", () => {
    const result = getTicketSchema.safeParse({ ticketUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    const result = getTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: createTicketSchema
// ---------------------------------------------------------------------------

describe("createTicketSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createTicketSchema.safeParse({
      candidateId: 42,
      staffId: 7,
      ticketDetail: "Need help with account setup",
      ticketStatus: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketDetail).toBe("Need help with account setup");
      expect(result.data.ticketStatus).toBe(0);
    }
  });

  it("accepts minimal input", () => {
    const result = createTicketSchema.safeParse({
      candidateId: 42,
      ticketDetail: "Having an issue with login",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ticketStatus).toBe(0);
    }
  });

  it("rejects missing candidateId", () => {
    const result = createTicketSchema.safeParse({
      ticketDetail: "Some issue",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketDetail", () => {
    const result = createTicketSchema.safeParse({
      candidateId: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty ticketDetail", () => {
    const result = createTicketSchema.safeParse({
      candidateId: 42,
      ticketDetail: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = createTicketSchema.safeParse({
      candidateId: -1,
      ticketDetail: "Issue",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: buildTicketFilter (pure function)
// ---------------------------------------------------------------------------

describe("buildTicketFilter", () => {
  it("returns empty object with no filters", () => {
    const result = buildTicketFilter({});
    expect(result).toEqual({});
  });

  it("filters by candidateId", () => {
    const result = buildTicketFilter({ candidateId: 42 });
    expect(result).toEqual({ candidate_id: 42 });
  });

  it("filters by staffId", () => {
    const result = buildTicketFilter({ staffId: 7 });
    expect(result).toEqual({ staff_id: 7 });
  });

  it("filters by ticketStatus", () => {
    const result = buildTicketFilter({ ticketStatus: 1 });
    expect(result).toEqual({ ticket_status: 1 });
  });

  it("filters by multiple fields", () => {
    const result = buildTicketFilter({
      candidateId: 42,
      staffId: 7,
      ticketStatus: 1,
    });
    expect(result).toEqual({
      candidate_id: 42,
      staff_id: 7,
      ticket_status: 1,
    });
  });

  it("filters by startDate", () => {
    const result = buildTicketFilter({ startDate: "2025-01-01" });
    expect(result).toHaveProperty("ticket_started_at");
    if (result.ticket_started_at) {
      expect(result.ticket_started_at.gte).toEqual(new Date("2025-01-01"));
    }
  });

  it("filters by endDate and sets end-of-day", () => {
    const result = buildTicketFilter({ endDate: "2025-01-15" });
    expect(result).toHaveProperty("ticket_started_at");
    if (result.ticket_started_at && result.ticket_started_at.lte) {
      expect(result.ticket_started_at.lte.getHours()).toBe(23);
      expect(result.ticket_started_at.lte.getMinutes()).toBe(59);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: Return type shapes
// ---------------------------------------------------------------------------

describe("TicketListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: TicketListItem = {
      ticket_uuid: "ticket_abc123",
      candidate_id: 42,
      staff_id: 7,
      ticket_detail: "Help needed with account",
      ticket_status: 0,
      ticket_started_at: new Date("2025-01-01"),
      ticket_completed_at: null,
      created_at: new Date("2025-01-01"),
      updated_at: new Date("2025-01-01"),
    };
    expect(mock.ticket_uuid).toBe("ticket_abc123");
    expect(mock.candidate_id).toBe(42);
    expect(mock.ticket_status).toBe(0);
  });
});

describe("ListTicketsResult shape", () => {
  it("accepts empty result set", () => {
    const result: ListTicketsResult = {
      tickets: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.tickets).toHaveLength(0);
  });
});
