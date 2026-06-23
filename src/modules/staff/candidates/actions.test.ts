import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listCandidatesSchema,
  getCandidateByIdSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
} from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockRevalidatePath, mockFindMany, mockCount, mockFindFirst } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindFirst: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
    },
  },
}));

import { listCandidates, getCandidateById } from "./actions";
import type { CandidateRow, CandidateDetail, ListCandidatesResult } from "./schemas";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listCandidatesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCandidatesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidatesSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts search query", () => {
    const result = listCandidatesSchema.safeParse({ q: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
    }
  });

  it("accepts status filter", () => {
    const result = listCandidatesSchema.safeParse({ status: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("1");
    }
  });

  it("accepts empty status", () => {
    const result = listCandidatesSchema.safeParse({ status: "" });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listCandidatesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidatesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCandidatesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listCandidatesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("coerces string limit to number", () => {
    const result = listCandidatesSchema.safeParse({ limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });
});

describe("getCandidateByIdSchema", () => {
  it("accepts a valid numeric candidate ID", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("coerces string ID to number", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(99);
    }
  });

  it("rejects missing candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects undefined candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: undefined });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("candidateRowOutputSchema", () => {
  it("accepts a valid candidate row", () => {
    const row: CandidateRow = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+96550000000",
      status: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    const result = candidateRowOutputSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("accepts nullable phone", () => {
    const row: CandidateRow = {
      id: 2,
      name: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      status: 2,
      createdAt: "2025-01-02T00:00:00.000Z",
    };
    const result = candidateRowOutputSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = candidateRowOutputSchema.safeParse({
      id: 1,
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const result = candidateRowOutputSchema.safeParse({
      id: 1,
      name: "Test",
      email: "test@example.com",
      phone: null,
      status: "active",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("candidateListOutputSchema", () => {
  it("accepts a valid list result", () => {
    const result: ListCandidatesResult = {
      items: [
        { id: 1, name: "A", email: "a@b.com", phone: null, status: 1, createdAt: "2025-01-01T00:00:00.000Z" },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const parsed = candidateListOutputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const result: ListCandidatesResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = candidateListOutputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array items", () => {
    const result = {
      items: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = candidateListOutputSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = candidateListOutputSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

describe("candidateDetailOutputSchema", () => {
  it("accepts a valid candidate detail", () => {
    const detail: CandidateDetail = {
      id: 1,
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+96550000000",
      gender: 1,
      objective: "Seeking new opportunities",
      status: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-15T00:00:00.000Z",
    };
    const result = candidateDetailOutputSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts null gender", () => {
    const detail: CandidateDetail = {
      id: 2,
      name: "Jane Doe",
      nameAr: "جين دو",
      email: "jane@example.com",
      phone: null,
      gender: null,
      objective: null,
      status: 2,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-15T00:00:00.000Z",
    };
    const result = candidateDetailOutputSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts null objective", () => {
    const detail: CandidateDetail = {
      id: 3,
      name: "Ali",
      nameAr: "علي",
      email: "ali@example.com",
      phone: "+96550000001",
      gender: 1,
      objective: null,
      status: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-15T00:00:00.000Z",
    };
    const result = candidateDetailOutputSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("rejects missing nameAr", () => {
    const result = candidateDetailOutputSchema.safeParse({
      id: 1,
      name: "John",
      email: "john@example.com",
      phone: null,
      gender: null,
      objective: null,
      status: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-15T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const result = candidateDetailOutputSchema.safeParse({
      id: 1,
      name: "John",
      nameAr: "جون",
      email: "john@example.com",
      phone: null,
      gender: null,
      objective: null,
      status: "active",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-15T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listCandidates action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        candidate_id: 1,
        candidate_name: "Alice",
        candidate_email: "alice@example.com",
        candidate_phone: "+96511111111",
        candidate_status: 1,
        candidate_created_at: new Date("2025-01-01"),
      },
      {
        candidate_id: 2,
        candidate_name: "Bob",
        candidate_email: "bob@example.com",
        candidate_phone: null,
        candidate_status: 2,
        candidate_created_at: new Date("2025-01-02"),
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(2);

    const result = await listCandidates({});

    expect(mockRequireCapability).toHaveBeenCalledWith("staff", "candidate.search");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deleted: 0 }),
        orderBy: { candidate_id: "desc" },
        skip: 0,
        take: 20,
      }),
    );
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);

    // Verify shape mapping
    expect(result.items[0]).toEqual({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      phone: "+96511111111",
      status: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("applies search filter when q is provided", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listCandidates({ q: "developer" });

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.where.OR).toBeDefined();
    expect(findManyCall.where.OR).toContainEqual({
      candidate_name: { contains: "developer" },
    });
    expect(findManyCall.where.OR).toContainEqual({
      candidate_email: { contains: "developer" },
    });
  });

  it("applies status filter when status is provided", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listCandidates({ status: "3" });

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.where.candidate_status).toBe(3);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listCandidates({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("computes totalPages correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(55);

    const result = await listCandidates({ page: 1, limit: 20 });

    expect(result.totalPages).toBe(3); // ceil(55/20) = 3
  });

  it("returns empty result when no candidates match", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listCandidates({ q: "nonexistent" });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails (requireRoleCapability rejects)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listCandidates({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getCandidateById action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns candidate detail when found", async () => {
    const dbRow = {
      candidate_id: 42,
      candidate_name: "Charlie",
      candidate_name_ar: "تشارلي",
      candidate_email: "charlie@example.com",
      candidate_phone: "+96522222222",
      candidate_gender: 1,
      candidate_objective: "Senior developer",
      candidate_status: 1,
      candidate_created_at: new Date("2025-03-01"),
      candidate_updated_at: new Date("2025-03-15"),
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(dbRow);

    const result = await getCandidateById({ candidateId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("staff", "candidate.search");
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, deleted: 0 },
      }),
    );
    expect(result).not.toBeNull();
    expect(result!.id).toBe(42);
    expect(result!.name).toBe("Charlie");
    expect(result!.nameAr).toBe("تشارلي");
    expect(result!.email).toBe("charlie@example.com");
    expect(result!.phone).toBe("+96522222222");
    expect(result!.gender).toBe(1);
    expect(result!.objective).toBe("Senior developer");
    expect(result!.status).toBe(1);
    expect(result!.createdAt).toBe("2025-03-01T00:00:00.000Z");
    expect(result!.updatedAt).toBe("2025-03-15T00:00:00.000Z");
  });

  it("returns null when candidate not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    const result = await getCandidateById({ candidateId: 999 });

    expect(result).toBeNull();
  });

  it("returns null for deleted candidates", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    const result = await getCandidateById({ candidateId: 1 });

    expect(result).toBeNull();
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 1, deleted: 0 },
      }),
    );
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getCandidateById({ candidateId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});
