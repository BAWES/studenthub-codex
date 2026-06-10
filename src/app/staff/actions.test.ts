import { describe, it, expect } from "vitest";
import { getStaffWorkspaceSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

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

  it("rejects null staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: null });
    expect(result.success).toBe(false);
  });

  it("rejects boolean staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: true });
    expect(result.success).toBe(false);
  });

  it("rejects array staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: [1, 2] });
    expect(result.success).toBe(false);
  });

  it("rejects object staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: { id: 1 } });
    expect(result.success).toBe(false);
  });

  it("accepts a large positive integer staffId", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 999999999 });
    expect(result.success).toBe(true);
  });

  it("rejects a string that looks like a number (no coercion)", () => {
    // z.number() does not coerce strings — this must fail
    const result = getStaffWorkspaceSchema.safeParse({ staffId: "42" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty staffId object field", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: undefined });
    expect(result.success).toBe(false);
  });

  it("provides a readable error message for non-number", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("staffId must be a number");
    }
  });

  it("provides a readable error message for float", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: 3.14 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("staffId must be an integer");
    }
  });

  it("provides a readable error message for negative", () => {
    const result = getStaffWorkspaceSchema.safeParse({ staffId: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("staffId must be positive");
    }
  });
});
