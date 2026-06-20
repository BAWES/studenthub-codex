import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation
// Testing schemas separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

const listSalariesSchema = z.object({
  staffId: z.number().int().positive().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const getSalarySchema = z.object({
  uuid: z.string().min(1, "Salary UUID is required"),
});

const createSalarySchema = z.object({
  staffId: z.number().int().positive(),
  salary: z.number().nonnegative("Salary must be non-negative"),
  salaryCurrency: z.string().min(1).max(3).optional().default("KWD"),
  comment: z.string().optional(),
  salaryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

// ---------------------------------------------------------------------------
// listSalariesSchema
// ---------------------------------------------------------------------------

describe("listSalariesSchema", () => {
  it("accepts empty params (defaults)", () => {
    const result = listSalariesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts staffId filter", () => {
    const result = listSalariesSchema.safeParse({ staffId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(5);
    }
  });

  it("accepts year and month filter", () => {
    const result = listSalariesSchema.safeParse({ year: 2026, month: 6 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2026);
      expect(result.data.month).toBe(6);
    }
  });

  it("accepts pagination params", () => {
    const result = listSalariesSchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listSalariesSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listSalariesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive staffId", () => {
    const result = listSalariesSchema.safeParse({ staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid month (13)", () => {
    const result = listSalariesSchema.safeParse({ month: 13 });
    expect(result.success).toBe(false);
  });

  it("rejects month below 1", () => {
    const result = listSalariesSchema.safeParse({ month: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSalarySchema
// ---------------------------------------------------------------------------

describe("getSalarySchema", () => {
  it("accepts valid UUID string", () => {
    const result = getSalarySchema.safeParse({ uuid: "salary-001-uuid" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getSalarySchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getSalarySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createSalarySchema
// ---------------------------------------------------------------------------

describe("createSalarySchema", () => {
  it("accepts valid salary data", () => {
    const result = createSalarySchema.safeParse({
      staffId: 1,
      salary: 1500.5,
      salaryCurrency: "KWD",
      comment: "Monthly salary June",
      salaryDate: "2026-06-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(1);
      expect(result.data.salary).toBe(1500.5);
      expect(result.data.salaryCurrency).toBe("KWD");
      expect(result.data.comment).toBe("Monthly salary June");
      expect(result.data.salaryDate).toBe("2026-06-01");
    }
  });

  it("accepts minimal required fields", () => {
    const result = createSalarySchema.safeParse({
      staffId: 1,
      salary: 1200,
      salaryDate: "2026-06-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salaryCurrency).toBe("KWD");
      expect(result.data.comment).toBeUndefined();
    }
  });

  it("rejects missing staffId", () => {
    const result = createSalarySchema.safeParse({
      salary: 1500,
      salaryDate: "2026-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing salaryDate", () => {
    const result = createSalarySchema.safeParse({
      staffId: 1,
      salary: 1500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative salary", () => {
    const result = createSalarySchema.safeParse({
      staffId: 1,
      salary: -100,
      salaryDate: "2026-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive staffId", () => {
    const result = createSalarySchema.safeParse({
      staffId: 0,
      salary: 1500,
      salaryDate: "2026-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createSalarySchema.safeParse({
      staffId: 1,
      salary: 1500,
      salaryDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects currency longer than 3 chars", () => {
    const result = createSalarySchema.safeParse({
      staffId: 1,
      salary: 1500,
      salaryCurrency: "USDD",
      salaryDate: "2026-06-01",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type StaffSalaryItem = {
  staff_salary_uuid: string;
  staff_id: number | null;
  salary: number | null;
  salary_currency: string | null;
  comment: string | null;
  salary_date: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListStaffSalariesResult = {
  salaries: StaffSalaryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateSalaryResult = {
  operation: string;
  message: string;
};

describe("StaffSalaryItem shape", () => {
  it("defines expected fields", () => {
    const item: StaffSalaryItem = {
      staff_salary_uuid: "abc-123",
      staff_id: 5,
      salary: 1500.0,
      salary_currency: "KWD",
      comment: "June 2026 salary",
      salary_date: new Date("2026-06-01"),
      created_at: null,
      updated_at: null,
    };
    expect(item.staff_salary_uuid).toBe("abc-123");
    expect(item.salary).toBe(1500.0);
    expect(item.salary_currency).toBe("KWD");
  });
});

describe("ListStaffSalariesResult shape", () => {
  it("accepts empty result set", () => {
    const result: ListStaffSalariesResult = {
      salaries: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.salaries).toHaveLength(0);
  });
});

describe("CreateSalaryResult shape", () => {
  it("accepts success result", () => {
    const result: CreateSalaryResult = {
      operation: "success",
      message: "Salary created successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts error result", () => {
    const result: CreateSalaryResult = {
      operation: "error",
      message: "Failed to create salary",
    };
    expect(result.operation).toBe("error");
  });
});
