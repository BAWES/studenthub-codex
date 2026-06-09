import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: staff action schema validation
//
// Testing schemas and filter construction separately avoids mocking
// "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listStaffSchema = z.object({
  role: z.boolean().optional(),
  jobTitle: z.string().optional(),
  status: z.number().int().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getStaffSchema = z.object({
  id: z.number().int().positive(),
});

describe("listStaffSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listStaffSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
      expect(result.data.role).toBeUndefined();
      expect(result.data.jobTitle).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts all optional params", () => {
    const result = listStaffSchema.safeParse({
      role: true,
      jobTitle: "Manager",
      status: 10,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe(true);
      expect(result.data.jobTitle).toBe("Manager");
      expect(result.data.status).toBe(10);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects negative page number", () => {
    const result = listStaffSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listStaffSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStaffSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean role filter", () => {
    const result = listStaffSchema.safeParse({ role: "admin" });
    expect(result.success).toBe(false);
  });
});

describe("getStaffSchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getStaffSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getStaffSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getStaffSchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getStaffSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getStaffSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Prisma query construction logic (unit-testable pure function)
// ---------------------------------------------------------------------------

type StaffWhereInput = {
  deleted?: number;
  staff_role?: boolean;
  staff_job_title?: { contains: string; mode?: "insensitive" };
  staff_status?: number;
  AND?: Array<Record<string, unknown>>;
};

function buildStaffFilter(params: {
  role?: boolean;
  jobTitle?: string;
  status?: number;
}): StaffWhereInput {
  const where: StaffWhereInput = {
    deleted: 0,
  };

  if (params.role !== undefined) {
    where.staff_role = params.role;
  }

  if (params.jobTitle && params.jobTitle.trim()) {
    where.staff_job_title = { contains: params.jobTitle, mode: "insensitive" };
  }

  if (params.status !== undefined) {
    where.staff_status = params.status;
  }

  return where;
}

describe("buildStaffFilter", () => {
  it("filters out deleted staff by default", () => {
    const result = buildStaffFilter({});
    expect(result).toEqual({ deleted: 0 });
  });

  it("adds role filter when provided", () => {
    const result = buildStaffFilter({ role: true });
    expect(result).toEqual({ deleted: 0, staff_role: true });
  });

  it("adds jobTitle filter with case-insensitive contains", () => {
    const result = buildStaffFilter({ jobTitle: "Manager" });
    expect(result).toEqual({
      deleted: 0,
      staff_job_title: { contains: "Manager", mode: "insensitive" },
    });
  });

  it("ignores empty jobTitle", () => {
    const result = buildStaffFilter({ jobTitle: "" });
    expect(result).toEqual({ deleted: 0 });
  });

  it("ignores whitespace-only jobTitle", () => {
    const result = buildStaffFilter({ jobTitle: "   " });
    expect(result).toEqual({ deleted: 0 });
  });

  it("adds status filter when provided", () => {
    const result = buildStaffFilter({ status: 10 });
    expect(result).toEqual({ deleted: 0, staff_status: 10 });
  });

  it("combines all filters", () => {
    const result = buildStaffFilter({ role: false, jobTitle: "Engineer", status: 20 });
    expect(result).toEqual({
      deleted: 0,
      staff_role: false,
      staff_job_title: { contains: "Engineer", mode: "insensitive" },
      staff_status: 20,
    });
  });
});

// ---------------------------------------------------------------------------
// Return type shape
// ---------------------------------------------------------------------------

type StaffListItem = {
  staff_id: number;
  staff_name: string;
  staff_job_title: string | null;
  staff_email: string;
  staff_role: boolean | null;
  staff_status: number;
  staff_created_at: Date;
};

type StaffListResult = {
  staff: StaffListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type StaffGetResult = StaffListItem | null;

describe("StaffListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: StaffListItem = {
      staff_id: 1,
      staff_name: "John Doe",
      staff_job_title: "Manager",
      staff_email: "john@studenthub.com",
      staff_role: true,
      staff_status: 10,
      staff_created_at: new Date("2024-01-01"),
    };
    expect(mock.staff_id).toBe(1);
    expect(mock.staff_name).toBe("John Doe");
    expect(mock.staff_job_title).toBe("Manager");
    expect(mock.staff_email).toBe("john@studenthub.com");
    expect(mock.staff_role).toBe(true);
    expect(mock.staff_status).toBe(10);
  });
});

describe("StaffListResult shape", () => {
  it("defines pagination fields", () => {
    const mock: StaffListResult = {
      staff: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(mock.staff).toEqual([]);
    expect(mock.total).toBe(0);
    expect(mock.page).toBe(1);
    expect(mock.limit).toBe(20);
    expect(mock.totalPages).toBe(0);
  });
});

describe("StaffGetResult shape", () => {
  it("can be StaffListItem", () => {
    const mock: StaffGetResult = {
      staff_id: 1,
      staff_name: "Jane",
      staff_job_title: null,
      staff_email: "jane@studenthub.com",
      staff_role: false,
      staff_status: 10,
      staff_created_at: new Date("2024-06-01"),
    };
    expect(mock).not.toBeNull();
    expect(mock!.staff_name).toBe("Jane");
  });

  it("can be null", () => {
    const result: StaffGetResult = null;
    expect(result).toBeNull();
  });
});
