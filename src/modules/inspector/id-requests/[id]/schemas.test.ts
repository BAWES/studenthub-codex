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

  it("rejects both success and error", () => {
    expect(
      inspectorIdRequestActionResultSchema.safeParse({
        success: true,
        error: "Something",
      }).success
    ).toBe(false);
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