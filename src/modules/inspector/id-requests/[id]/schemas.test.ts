import { describe, it, expect } from "vitest";
import {
  inspectorIdRequestActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// inspectorIdRequestActionResultSchema  (z.union)
// ---------------------------------------------------------------------------

describe("inspectorIdRequestActionResultSchema", () => {
  it("accepts success result", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({ error: "Something went wrong" });
    expect(r.success).toBe(true);
  });

  it("accepts both success and error (union short-circuits on success)", () => {
    // z.union short-circuits on the first matching variant.
    // {success: true} matches the first member, so it passes.
    const r = inspectorIdRequestActionResultSchema.safeParse({ success: true, error: "also error" });
    expect(r.success).toBe(true);
  });

  it("rejects empty object", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects success: false", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects success with non-boolean", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({ success: "true" });
    expect(r.success).toBe(false);
  });

  it("rejects error with non-string", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({ error: true });
    expect(r.success).toBe(false);
  });
});
