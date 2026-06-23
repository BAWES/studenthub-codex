import { describe, it, expect } from "vitest";
import {
  employeeOptionSchema,
  listEmployeeOptionsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// employeeOptionSchema
// ---------------------------------------------------------------------------
describe("employeeOptionSchema", () => {
  const validOption = { uuid: "abc-123", name: "John Doe" };

  it("accepts a valid employee option", () => {
    expect(employeeOptionSchema.safeParse(validOption).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validOption;
    expect(employeeOptionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    expect(employeeOptionSchema.safeParse({ ...validOption, uuid: 123 }).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validOption;
    expect(employeeOptionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for name", () => {
    expect(employeeOptionSchema.safeParse({ ...validOption, name: 456 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEmployeeOptionsResultSchema (array)
// ---------------------------------------------------------------------------
describe("listEmployeeOptionsResultSchema", () => {
  it("accepts a valid array of employee options", () => {
    expect(
      listEmployeeOptionsResultSchema.safeParse([
        { uuid: "a-1", name: "Alice" },
        { uuid: "a-2", name: "Bob" },
      ]).success,
    ).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(listEmployeeOptionsResultSchema.safeParse([]).success).toBe(true);
  });

  it("rejects invalid items", () => {
    expect(listEmployeeOptionsResultSchema.safeParse([{ uuid: "a-1" }]).success).toBe(false);
  });
});
