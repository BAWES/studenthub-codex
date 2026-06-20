import { describe, it, expect } from "vitest";
import { getStaffRequestDetailSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getStaffRequestDetailSchema
// ---------------------------------------------------------------------------
describe("getStaffRequestDetailSchema", () => {
  const valid = { requestUuid: "abc-123" };

  it("accepts valid UUID", () => {
    expect(getStaffRequestDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: "" }).success
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getStaffRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: 123 }).success
    ).toBe(false);
  });
});
