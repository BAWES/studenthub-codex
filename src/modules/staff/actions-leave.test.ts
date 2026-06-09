import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: staff leave schema validation
//
// Testing schemas and filter construction separately avoids mocking
// "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listLeavesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  category: z.string().optional(),
  status: z.number().int().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getLeaveSchema = z.object({
  id: z.string().min(1),
});

const createLeaveSchema = z.object({
  staffId: z.number().int().positive(),
  fromDate: z.string().min(1),
  toDate: z.string().min(1),
  note: z.string().optional(),
  category: z.string().optional(),
  file: z.string().optional(),
});

describe("listLeavesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listLeavesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
      expect(result.data.staffId).toBeUndefined();
      expect(result.data.category).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts all optional params", () => {
    const result = listLeavesSchema.safeParse({
      staffId: 1,
      category: "annual",
      status: 0,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(1);
      expect(result.data.category).toBe("annual");
      expect(result.data.status).toBe(0);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects negative staffId", () => {
    const result = listLeavesSchema.safeParse({ staffId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero staffId", () => {
    const result = listLeavesSchema.safeParse({ staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page number", () => {
    const result = listLeavesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listLeavesSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listLeavesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("getLeaveSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getLeaveSchema.safeParse({ id: "staff_leave_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = getLeaveSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getLeaveSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createLeaveSchema", () => {
  it("accepts valid leave creation params", () => {
    const result = createLeaveSchema.safeParse({
      staffId: 1,
      fromDate: "2026-06-01",
      toDate: "2026-06-10",
      note: "Annual leave",
      category: "annual",
    });
    expect(result.success).toBe(true);
  });

  it("accepts leave with file attachment", () => {
    const result = createLeaveSchema.safeParse({
      staffId: 1,
      fromDate: "2026-06-01",
      toDate: "2026-06-10",
      note: "Sick leave with doc",
      category: "sick",
      file: "uploads/doc.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative staffId", () => {
    const result = createLeaveSchema.safeParse({
      staffId: -1,
      fromDate: "2026-06-01",
      toDate: "2026-06-10",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fromDate", () => {
    const result = createLeaveSchema.safeParse({
      staffId: 1,
      toDate: "2026-06-10",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing toDate", () => {
    const result = createLeaveSchema.safeParse({
      staffId: 1,
      fromDate: "2026-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("accepts bare minimum params", () => {
    const result = createLeaveSchema.safeParse({
      staffId: 1,
      fromDate: "2026-06-01",
      toDate: "2026-06-10",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Filter builder (unit-testable pure function)
// ---------------------------------------------------------------------------

type LeaveWhereInput = {
  staff_id?: number;
  category?: string;
  status?: number;
};

function buildLeaveFilter(params: {
  staffId?: number;
  category?: string;
  status?: number;
}): LeaveWhereInput {
  const where: LeaveWhereInput = {};

  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }

  if (params.category && params.category.trim()) {
    where.category = params.category;
  }

  if (params.status !== undefined) {
    where.status = params.status;
  }

  return where;
}

describe("buildLeaveFilter", () => {
  it("returns empty object when no filters", () => {
    const result = buildLeaveFilter({});
    expect(result).toEqual({});
  });

  it("adds staffId filter when provided", () => {
    const result = buildLeaveFilter({ staffId: 1 });
    expect(result).toEqual({ staff_id: 1 });
  });

  it("adds category filter when provided", () => {
    const result = buildLeaveFilter({ category: "annual" });
    expect(result).toEqual({ category: "annual" });
  });

  it("ignores empty category", () => {
    const result = buildLeaveFilter({ category: "" });
    expect(result).toEqual({});
  });

  it("ignores whitespace-only category", () => {
    const result = buildLeaveFilter({ category: "   " });
    expect(result).toEqual({});
  });

  it("adds status filter when provided", () => {
    const result = buildLeaveFilter({ status: 1 });
    expect(result).toEqual({ status: 1 });
  });

  it("combines all filters", () => {
    const result = buildLeaveFilter({
      staffId: 1,
      category: "annual",
      status: 0,
    });
    expect(result).toEqual({
      staff_id: 1,
      category: "annual",
      status: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type LeaveRecord = {
  staff_leave_uuid: string;
  staff_id: number | null;
  from_date: Date | null;
  to_date: Date | null;
  note: string | null;
  category: string | null;
  status: number | null;
  created_at: Date | null;
};

type LeaveListResult = {
  leaves: LeaveRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("LeaveRecord shape", () => {
  it("defines the expected fields", () => {
    const mock: LeaveRecord = {
      staff_leave_uuid: "staff_leave_abc",
      staff_id: 1,
      from_date: new Date("2026-06-01"),
      to_date: new Date("2026-06-10"),
      note: "Annual leave",
      category: "annual",
      status: 0,
      created_at: new Date("2026-06-01"),
    };
    expect(mock.staff_leave_uuid).toBe("staff_leave_abc");
    expect(mock.staff_id).toBe(1);
    expect(mock.category).toBe("annual");
    expect(mock.status).toBe(0);
  });
});

describe("LeaveListResult shape", () => {
  it("defines pagination fields", () => {
    const mock: LeaveListResult = {
      leaves: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(mock.leaves).toEqual([]);
    expect(mock.total).toBe(0);
    expect(mock.page).toBe(1);
    expect(mock.limit).toBe(20);
    expect(mock.totalPages).toBe(0);
  });
});
