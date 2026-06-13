import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listTicketsSchema,
  getTicketSchema,
  createTicketSchema,
  updateTicketStatusSchema,
  ticketItemSchema,
  ticketDetailSchema,
  listTicketsResultSchema,
  getTicketResultSchema,
  ticketActionResponseSchema,
} from "./schemas";
import type { ListTicketsInput, CreateTicketInput } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
  mockUpdate,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

import {
  listTickets,
  getTicket,
  createTicket,
  updateTicketStatus,
} from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listTicketsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listTicketsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listTicketsSchema.safeParse({ page: 3, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(3);
  });

  it("coerces string page and limit", () => {
    const r = listTicketsSchema.safeParse({ page: "2", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(2);
  });

  it("rejects limit over 100", () => {
    expect(listTicketsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listTicketsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts optional status filter", () => {
    const r = listTicketsSchema.safeParse({ status: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe(1);
  });

  it("accepts optional search query", () => {
    const r = listTicketsSchema.safeParse({ q: "urgent" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.q).toBe("urgent");
  });

  it("coerces string status", () => {
    const r = listTicketsSchema.safeParse({ status: "0" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe(0);
  });
});

describe("getTicketSchema", () => {
  it("accepts valid ticketUuid", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: "abc-123" }).success).toBe(true);
  });

  it("rejects empty ticketUuid", () => {
    expect(getTicketSchema.safeParse({ ticketUuid: "" }).success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    expect(getTicketSchema.safeParse({}).success).toBe(false);
  });
});

describe("createTicketSchema", () => {
  it("accepts valid input with detail only", () => {
    const r = createTicketSchema.safeParse({ detail: "System down" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.detail).toBe("System down");
  });

  it("accepts detail with optional candidateId", () => {
    const r = createTicketSchema.safeParse({ detail: "User issue", candidateId: "42" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(42);
  });

  it("rejects empty detail", () => {
    expect(createTicketSchema.safeParse({ detail: "" }).success).toBe(false);
  });

  it("rejects missing detail", () => {
    expect(createTicketSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(createTicketSchema.safeParse({ detail: "Issue", candidateId: -1 }).success).toBe(false);
  });
});

describe("updateTicketStatusSchema", () => {
  it("accepts valid ticketUuid and status", () => {
    const r = updateTicketStatusSchema.safeParse({ ticketUuid: "abc-123", status: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe(1);
  });

  it("rejects empty ticketUuid", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "", status: 1 }).success).toBe(false);
  });

  it("rejects missing ticketUuid", () => {
    expect(updateTicketStatusSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects negative status", () => {
    expect(updateTicketStatusSchema.safeParse({ ticketUuid: "abc", status: -1 }).success).toBe(false);
  });

  it("coerces string status", () => {
    const r = updateTicketStatusSchema.safeParse({ ticketUuid: "abc", status: "2" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("ticketItemSchema", () => {
  it("accepts a valid ticket row", () => {
    const r = ticketItemSchema.safeParse({
      ticket_uuid: "abc-123",
      ticket_detail: "System is down",
      ticket_status: 0,
      created_at: new Date("2026-01-01"),
      candidate_name: "John Doe",
      staff_name: "Jane Smith",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = ticketItemSchema.safeParse({
      ticket_uuid: "abc-123",
      ticket_detail: null,
      ticket_status: null,
      created_at: null,
      candidate_name: null,
      staff_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing ticket_uuid", () => {
    const r = ticketItemSchema.safeParse({
      ticket_detail: "Issue",
      ticket_status: 0,
      created_at: new Date(),
      candidate_name: null,
      staff_name: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("listTicketsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listTicketsResultSchema.safeParse({
      tickets: [{
        ticket_uuid: "abc-123",
        ticket_detail: "Issue",
        ticket_status: 0,
        created_at: new Date(),
        candidate_name: null,
        staff_name: null,
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listTicketsResultSchema.safeParse({
      tickets: [], total: -1, page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const r = listTicketsResultSchema.safeParse({
      tickets: [], total: 0, page: 0, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("ticketActionResponseSchema", () => {
  it("accepts success response", () => {
    const r = ticketActionResponseSchema.safeParse({
      operation: "success",
      message: "Ticket created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = ticketActionResponseSchema.safeParse({
      operation: "error",
      message: "Ticket not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty operation", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "", message: "msg" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(ticketActionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — listTickets
// ---------------------------------------------------------------------------

describe("listTickets — runtime", () => {
  const MOCK_TICKETS = [
    {
      ticket_uuid: "abc-123",
      ticket_detail: "System down",
      ticket_status: 0,
      created_at: new Date("2026-01-01"),
      candidate: { candidate_name: "John Doe" },
      staff: { staff_name: "Jane Smith" },
    },
    {
      ticket_uuid: "def-456",
      ticket_detail: "Payment issue",
      ticket_status: 1,
      created_at: new Date("2026-02-01"),
      candidate: { candidate_name: "Alice" },
      staff: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(MOCK_TICKETS);
    mockCount.mockResolvedValue(2);
  });

  it("returns paginated ticket list", async () => {
    const result = await listTickets({});
    expect(result.tickets).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("calls requireCapability with admin.read", async () => {
    await listTickets({});
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries Prisma with default pagination", async () => {
    await listTickets({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it("applies status filter", async () => {
    await listTickets({ status: 1 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ticket_status: 1 }),
      }),
    );
  });

  it("applies search query", async () => {
    await listTickets({ q: "payment" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ ticket_detail: { contains: "payment" } }),
          ]),
        }),
      }),
    );
  });

  it("maps ticket to output format with candidate/staff names", async () => {
    const result = await listTickets({});
    expect(result.tickets[0].ticket_uuid).toBe("abc-123");
    expect(result.tickets[0].candidate_name).toBe("John Doe");
    expect(result.tickets[0].staff_name).toBe("Jane Smith");
    expect(result.tickets[1].staff_name).toBeNull();
  });

  it("returns empty result on invalid input", async () => {
    const result = await listTickets({ page: -1 });
    expect(result.tickets).toEqual([]);
    expect(result.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — getTicket
// ---------------------------------------------------------------------------

describe("getTicket — runtime", () => {
  const MOCK_TICKET = {
    ticket_uuid: "abc-123",
    candidate_id: 1,
    staff_id: 2,
    ticket_detail: "System down",
    ticket_status: 0,
    ticket_started_at: new Date("2026-01-01"),
    ticket_completed_at: null,
    response_time: 3600,
    resolution_time: null,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-02"),
    candidate: { candidate_name: "John Doe" },
    staff: { staff_name: "Jane Smith" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(MOCK_TICKET);
  });

  it("returns ticket detail with all fields", async () => {
    const result = await getTicket("abc-123");
    expect(result.ticket).not.toBeNull();
    expect(result.ticket!.ticket_uuid).toBe("abc-123");
    expect(result.ticket!.ticket_detail).toBe("System down");
    expect(result.ticket!.candidate_name).toBe("John Doe");
    expect(result.ticket!.staff_name).toBe("Jane Smith");
  });

  it("calls requireCapability with admin.read", async () => {
    await getTicket("abc-123");
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("returns null ticket when not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getTicket("nonexistent");
    expect(result.ticket).toBeNull();
  });

  it("throws on invalid input (empty uuid)", async () => {
    await expect(getTicket("")).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — createTicket
// ---------------------------------------------------------------------------

describe("createTicket — runtime", () => {
  const VALID_INPUT: CreateTicketInput = { detail: "System down" };
  const CREATED_ROW = { ticket_uuid: "new-uuid-789" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue(CREATED_ROW);
  });

  it("creates ticket and returns success", async () => {
    const result = await createTicket("System down");
    expect(result).toEqual({ operation: "success", message: "Ticket created successfully" });
  });

  it("creates ticket with candidateId", async () => {
    await createTicket("User issue", 42);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_id: 42,
          ticket_detail: "User issue",
        }),
      }),
    );
  });

  it("calls requireCapability with admin.write", async () => {
    await createTicket("System down");
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("re-validates /admin/tickets on success", async () => {
    await createTicket("System down");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/tickets");
  });

  it("returns error on validation failure (empty detail)", async () => {
    const result = await createTicket("");
    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("returns error on Prisma exception", async () => {
    mockCreate.mockRejectedValue(new Error("Duplicate entry"));
    const result = await createTicket("System down");
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — updateTicketStatus
// ---------------------------------------------------------------------------

describe("updateTicketStatus — runtime", () => {
  const EXISTING_TICKET = { ticket_uuid: "abc-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(EXISTING_TICKET);
    mockUpdate.mockResolvedValue({ ticket_uuid: "abc-123", ticket_status: 2 });
  });

  it("updates ticket status and returns success", async () => {
    const result = await updateTicketStatus("abc-123", 2);
    expect(result).toEqual({ operation: "success", message: "Ticket status updated successfully" });
  });

  it("calls requireCapability with admin.write", async () => {
    await updateTicketStatus("abc-123", 1);
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("checks ticket exists before update", async () => {
    await updateTicketStatus("abc-123", 1);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { ticket_uuid: "abc-123" }, select: { ticket_uuid: true } });
  });

  it("returns error when ticket not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await updateTicketStatus("nonexistent", 1);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("re-validates /admin/tickets on success", async () => {
    await updateTicketStatus("abc-123", 1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/tickets");
  });

  it("returns error on validation failure (empty uuid)", async () => {
    const result = await updateTicketStatus("", 1);
    expect(result.operation).toBe("error");
  });

  it("returns error on validation failure (negative status)", async () => {
    const result = await updateTicketStatus("abc-123", -1);
    expect(result.operation).toBe("error");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("DB error"));
    const result = await updateTicketStatus("abc-123", 1);
    expect(result.operation).toBe("error");
  });
});
