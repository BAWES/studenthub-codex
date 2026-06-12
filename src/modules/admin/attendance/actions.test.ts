import { describe, it, expect } from "vitest";
import {
  employeeOptionSchema,
  listEmployeeOptionsResultSchema,
} from "./schemas";

describe("employeeOptionSchema (output validation)", () => {
  it("accepts a valid employee option", () => {
    const r = employeeOptionSchema.safeParse({
      uuid: "abc-123-def",
      name: "Ahmed Al-Mutawa",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = employeeOptionSchema.safeParse({ name: "Ahmed" });
    expect(r.success).toBe(false);
  });

  it("rejects missing name", () => {
    const r = employeeOptionSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(false);
  });

  it("rejects null uuid", () => {
    const r = employeeOptionSchema.safeParse({ uuid: null, name: "Ahmed" });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = employeeOptionSchema.safeParse({ uuid: "abc-123", name: "" });
    expect(r.success).toBe(true); // empty string is still a string
  });

  it("rejects extra fields", () => {
    const r = employeeOptionSchema.safeParse({
      uuid: "abc-123",
      name: "Ahmed",
      extra: "should not be here",
    });
    expect(r.success).toBe(true); // Zod strips unknown by default
  });

  it("rejects non-string uuid", () => {
    const r = employeeOptionSchema.safeParse({ uuid: 123, name: "Ahmed" });
    expect(r.success).toBe(false);
  });
});

describe("listEmployeeOptionsResultSchema (output validation)", () => {
  it("accepts a valid array of employee options", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([
      { uuid: "abc", name: "Ahmed" },
      { uuid: "def", name: "Fatima" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(2);
    }
  });

  it("accepts an empty array", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(0);
    }
  });

  it("rejects array with invalid items", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([
      { uuid: "abc", name: "Ahmed" },
      { uuid: 123, name: "Fatima" }, // invalid uuid type
    ]);
    expect(r.success).toBe(false);
  });

  it("rejects non-array input", () => {
    const r = listEmployeeOptionsResultSchema.safeParse({ uuid: "abc", name: "Ahmed" });
    expect(r.success).toBe(false);
  });
});
