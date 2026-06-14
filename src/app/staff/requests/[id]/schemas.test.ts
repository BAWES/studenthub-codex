import { describe, it, expect } from "vitest";
import { getStaffRequestDetailSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getStaffRequestDetailSchema
// ---------------------------------------------------------------------------
describe("getStaffRequestDetailSchema", () => {
  it("accepts valid input", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: "req-uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(getStaffRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(getStaffRequestDetailSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects non-string requestUuid", () => {
    expect(getStaffRequestDetailSchema.safeParse({ requestUuid: 12345 }).success).toBe(false);
  });

  it("rejects null requestUuid", () => {
    expect(getStaffRequestDetailSchema.safeParse({ requestUuid: null }).success).toBe(false);
  });
});
