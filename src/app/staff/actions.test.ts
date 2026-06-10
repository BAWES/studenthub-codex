import { describe, it, expect } from "vitest";
import { getStaffWorkspaceSchema } from "./schemas";

describe("getStaffWorkspaceSchema", () => {
  it("accepts a valid positive integer staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects a non-integer staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects a zero staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a missing staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a float staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 3.14 });
    expect(result.success).toBe(false);
  });
});
