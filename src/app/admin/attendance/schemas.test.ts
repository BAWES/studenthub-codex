import { describe, it, expect } from "vitest";
import {
  employeeOptionSchema,
  listEmployeeOptionsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// employeeOptionSchema
// ---------------------------------------------------------------------------
describe("employeeOptionSchema", () => {
  const validOption = { uuid: "emp-123", name: "John Doe" };

  it("accepts valid input", () => {
    expect(employeeOptionSchema.safeParse(validOption).success).toBe(true);
  });

  it("accepts uuid as any string", () => {
    expect(
      employeeOptionSchema.safeParse({ uuid: "", name: "Jane" }).success,
    ).toBe(true);
  });

  it("accepts name as any string", () => {
    expect(
      employeeOptionSchema.safeParse({ uuid: "emp-1", name: "" }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validOption;
    expect(employeeOptionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validOption;
    expect(employeeOptionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(employeeOptionSchema.safeParse({ uuid: 123, name: true }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEmployeeOptionsResultSchema
// ---------------------------------------------------------------------------
describe("listEmployeeOptionsResultSchema", () => {
  it("accepts a list of employee options", () => {
    expect(
      listEmployeeOptionsResultSchema.safeParse([
        { uuid: "emp-1", name: "Alice" },
        { uuid: "emp-2", name: "Bob" },
      ]).success,
    ).toBe(true);
  });

  it("accepts empty array", () => {
    expect(listEmployeeOptionsResultSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(listEmployeeOptionsResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects array with invalid items", () => {
    expect(
      listEmployeeOptionsResultSchema.safeParse([{ uuid: "emp-1" }]).success,
    ).toBe(false);
  });
});
