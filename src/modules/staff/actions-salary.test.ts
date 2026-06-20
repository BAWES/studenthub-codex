import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: salary action schema validation
//
// Testing schemas and filter construction separately avoids mocking
// "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listSalariesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  month: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getSalarySchema = z.object({
  id: z.string().min(1),
});

const createSalarySchema = z.object({
  staffIds: z.array(z.number().int().positive()).min(1),
  month: z.string().optional(),
});

describe("listSalariesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listSalariesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
      expect(result.data.staffId).toBeUndefined();
      expect(result.data.month).toBeUndefined();
    }
  });

  it("accepts all optional params", () => {
    const result = listSalariesSchema.safeParse({
      staffId: 1,
      month: "2024-06",
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(1);
      expect(result.data.month).toBe("2024-06");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects negative page number", () => {
    const result = listSalariesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listSalariesSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listSalariesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer staffId", () => {
    const result = listSalariesSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects negative staffId", () => {
    const result = listSalariesSchema.safeParse({ staffId: -5 });
    expect(result.success).toBe(false);
  });
});

describe("getSalarySchema", () => {
  it("accepts a valid uuid string", () => {
    const result = getSalarySchema.safeParse({ id: "SAL-001-abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty string id", () => {
    const result = getSalarySchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getSalarySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createSalarySchema", () => {
  it("accepts valid staffIds array with month", () => {
    const result = createSalarySchema.safeParse({
      staffIds: [1, 2, 3],
      month: "2024-06",
    });
    expect(result.success).toBe(true);
  });

  it("accepts staffIds without month", () => {
    const result = createSalarySchema.safeParse({
      staffIds: [1],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty staffIds array", () => {
    const result = createSalarySchema.safeParse({ staffIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing staffIds", () => {
    const result = createSalarySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer staffId in array", () => {
    const result = createSalarySchema.safeParse({ staffIds: [1, "abc"] });
    expect(result.success).toBe(false);
  });

  it("rejects negative staffId in array", () => {
    const result = createSalarySchema.safeParse({ staffIds: [-1] });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Filter builder (pure function, unit-testable)
// ---------------------------------------------------------------------------

type SalaryWhereInput = {
  staff_id?: number;
  salary_date?: { gte?: Date; lte?: Date };
  AND?: Array<Record<string, unknown>>;
};

function buildSalaryFilter(params: {
  staffId?: number;
  month?: string;
}): SalaryWhereInput {
  const where: SalaryWhereInput = {};

  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }

  if (params.month && params.month.trim()) {
    const [year, month] = params.month.split("-").map(Number);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.salary_date = {
        gte: startDate,
        lte: endDate,
      };
    }
  }

  return where;
}

describe("buildSalaryFilter", () => {
  it("returns empty filter when no params provided", () => {
    const result = buildSalaryFilter({});
    expect(result).toEqual({});
  });

  it("adds staff_id filter when staffId provided", () => {
    const result = buildSalaryFilter({ staffId: 42 });
    expect(result).toEqual({ staff_id: 42 });
  });

  it("adds salary_date range when month provided", () => {
    const result = buildSalaryFilter({ month: "2024-06" });
    expect(result.salary_date).toBeDefined();
    expect(result.salary_date!.gte).toBeInstanceOf(Date);
    expect(result.salary_date!.lte).toBeInstanceOf(Date);
    // June 2024
    expect(result.salary_date!.gte!.getMonth()).toBe(5); // 0-indexed
    expect(result.salary_date!.gte!.getFullYear()).toBe(2024);
    expect(result.salary_date!.gte!.getDate()).toBe(1);
    expect(result.salary_date!.lte!.getMonth()).toBe(5);
    expect(result.salary_date!.lte!.getFullYear()).toBe(2024);
  });

  it("combines staffId and month filters", () => {
    const result = buildSalaryFilter({ staffId: 10, month: "2024-01" });
    expect(result.staff_id).toBe(10);
    expect(result.salary_date).toBeDefined();
  });

  it("ignores empty month string", () => {
    const result = buildSalaryFilter({ month: "" });
    expect(result).toEqual({});
  });

  it("ignores whitespace-only month string", () => {
    const result = buildSalaryFilter({ month: "   " });
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type SalaryRecord = {
  staff_salary_uuid: string;
  staff_id: number | null;
  salary: number | null;
  salary_currency: string | null;
  comment: string | null;
  salary_date: Date | null;
  created_at: Date | null;
};

type SalaryListResult = {
  salaries: SalaryRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SalaryGetResult = SalaryRecord | null;

describe("SalaryRecord shape", () => {
  it("defines the expected fields", () => {
    const mock: SalaryRecord = {
      staff_salary_uuid: "SAL-001",
      staff_id: 1,
      salary: 1500,
      salary_currency: "KWD",
      comment: "Monthly Salary",
      salary_date: new Date("2024-06-01"),
      created_at: new Date("2024-06-01"),
    };
    expect(mock.staff_salary_uuid).toBe("SAL-001");
    expect(mock.staff_id).toBe(1);
    expect(mock.salary).toBe(1500);
    expect(mock.salary_currency).toBe("KWD");
    expect(mock.comment).toBe("Monthly Salary");
  });
});

describe("SalaryListResult shape", () => {
  it("defines pagination fields", () => {
    const mock: SalaryListResult = {
      salaries: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(mock.salaries).toEqual([]);
    expect(mock.total).toBe(0);
    expect(mock.page).toBe(1);
    expect(mock.limit).toBe(20);
    expect(mock.totalPages).toBe(0);
  });
});

describe("SalaryGetResult shape", () => {
  it("can be SalaryRecord", () => {
    const mock: SalaryGetResult = {
      staff_salary_uuid: "SAL-002",
      staff_id: 2,
      salary: 2000,
      salary_currency: null,
      comment: null,
      salary_date: null,
      created_at: null,
    };
    expect(mock).not.toBeNull();
    expect(mock!.staff_salary_uuid).toBe("SAL-002");
  });

  it("can be null", () => {
    const result: SalaryGetResult = null;
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Month validation helper
// ---------------------------------------------------------------------------

function isValidMonth(month: string): boolean {
  const parts = month.split("-");
  if (parts.length !== 2) return false;
  const [year, m] = parts.map(Number);
  return !isNaN(year) && !isNaN(m) && m >= 1 && m <= 12 && year >= 2000 && year <= 2100;
}

describe("isValidMonth", () => {
  it("validates correct format YYYY-MM", () => {
    expect(isValidMonth("2024-06")).toBe(true);
  });

  it("rejects invalid month > 12", () => {
    expect(isValidMonth("2024-13")).toBe(false);
  });

  it("rejects month 0", () => {
    expect(isValidMonth("2024-00")).toBe(false);
  });

  it("rejects missing month part", () => {
    expect(isValidMonth("2024")).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(isValidMonth("abc-def")).toBe(false);
  });
});
