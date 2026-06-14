import { describe, it, expect } from "vitest";
import { inspectorIdRequestActionResultSchema } from "./schemas";

// ---------------------------------------------------------------------------
// inspectorIdRequestActionResultSchema
// ---------------------------------------------------------------------------
describe("inspectorIdRequestActionResultSchema", () => {
  it("accepts success result", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({
      error: "Request not found",
    });
    expect(r.success).toBe(true);
  });

  it("accepts both success and error (union picks first matching branch)", () => {
    // z.union silently strips unknown keys, so { success, error } matches
    // the first branch { success: z.literal(true) }
    const r = inspectorIdRequestActionResultSchema.safeParse({
      success: true,
      error: "Something",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ success: true });
    }
  });

  it("rejects neither", () => {
    expect(inspectorIdRequestActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid value type", () => {
    expect(
      inspectorIdRequestActionResultSchema.safeParse({ success: "yes" }).success
    ).toBe(false);
  });
});