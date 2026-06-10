import { describe, it, expect } from "vitest";
import { getWorkspaceDataSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getWorkspaceDataSchema
// ---------------------------------------------------------------------------

describe("getWorkspaceDataSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getWorkspaceDataSchema.safeParse({
      contactUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty string UUID", () => {
    const result = getWorkspaceDataSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    const result = getWorkspaceDataSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null contactUuid", () => {
    const result = getWorkspaceDataSchema.safeParse({ contactUuid: null });
    expect(result.success).toBe(false);
  });

  it("rejects numeric contactUuid", () => {
    const result = getWorkspaceDataSchema.safeParse({ contactUuid: 12345 });
    expect(result.success).toBe(false);
  });
});
