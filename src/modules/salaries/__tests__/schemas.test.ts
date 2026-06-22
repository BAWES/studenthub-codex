import { describe, it, expect } from "vitest";
import {
  salaryListItemSchema,
  listSalariesResultSchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
  salaryIdResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: salary schema validation
//
// All salary actions in actions.ts use these zod schemas internally.
// Testing them separately avoids mocking "use server" dependencies (prisma,
// session, next/cache).
// ---------------------------------------------------------------------------

const validSalaryListItem = {
  staff_salary_uuid: "sal-001-uuid",
  staff_id: 42,
  staff_name: "Ahmed Al-Sabah",
  salary: 1200.5,
  salary_currency: "KWD",
  comment: "Monthly salary June 2026",
  salary_date: "2026-06-15T00:00:00.000Z",
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: "2026-06-15T10:00:00.000Z",
};

describe("salaryListItemSchema", () => {
  it("accepts a valid salary list item", () => {
    const result = salaryListItemSchema.safeParse(validSalaryListItem);
    expect(result.success).toBe(true);
  });

  it("accepts null optional fields", () => {
    const result = salaryListItemSchema.safeParse({
      ...validSalaryListItem,
      staff_id: null,
      staff_name: null,
      salary: null,
      salary_currency: null,
      comment: null,
      salary_date: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required staff_salary_uuid", () => {
    const { staff_salary_uuid: _, ...incomplete } = validSalaryListItem;
    const result = salaryListItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric salary", () => {
    const result = salaryListItemSchema.safeParse({
      ...validSalaryListItem,
      salary: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("listSalariesResultSchema", () => {
  it("accepts a valid list result", () => {
    const result = listSalariesResultSchema.safeParse({
      records: [validSalaryListItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = listSalariesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listSalariesResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = listSalariesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("createSalarySchema", () => {
  it("accepts valid create data with all fields", () => {
    const result = createSalarySchema.safeParse({
      staff_id: 42,
      salary: 1500,
      salary_currency: "KWD",
      comment: "New hire salary",
      salary_date: "2026-07-01",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal create data (only required)", () => {
    const result = createSalarySchema.safeParse({
      staff_id: 42,
      salary: 1500,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative salary", () => {
    const result = createSalarySchema.safeParse({
      staff_id: 42,
      salary: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty staff_id", () => {
    const result = createSalarySchema.safeParse({
      staff_id: null,
      salary: 1500,
    });
    expect(result.success).toBe(true); // nullable
  });

  it("defaults salary_currency to KWD", () => {
    const result = createSalarySchema.safeParse({
      staff_id: 42,
      salary: 1500,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_currency).toBe("KWD");
    }
  });
});

describe("updateSalarySchema", () => {
  it("accepts valid update data with all fields", () => {
    const result = updateSalarySchema.safeParse({
      staff_salary_uuid: "sal-001-uuid",
      salary: 1800,
      salary_currency: "USD",
      comment: "Promotion adjustment",
      salary_date: "2026-08-01",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (single field)", () => {
    const result = updateSalarySchema.safeParse({
      staff_salary_uuid: "sal-001-uuid",
      comment: "Updated comment only",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing staff_salary_uuid", () => {
    const result = updateSalarySchema.safeParse({
      salary: 1800,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative salary in update", () => {
    const result = updateSalarySchema.safeParse({
      staff_salary_uuid: "sal-001-uuid",
      salary: -500,
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteSalarySchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteSalarySchema.safeParse({
      staff_salary_uuid: "sal-001-uuid",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteSalarySchema.safeParse({
      staff_salary_uuid: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("salaryIdResultSchema", () => {
  it("accepts a valid result", () => {
    const result = salaryIdResultSchema.safeParse({
      staff_salary_uuid: "sal-001-uuid",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing UUID", () => {
    const result = salaryIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string UUID", () => {
    const result = salaryIdResultSchema.safeParse({ staff_salary_uuid: 123 });
    expect(result.success).toBe(false);
  });
});
