import { describe, it, expect } from "vitest";
import {
  salaryItemSchema,
  listSalariesResultSchema,
  salaryActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// salaryItemSchema
// ---------------------------------------------------------------------------
describe("salaryItemSchema", () => {
  it("validates a complete salary item", () => {
    const result = salaryItemSchema.parse({
      staff_salary_uuid: "SAL-001",
      staff_name: "John Doe",
      salary: 2500,
      salary_currency: "KWD",
      comment: "Monthly",
      salary_date: new Date("2026-06-01"),
    });
    expect(result.staff_salary_uuid).toBe("SAL-001");
    expect(result.salary).toBe(2500);
  });

  it("accepts null fields", () => {
    const result = salaryItemSchema.parse({
      staff_salary_uuid: "SAL-002",
    });
    expect(result.staff_salary_uuid).toBe("SAL-002");
    expect(result.salary).toBeUndefined();
  });

  it("rejects missing staff_salary_uuid", () => {
    expect(salaryItemSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty staff_salary_uuid", () => {
    expect(
      salaryItemSchema.safeParse({ staff_salary_uuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listSalariesResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listSalariesResultSchema", () => {
  const validResult = {
    salaries: [
      {
        staff_salary_uuid: "SAL-001",
        staff_name: "John Doe",
        salary: 750.5,
        salary_currency: "KWD",
        comment: null,
        salary_date: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("validates a complete list result", () => {
    const result = listSalariesResultSchema.parse(validResult);
    expect(result.salaries).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("accepts empty salaries array", () => {
    expect(
      listSalariesResultSchema.safeParse({
        ...validResult,
        salaries: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing salaries", () => {
    const { salaries: _, ...rest } = validResult;
    expect(listSalariesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listSalariesResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listSalariesResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listSalariesResultSchema.safeParse({
        ...validResult,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// salaryActionResponseSchema
// ---------------------------------------------------------------------------
describe("salaryActionResponseSchema", () => {
  it("validates a valid response", () => {
    expect(
      salaryActionResponseSchema.safeParse({
        operation: "created",
        message: "Salary record created",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      salaryActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(
      salaryActionResponseSchema.safeParse({
        operation: "",
        message: "Done",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      salaryActionResponseSchema.safeParse({ operation: "created" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      salaryActionResponseSchema.safeParse({
        operation: "created",
        message: "",
      }).success,
    ).toBe(false);
  });
});
